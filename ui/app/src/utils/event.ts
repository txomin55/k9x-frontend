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
  exercises: event.exercises.map((exercise) => ({ ...exercise })),
  id: event.id,
  judges: event.judges.map((judge) => ({ ...judge })),
  name: event.name,
  stageId: event.stage.id,
  status: event.status,
});

export const EVENT_STATUS = {
  CREATED: "created",
  CLOSED_ENROLLMENT: "closed_enrollment",
  STARTED: "started",
  COMPLETED: "completed",
  DELETED: "deleted",
};

export function canSeeClassification(status: string) {
  return ![EVENT_STATUS.CREATED, EVENT_STATUS.DELETED].includes(status);
}
