import { beforeEach, describe, expect, it, vi } from "vitest";
import reportNonClubEvent from "@/utils/google-forms/reportNonClubEvent";
import postGoogleForm from "@/utils/google-forms/postGoogleForm";
import { getAuthUser } from "@/stores/auth/auth";

vi.mock("@/utils/google-forms/postGoogleForm", () => ({
  default: vi.fn(() => Promise.resolve(new Response(null, { status: 200 }))),
}));

vi.mock("@/stores/auth/auth", () => ({
  getAuthUser: vi.fn(() => ({ email: "organizer@example.com" })),
}));

const postGoogleFormMock = vi.mocked(postGoogleForm);
const getAuthUserMock = vi.mocked(getAuthUser);

describe("reportNonClubEvent", () => {
  beforeEach(() => {
    postGoogleFormMock.mockClear();
    getAuthUserMock.mockReturnValue({
      email: "organizer@example.com",
    } as ReturnType<typeof getAuthUser>);
  });

  it("does not report a CLUB event", () => {
    reportNonClubEvent({ category: "CLUB", eventId: "event-1", method: "PUT" });

    expect(postGoogleFormMock).not.toHaveBeenCalled();
  });

  it("does not report an event without category, which defaults to CLUB", () => {
    reportNonClubEvent({ eventId: "event-1", method: "POST" });

    expect(postGoogleFormMock).not.toHaveBeenCalled();
  });

  it("reports a created non-CLUB event with the wrong-event-data fields", () => {
    reportNonClubEvent({
      category: "OPEN",
      eventId: "event-1",
      eventName: "Copa",
      method: "POST",
    });

    expect(postGoogleFormMock).toHaveBeenCalledWith(
      "1FAIpQLSf-apUjM4vH_n6k4WEl93OTDyqBO-xlvv1U8mqAJHgdHUliog",
      {
        "entry.946948767": "organizer@example.com",
        "entry.467584706": "event-1",
        "entry.897265685": 'Event "Copa" created with category OPEN',
      },
    );
  });

  it("reports an updated non-CLUB event", () => {
    reportNonClubEvent({
      category: "WC_FINAL",
      eventId: "event-2",
      method: "PUT",
    });

    expect(postGoogleFormMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        "entry.467584706": "event-2",
        "entry.897265685": "Event updated with category WC_FINAL",
      }),
    );
  });
});
