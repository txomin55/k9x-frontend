export interface IdNameDTO {
  id: string;
  name: string;
}

export interface JudgeResponseDTO {
  id: string;
  name: string;
  country: string;
}

export interface CreateJudgeRequestDTO {
  id: string;
  name: string;
  country: string;
}

export interface UpdateJudgeRequestDTO {
  name: string;
  country: string;
}

export interface JudgeRollbackPayload {
  entityId: string;
  previousJudge: JudgeResponseDTO | null;
  previousJudges: JudgeResponseDTO[] | null;
}
