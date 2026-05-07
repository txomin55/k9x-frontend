export interface JudgeResponseDTO {
  id: string;
  name: string;
}

export interface CreateJudgeRequestDTO {
  id: string;
  name: string;
}

export interface UpdateJudgeRequestDTO {
  name: string;
}

export interface JudgeRollbackPayload {
  entityId: string;
  previousJudge: JudgeResponseDTO | null;
  previousJudges: JudgeResponseDTO[] | null;
}
