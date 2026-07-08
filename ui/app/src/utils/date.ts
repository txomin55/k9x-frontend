import { translate } from "@/stores/i18n/i18n";

export function formatUtcDateOnly(timestamp: number) {
  const date = new Date(timestamp);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ).toLocaleDateString();
}

export function formatStageDateRange(dateFrom: number, dateTo: number) {
  return `${formatUtcDateOnly(dateFrom)} - ${formatUtcDateOnly(dateTo)}`;
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

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function parseDateInputValue(value: string, fallback: number) {
  if (!value) return fallback;
  return new Date(`${value}T00:00:00Z`).getTime();
}

export const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function dayBefore(timestamp: number) {
  return timestamp - ONE_DAY_IN_MS;
}

export function oneWeekFromNow() {
  return Date.now() + 7 * ONE_DAY_IN_MS;
}

export function formatDateLabel(value: string) {
  if (!value) return translate("COMMON.DATE.NO_DATE");

  return value;
}
