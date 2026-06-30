export const MIN_TEXT_LENGTH = 3;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type TextFieldError = "REQUIRED" | "MIN_LENGTH" | "INVALID_EMAIL" | null;

export const validateEmail = (value: string | undefined): TextFieldError => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "REQUIRED";
  if (!EMAIL_REGEX.test(trimmed)) return "INVALID_EMAIL";
  return null;
};

export const validateRequiredText = (
  value: string | undefined,
): TextFieldError => {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "REQUIRED";
  if (trimmed.length < MIN_TEXT_LENGTH) return "MIN_LENGTH";
  return null;
};

export const validateRequiredSelection = (
  value: string | undefined,
): TextFieldError => ((value ?? "").trim() ? null : "REQUIRED");
