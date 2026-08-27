import type { EventDetailResponseDTO, EventEditorDraft } from "@/services/secured/event-crud/eventCrud.types";
import { SCORE_CALCULATION } from "@/services/secured/event-crud/eventCrud.types";
import { oneWeekBefore, oneWeekFromNow } from "@/utils/date";

/**
 * The category is mandatory on the backend and drives the event's rank score, so an event that carries none
 * (an older one, or one never edited since the field was added) falls back to the lowest tier rather than
 * being sent empty and rejected.
 */
export const DEFAULT_EVENT_CATEGORY = "CLUB";

/**
 * Same story as the category: the backend resolves the score calculation into an enum without tolerating
 * null, so an event that has never been configured (its column is still empty) would make the update 500.
 */
export const DEFAULT_SCORE_CALCULATION = SCORE_CALCULATION.AVG;

export const toEventEditorDraft = (
  event: EventDetailResponseDTO,
  stageDateFrom?: number,
): EventEditorDraft => ({
  competitors: event.competitors.map((competitor) => ({ ...competitor })),
  configuration: {
    federation: event.configuration.federation,
    id: event.configuration.id,
    name: event.configuration.name,
  },
  discipline: {
    id: event.discipline.id,
    name: event.discipline.name,
  },
  enrollmentDeadline:
    event.enrollmentDeadline ||
    (stageDateFrom !== undefined
      ? oneWeekBefore(stageDateFrom)
      : oneWeekFromNow()),
  exercises: event.exercises.map((exercise) => ({ ...exercise })),
  id: event.id,
  judges: event.judges.map((judge) => ({ ...judge })),
  name: event.name,
  stageId: event.stage.id,
  status: event.status,
  scoreCalculation: event.scoreCalculation || DEFAULT_SCORE_CALCULATION,
  awards: event.awards.map((award) => ({ ...award })),
  commissioner: event.commissioner ?? "",
  category: event.category || DEFAULT_EVENT_CATEGORY,
});

export const EVENT_STATUS = {
  DRAFT: "DRAFT",
  CREATED: "CREATED",
  CLOSED_ENROLLMENT: "CLOSED_ENROLLMENT",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
  DELETED: "DELETED",
};

export const COMPETITOR_STATUS = {
  PENDING_ENROLL_ACCEPT: "PENDING_ENROLL_ACCEPT",
  ENROLLED: "ENROLLED",
  NOT_COMPETING: "NOT_COMPETING",
};

export function canSeeClassification(status: string) {
  return ![EVENT_STATUS.CREATED, EVENT_STATUS.DELETED].includes(status);
}

export function canSeeCompetitorScores(eventStatus: string) {
  return [EVENT_STATUS.STARTED, EVENT_STATUS.FINISHED].includes(eventStatus);
}

export function canAcceptCompetitorEnroll(competitorStatus: string) {
  return competitorStatus === COMPETITOR_STATUS.PENDING_ENROLL_ACCEPT;
}

export function canDeleteEvent(status?: string) {
  return status === EVENT_STATUS.CREATED;
}

export function canEditEvent(status?: string) {
  return status === EVENT_STATUS.CREATED;
}

export function canManageEvent(status?: string) {
  return [EVENT_STATUS.CREATED, EVENT_STATUS.STARTED].includes(status ?? "");
}
