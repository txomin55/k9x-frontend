import { describe, expect, it } from "vitest";
import {
  isNotificationType,
  renderNotificationWith,
} from "@/utils/service-worker/events/notification-catalog";

const t = (key: string, values: Record<string, string> = {}) =>
  `${key}:${Object.values(values).join(",")}`;

describe("notification catalog", () => {
  it("knows the kinds the backend can send", () => {
    expect(isNotificationType("NEW_ENROLL")).toBe(true);
    expect(isNotificationType("EVENT_NOTIFICATION")).toBe(true);
    expect(isNotificationType("SOMETHING_ELSE")).toBe(false);
  });

  it("renders an event announcement with its text and opens the stage's notifications tab", () => {
    const rendered = renderNotificationWith(
      "EVENT_NOTIFICATION",
      {
        stage_id: "stage-1",
        stage_name: "Trial 1",
        content: "Ceremony delayed",
      },
      t,
    );

    expect(rendered.title).toBe(
      "NOTIFICATION.EVENT_NOTIFICATION.TITLE:Trial 1",
    );
    expect(rendered.body).toBe("Ceremony delayed");
    expect(rendered.url).toBe("/stages/stage-1/info?tab=NOTIFICATIONS");
  });
});
