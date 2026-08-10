export const COMPETITION_STATUS = {
  DRAFT: "DRAFT",
  CREATED: "CREATED",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
  DELETED: "DELETED",
};

export function canEditCompetition(status?: string) {
  return status === COMPETITION_STATUS.CREATED;
}

export function canDeleteCompetition(status?: string) {
  return status === COMPETITION_STATUS.CREATED;
}

export const COMPETITION_DETAIL_TABS = {
  STAGES: "STAGES",
  RANKINGS: "RANKINGS",
} as const;

export const COMPETITION_DETAIL_TAB_PARAM = "tab";
