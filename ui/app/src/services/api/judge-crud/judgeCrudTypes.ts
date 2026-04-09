export interface Judge {
  id: string;
  name: string;
}

export interface CreateJudgeRequest {
  id: string;
  name: string;
}

export interface UpdateJudgeRequest {
  name: string;
}

export interface JudgeRollbackPayload {
  entityId: string;
  previousJudge: Judge | null;
  previousJudges: Judge[] | null;
}
