export const STAGE_STATUS = {
  CREATED: "created",
  TO_BE_STARTED: "to_be_started",
  STARTED: "started",
  COMPLETED: "completed",
  DELETED: "deleted",
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
