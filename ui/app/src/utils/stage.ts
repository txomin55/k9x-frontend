type StageDateRange = {
  dateFrom: number;
  dateTo: number;
};

export function formatStageDateRange(stage: StageDateRange) {
  return `${new Date(stage.dateFrom).toDateString()} - ${new Date(stage.dateTo).toDateString()}`;
}

export function toUndefinedIfBlank(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return undefined;

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

export function toDateInputValue(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

export function parseDateInputValue(value: string, fallback: number) {
  if (!value) return fallback;
  return new Date(`${value}T00:00:00`).getTime();
}
