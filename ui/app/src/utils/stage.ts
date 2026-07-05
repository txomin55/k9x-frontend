export const STAGE_STATUS = {
  CREATED: "CREATED",
  TO_START: "TO_START",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
  DELETED: "DELETED",
};

export function getMarkerTextColorByStatus(status: string) {
  switch (status) {
    case STAGE_STATUS.CREATED:
      return "var(--text-primary)";
    case STAGE_STATUS.TO_START:
      return "var(--warning-text)";
    case STAGE_STATUS.STARTED:
      return "var(--success-text)";
    case STAGE_STATUS.FINISHED:
      return "var(--accent)";
    case STAGE_STATUS.DELETED:
      return "var(--error-text)";
  }
}
export function getMarkerColorByStatus(status: string) {
  switch (status) {
    case STAGE_STATUS.CREATED:
      return "var(--surface-muted)";
    case STAGE_STATUS.TO_START:
      return "var(--warning-bg)";
    case STAGE_STATUS.STARTED:
      return "var(--success-bg)";
    case STAGE_STATUS.FINISHED:
      return "var(--accent-soft)";
    case STAGE_STATUS.DELETED:
      return "var(--error-bg)";
  }
}

export function isStageLive(status: string) {
  return [STAGE_STATUS.TO_START, STAGE_STATUS.STARTED].includes(status);
}

export function canEditStage(status?: string) {
  return status !== STAGE_STATUS.FINISHED;
}

export function canDeleteStage(status?: string) {
  return status === STAGE_STATUS.CREATED;
}
