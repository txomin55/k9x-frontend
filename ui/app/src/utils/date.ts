import { translate } from "@/stores/i18n/i18n";

export function formatStageDateRange(dateFrom: number, dateTo: number) {
  return `${new Date(dateFrom).toDateString()} - ${new Date(dateTo).toDateString()}`;
}

export function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString([], {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
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
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

export function parseDateInputValue(value: string, fallback: number) {
  if (!value) return fallback;
  return new Date(`${value}T00:00:00`).getTime();
}

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function dayBefore(timestamp: number) {
  return timestamp - ONE_DAY_IN_MS;
}

export function formatDateLabel(value: string) {
  if (!value) return translate("COMMON.DATE.NO_DATE");

  return value;
}
