import { beforeEach, describe, expect, it, vi } from "vitest";

const enablePushNotifications = vi.hoisted(() => vi.fn());
const getPushNotificationsState = vi.hoisted(() => vi.fn());
const unsubscribeFromPushNotifications = vi.hoisted(() => vi.fn());
const setNotificationSetup = vi.hoisted(() => vi.fn());
const removeNotificationSetup = vi.hoisted(() => vi.fn());
const toPushSubscriptionRequest = vi.hoisted(() => vi.fn());
const showToast = vi.hoisted(() => vi.fn());

vi.mock("@/utils/notifications/notifications", () => ({
  enablePushNotifications,
  getPushNotificationsState,
  isPushNotificationSupported: () => true,
  unsubscribeFromPushNotifications,
}));

vi.mock("@/services/secured/notification-setup/notificationSetup", () => ({
  removeNotificationSetup,
  setNotificationSetup,
  toPushSubscriptionRequest,
}));

vi.mock("@/stores/i18n/i18n", () => ({
  translate: (key: string) => key,
}));

vi.mock("@/stores/toast/toast", () => ({
  showToast,
}));

const SUBSCRIPTION = { endpoint: "https://fcm/endpoint" };
const PAYLOAD = { auth: "auth", endpoint: SUBSCRIPTION.endpoint, p256dh: "key" };

const importStore = async () => {
  vi.resetModules();
  vi.stubEnv("VITE_VAPID_PUBLIC_KEY", "BJ-abc_123");
  return await import("@/stores/push-notifications/pushNotifications");
};

const deferred = <TValue>() => {
  let resolve!: (value: TValue) => void;
  const promise = new Promise<TValue>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe("togglePushNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.localStorage.clear();
    toPushSubscriptionRequest.mockReturnValue(PAYLOAD);
    setNotificationSetup.mockResolvedValue(undefined);
    removeNotificationSetup.mockResolvedValue(undefined);
  });

  it("checks the box before the subscription round-trip finishes", async () => {
    const subscribing = deferred<{ subscription: typeof SUBSCRIPTION }>();
    enablePushNotifications.mockReturnValue(subscribing.promise);

    const { pushNotificationsEnabled, togglePushNotifications } =
      await importStore();

    const toggling = togglePushNotifications(true);

    expect(pushNotificationsEnabled()).toBe(true);

    subscribing.resolve({ subscription: SUBSCRIPTION });
    await toggling;

    expect(pushNotificationsEnabled()).toBe(true);
    expect(setNotificationSetup).toHaveBeenCalledWith(PAYLOAD);
  });

  it("unchecks the box again when the device refuses to subscribe", async () => {
    enablePushNotifications.mockResolvedValue({ subscription: null });

    const { pushNotificationsEnabled, togglePushNotifications } =
      await importStore();

    await togglePushNotifications(true);

    expect(pushNotificationsEnabled()).toBe(false);
    expect(setNotificationSetup).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      "GLOBAL.NAVIGATION.NOTIFICATIONS_UNAVAILABLE",
    );
  });

  it("unchecks the box before the removal round-trip finishes and forgets the device", async () => {
    const unsubscribing = deferred<string>();
    unsubscribeFromPushNotifications.mockReturnValue(unsubscribing.promise);
    enablePushNotifications.mockResolvedValue({ subscription: SUBSCRIPTION });

    const { pushNotificationsEnabled, togglePushNotifications } =
      await importStore();

    await togglePushNotifications(true);
    expect(pushNotificationsEnabled()).toBe(true);

    const toggling = togglePushNotifications(false);

    expect(pushNotificationsEnabled()).toBe(false);

    unsubscribing.resolve(SUBSCRIPTION.endpoint);
    await toggling;

    expect(pushNotificationsEnabled()).toBe(false);
    expect(removeNotificationSetup).toHaveBeenCalledWith({
      endpoint: SUBSCRIPTION.endpoint,
    });
  });

  it("keeps the box unchecked when the removal never reaches the server", async () => {
    enablePushNotifications.mockResolvedValue({ subscription: SUBSCRIPTION });
    unsubscribeFromPushNotifications.mockResolvedValue(SUBSCRIPTION.endpoint);
    removeNotificationSetup.mockRejectedValue(new Error("offline"));

    const { pushNotificationsEnabled, togglePushNotifications } =
      await importStore();

    await togglePushNotifications(true);
    await togglePushNotifications(false).catch(() => {});

    expect(pushNotificationsEnabled()).toBe(false);
    expect(globalThis.localStorage.getItem("k9x_push_notifications_enabled")).toBe(
      "false",
    );
  });
});
