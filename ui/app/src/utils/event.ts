import type { EventResponse } from "@/services/api/event-api-crud/eventApiCrud";
import type { EventEditorDraft } from "@/services/api/competition-crud/competitionCrud.types";

export const toEventEditorDraft = (
  event: EventResponse,
): EventEditorDraft => ({
  competitors: event.competitors.map((competitor) => ({ ...competitor })),
  configuration: {
    federation: event.configuration.federation,
    id: event.configuration.id,
    name: event.configuration.name,
  },
  discipline: event.discipline,
  exercises: event.exercises.map((exercise) => ({ ...exercise })),
  id: event.id,
  judges: event.judges.map((judge) => ({ ...judge })),
  name: event.name,
  stageId: event.stageId,
  status: event.status,
});
