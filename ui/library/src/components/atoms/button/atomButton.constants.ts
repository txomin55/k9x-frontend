export const BUTTON_TYPES = {
  PRIMARY: "primary",
  ACCENT: "accent",
  DESTRUCTIVE: "destructive",
  GHOST: "ghost",
} as const;

export type ButtonType = (typeof BUTTON_TYPES)[keyof typeof BUTTON_TYPES];
