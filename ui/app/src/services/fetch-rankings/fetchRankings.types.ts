export interface RankingClassificationEventResponseDTO {
  id: string;
  name: string;
  /** Trial the event belongs to, needed to link to its classification. */
  stageId: string;
}

export interface RankingClassificationCellResponseDTO {
  eventId: string;
  /** Null when the competitor did not compete in that event, which renders disabled. */
  score: number | null;
  /** False with no score, and false when the inclusion criterion left the score out of the total. */
  counts: boolean;
}

export interface RankingClassificationMemberResponseDTO {
  /** Dog identification: also the value the event classification filters competitors by. */
  id: string;
  name: string;
  cells: RankingClassificationCellResponseDTO[];
}

export interface RankingClassificationGroupResponseDTO {
  id: string;
  name: string;
  position: number;
  tied: boolean;
  total: number;
  members: RankingClassificationMemberResponseDTO[];
}

export interface RankingClassificationResponseDTO {
  /** Columns of the matrix, in ranking order. */
  events: RankingClassificationEventResponseDTO[];
  groups: RankingClassificationGroupResponseDTO[];
}
