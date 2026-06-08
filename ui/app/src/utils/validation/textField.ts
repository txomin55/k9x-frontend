export const MIN_TEXT_LENGTH = 3;

export type TextFieldError = "REQUIRED" | "MIN_LENGTH" | null;

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
