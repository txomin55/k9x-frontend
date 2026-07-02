import { commitOptimisticMutation } from "@/utils/local-first/pending_tasks/commitOptimisticMutation";
import { registerPendingTaskHandler } from "@/utils/local-first/pending_tasks/pendingTasksRunner";
import { rawRequest } from "@/utils/http/client";
import {
  RegisterRedCardRequestDTO,
  RedCardResponseDTO,
} from "@/services/secured/red-card-crud/redCardCrud.types";

const RED_CARD_ENTITY_TYPE = "red-card";

registerPendingTaskHandler(RED_CARD_ENTITY_TYPE, {});

export const registerRedCard = (
  eventId: string,
  payload: RegisterRedCardRequestDTO,
) =>
  commitOptimisticMutation({
    entityId: [payload.dogId, payload.exerciseId, payload.judgeId].join(":"),
    entityType: RED_CARD_ENTITY_TYPE,
    method: "PUT",
    payload,
    rollback: () => Promise.resolve(),
    rollbackPayload: null,
    url: `/secured/events/${eventId}/red-card`,
  });

export const fetchRedCard = (eventId: string, competitorId: string) =>
  rawRequest<RedCardResponseDTO | null>({
    auth: true,
    path: `/secured/events/${eventId}/${competitorId}/red-card`,
  });
