import { beforeEach, describe, expect, it, vi } from "vitest";

const enablePushNotifications = vi.hoisted(() => vi.fn());
const getPushNotificationsState = vi.hoisted(() => vi.fn());
const setNotificationSetup = vi.hoisted(() => vi.fn());
const setNotificationsEnabled = vi.hoisted(() => vi.fn());
const toPushSubscriptionRequest = vi.hoisted(() => vi.fn());
const getAuthUser = vi.hoisted(() => vi.fn());
const showToast = vi.hoisted(() => vi.fn());

vi.mock("@/utils/notifications/notifications", () => ({
  enablePushNotifications,
  getPushNotificationsState,
  isPushNotificationSupported: () => true,
}));

vi.mock("@/services/secured/notification-setup/notificationSetup", () => ({
  setNotificationSetup,
  setNotificationsEnabled,
  toPushSubscriptionRequest,
}));

vi.mock("@/stores/auth/auth", () => ({
  getAuthUser,
}));

vi.mock("@/stores/i18n/i18n", () => ({
  translate: (key: string) => key,
}));

vi.mock("@/stores/toast/toast", () => ({
  showToast,
}));

const SUBSCRIPTION = { endpoint: "https://fcm/endpoint" };
const PAYLOAD = {
  auth: "auth",
  endpoint: SUBSCRIPTION.endpoint,
  p256dh: "key",
};

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
    toPushSubscriptionRequest.mockReturnValue(PAYLOAD);
    setNotificationSetup.mockResolvedValue(undefined);
    setNotificationsEnabled.mockResolvedValue(undefined);
    getAuthUser.mockReturnValue({ notificationsEnabled: false });
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
    expect(setNotificationsEnabled).toHaveBeenCalledWith({ enabled: true });
  });

  it("unchecks the box again when the device refuses to subscribe", async () => {
    enablePushNotifications.mockResolvedValue({ subscription: null });

    const { pushNotificationsEnabled, togglePushNotifications } =
      await importStore();

    await togglePushNotifications(true);

    expect(pushNotificationsEnabled()).toBe(false);
    expect(setNotificationSetup).not.toHaveBeenCalled();
    expect(setNotificationsEnabled).not.toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(
      "GLOBAL.NAVIGATION.NOTIFICATIONS_UNAVAILABLE",
    );
  });

  it("turns the account off without dropping the browser subscription", async () => {
    const disabling = deferred<undefined>();
    setNotificationsEnabled.mockReturnValueOnce(undefined);
    enablePushNotifications.mockResolvedValue({ subscription: SUBSCRIPTION });

    const { pushNotificationsEnabled, togglePushNotifications } =
      await importStore();

    await togglePushNotifications(true);
    expect(pushNotificationsEnabled()).toBe(true);

    setNotificationsEnabled.mockReturnValueOnce(disabling.promise);
    const toggling = togglePushNotifications(false);

    expect(pushNotificationsEnabled()).toBe(false);

    disabling.resolve(undefined);
    await toggling;

    expect(pushNotificationsEnabled()).toBe(false);
    expect(setNotificationsEnabled).toHaveBeenLastCalledWith({
      enabled: false,
    });
  });
});

describe("syncPushNotificationsState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the account setting, not what this browser has subscribed", async () => {
    getAuthUser.mockReturnValue({ notificationsEnabled: true });

    const { pushNotificationsEnabled, syncPushNotificationsState } =
      await importStore();

    expect(syncPushNotificationsState()).toBe(true);
    expect(pushNotificationsEnabled()).toBe(true);
    expect(getPushNotificationsState).not.toHaveBeenCalled();
  });

  it("stays off for an account with notifications turned off elsewhere", async () => {
    getAuthUser.mockReturnValue({ notificationsEnabled: false });

    const { pushNotificationsEnabled, syncPushNotificationsState } =
      await importStore();

    syncPushNotificationsState();

    expect(pushNotificationsEnabled()).toBe(false);
  });
});

describe("registerPushSubscriptionSetup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    toPushSubscriptionRequest.mockReturnValue(PAYLOAD);
    setNotificationSetup.mockResolvedValue(undefined);
  });

  it("registers the device without touching the account setting", async () => {
    enablePushNotifications.mockResolvedValue({ subscription: SUBSCRIPTION });

    const { registerPushSubscriptionSetup } = await importStore();

    await expect(registerPushSubscriptionSetup()).resolves.toBe(true);
    expect(setNotificationSetup).toHaveBeenCalledWith(PAYLOAD);
    expect(setNotificationsEnabled).not.toHaveBeenCalled();
  });

  it("does nothing when the browser granted no permission", async () => {
    enablePushNotifications.mockResolvedValue({ subscription: null });

    const { registerPushSubscriptionSetup } = await importStore();

    await expect(registerPushSubscriptionSetup()).resolves.toBe(false);
    expect(setNotificationSetup).not.toHaveBeenCalled();
    expect(setNotificationsEnabled).not.toHaveBeenCalled();
  });
});
