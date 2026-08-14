import postGoogleForm from "@/utils/google-forms/postGoogleForm";
import { getAuthUser } from "@/stores/auth/auth";
import { DEFAULT_EVENT_CATEGORY } from "@/utils/event";

/**
 * "K9x non CLUB event": same three fields as the wrong-event-data report (user id, event id, justification), but
 * filled in by the app instead of by a person. Anything above the club tier is reviewed by hand, so every create
 * and every edit that leaves the event in a non-CLUB category files its own report.
 */
const FORM_ID = "1FAIpQLSf-apUjM4vH_n6k4WEl93OTDyqBO-xlvv1U8mqAJHgdHUliog";

const USER_ID_ENTRY = "entry.946948767";
const EVENT_ID_ENTRY = "entry.467584706";
const JUSTIFICATION_ENTRY = "entry.897265685";

export interface NonClubEventReport {
  eventId: string;
  category?: string;
  eventName?: string;
  method: "POST" | "PUT";
}

export default function reportNonClubEvent(report: NonClubEventReport) {
  const category = report.category || DEFAULT_EVENT_CATEGORY;

  if (category === DEFAULT_EVENT_CATEGORY) {
    return;
  }

  const action = report.method === "POST" ? "created" : "updated";
  const name = report.eventName ? ` "${report.eventName}"` : "";

  void postGoogleForm(FORM_ID, {
    [USER_ID_ENTRY]: getAuthUser()?.email,
    [EVENT_ID_ENTRY]: report.eventId,
    [JUSTIFICATION_ENTRY]: `Event${name} ${action} with category ${category}`,
  }).catch(() => undefined);
}
