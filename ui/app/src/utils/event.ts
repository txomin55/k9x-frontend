import type { EventDetailResponseDTO, EventEditorDraft } from "@/services/secured/event-crud/eventCrud.types";

export const toEventEditorDraft = (
  event: EventDetailResponseDTO,
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
  enrollmentDeadline: event.enrollmentDeadline,
  exercises: event.exercises.map((exercise) => ({ ...exercise })),
  id: event.id,
  judges: event.judges.map((judge) => ({ ...judge })),
  name: event.name,
  stageId: event.stage.id,
  status: event.status,
});

export const EVENT_STATUS = {
  CREATED: "CREATED",
  CLOSED_ENROLLMENT: "CLOSED_ENROLLMENT",
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
  DELETED: "DELETED",
};

export const COMPETITOR_STATUS = {
  PENDING_ENROLL_ACCEPT: "PENDING_ENROLL_ACCEPT",
  ENROLLED: "ENROLLED",
};

export function canSeeClassification(status: string) {
  return ![EVENT_STATUS.CREATED, EVENT_STATUS.DELETED].includes(status);
}

export function canSeeCompetitorScores(eventStatus: string) {
  return eventStatus === EVENT_STATUS.STARTED;
}

export function canAcceptCompetitorEnroll(competitorStatus: string) {
  return competitorStatus === COMPETITOR_STATUS.PENDING_ENROLL_ACCEPT;
}
