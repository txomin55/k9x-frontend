export const STAGE_STATUS = {
  CREATED: "CREATED",
  TO_BE_STARTED: "TO_BE_STARTED",
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
  DELETED: "DELETED",
};

export function getMarkerColorByStatus(status: string) {
  switch (status) {
    case STAGE_STATUS.CREATED:
      return "var(--primary)";
    case STAGE_STATUS.TO_BE_STARTED:
      return "var(--warning-border)";
    case STAGE_STATUS.STARTED:
      return "var(--success-border)";
    case STAGE_STATUS.COMPLETED:
      return "var(--accent-border)";
  }
}

export function isStageLive(status: string) {
  return [STAGE_STATUS.TO_BE_STARTED, STAGE_STATUS.STARTED].includes(status);
}
