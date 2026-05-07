export interface IdNameDTO {
  id: string;
  name: string;
}

export interface UpdateJudgeRequestDTO {
  name: string;
}

export interface JudgeRollbackPayload {
  entityId: string;
  previousJudge: IdNameDTO | null;
  previousJudges: IdNameDTO[] | null;
}
