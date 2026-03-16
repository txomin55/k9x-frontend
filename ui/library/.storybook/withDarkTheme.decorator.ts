import type { Decorator } from "@storybook/html";

export const DEFAULT_THEME = "light";

export const withDarkTheme: Decorator = (Story, context) => {
  const { theme } = context.globals;
  const finalTheme = theme || DEFAULT_THEME;
  const htmlElement = document.documentElement;
  htmlElement.setAttribute("data-theme", finalTheme);

  return Story();
};
