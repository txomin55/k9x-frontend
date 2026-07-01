import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import { registerPendingTaskHandler } from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import { RegisterYellowCardRequestDTO } from "@/services/secured/yellow-card-crud/yellowCardCrud.types";

const YELLOW_CARD_ENTITY_TYPE = "yellow-card";

registerPendingTaskHandler(YELLOW_CARD_ENTITY_TYPE, {});

export const registerYellowCard = (
  eventId: string,
  payload: RegisterYellowCardRequestDTO,
) =>
  commitOptimisticMutation({
    entityId: [payload.dogId, payload.exerciseId, payload.judgeId].join(":"),
    entityType: YELLOW_CARD_ENTITY_TYPE,
    method: "PUT",
    payload,
    rollback: () => Promise.resolve(),
    rollbackPayload: null,
    url: `/secured/events/${eventId}/yellow-card`,
  });
