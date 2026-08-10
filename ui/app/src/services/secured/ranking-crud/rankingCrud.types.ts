import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface RankingResponseDTO {
  rankingId: string;
  name: string;
  /** Deleted events are omitted by the backend, so this can be shorter than what was sent. */
  events: IdNameDTO[];
  groupBy: string;
  includeBy: string;
  includedCount: number | null;
}

export interface CreateRankingRequestDTO {
  rankingId: string;
  name: string;
  eventIds: string[];
  groupBy: string;
  includeBy: string;
  includedCount: number | null;
}

export interface RankingRollbackPayload {
  entityId: string;
  /** The ranking as it was before the mutation, or null when it did not exist yet. */
  previousRanking: RankingResponseDTO | null;
}
