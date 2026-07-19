export const STAGE_STATUS = {
  DRAFT: "DRAFT",
  CREATED: "CREATED",
  TO_START: "TO_START",
  STARTED: "STARTED",
  FINISHED: "FINISHED",
  DELETED: "DELETED",
};

export function getMarkerTextColorByStatus(status: string) {
  switch (status) {
    case STAGE_STATUS.CREATED:
      return "var(--primary)";
    case STAGE_STATUS.TO_START:
      return "var(--warning-text)";
    case STAGE_STATUS.STARTED:
      return "var(--success-text)";
    case STAGE_STATUS.FINISHED:
      return "var(--text-inverted)";
    case STAGE_STATUS.DELETED:
      return "var(--error-text)";
  }
}
export function getMarkerColorByStatus(status: string) {
  switch (status) {
    case STAGE_STATUS.CREATED:
      return "var(--primary-soft)";
    case STAGE_STATUS.TO_START:
      return "var(--warning-bg)";
    case STAGE_STATUS.STARTED:
      return "var(--success-bg)";
    case STAGE_STATUS.FINISHED:
      return "var(--accent)";
    case STAGE_STATUS.DELETED:
      return "var(--error-bg)";
  }
}

export function isStageLive(status: string) {
  return [STAGE_STATUS.TO_START, STAGE_STATUS.STARTED].includes(status);
}

export function canEditStage(status?: string) {
  return status === STAGE_STATUS.CREATED;
}

export function canDeleteStage(status?: string) {
  return status === STAGE_STATUS.CREATED;
}

export function canCreateEvent(stageStatus?: string) {
  return stageStatus === STAGE_STATUS.CREATED;
}

export function isDayAfterStageDateTo(stageDateTo?: number) {
  if (stageDateTo === undefined) return false;

  const dateTo = new Date(stageDateTo);
  const nextDayStart = Date.UTC(
    dateTo.getUTCFullYear(),
    dateTo.getUTCMonth(),
    dateTo.getUTCDate() + 1,
  );

  return Date.now() >= nextDayStart;
}
