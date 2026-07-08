export const COMPETITION_STATUS = {
  DRAFT: "DRAFT",
  CREATED: "CREATED",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
  DELETED: "DELETED",
};

export function canEditCompetition(status?: string) {
  return status !== COMPETITION_STATUS.FINISHED;
}

export function canDeleteCompetition(status?: string) {
  return status === COMPETITION_STATUS.CREATED;
}
