export const BUTTON_TYPES = {
  DEFAULT: "",
  PRIMARY: "primary",
  SECONDARY: "secondary",
  TERTIARY: "tertiary",
  ERROR: "error",
} as const;

export type ButtonType = (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];
