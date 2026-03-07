export const DEFAULT_THEME = "light";

export const withDarkTheme = (Story, context) => {
  const { theme } = context.globals;
  const finalTheme = theme || DEFAULT_THEME;
  const oppositeTheme = finalTheme === "light" ? "dark" : "light";

  const bodyContainer = document.body;
  bodyContainer.classList.remove(oppositeTheme);
  bodyContainer.classList.add(finalTheme);

  const storyContainer = document.querySelector("#storybook-root");
  if (storyContainer) {
    storyContainer.classList.remove(oppositeTheme);
    storyContainer.classList.add(finalTheme);
  }

  return Story();
};
