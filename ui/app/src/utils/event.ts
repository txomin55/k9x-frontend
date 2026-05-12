import type {
  EventDetailResponseDTO,
  EventEditorDraft,
} from "@/services/secured/event-crud/eventCrud.types";

export const toEventEditorDraft = (event: EventDetailResponseDTO): EventEditorDraft => ({
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
