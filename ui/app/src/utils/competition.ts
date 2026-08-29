export const COMPETITION_STATUS = {
  DRAFT: "DRAFT",
  CREATED: "CREATED",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
  DELETED: "DELETED",
};

// DRAFT is the local, not-yet-synced twin of CREATED: offline the POST never lands, so it must behave the same.
function isCreatedCompetition(status?: string) {
  return (
    status === COMPETITION_STATUS.CREATED || status === COMPETITION_STATUS.DRAFT
  );
}

export function canEditCompetition(status?: string) {
  return isCreatedCompetition(status);
}

export function canDeleteCompetition(status?: string) {
  return isCreatedCompetition(status);
}

export const COMPETITION_DETAIL_TABS = {
  STAGES: "STAGES",
  RANKINGS: "RANKINGS",
} as const;

export const COMPETITION_DETAIL_TAB_PARAM = "tab";
