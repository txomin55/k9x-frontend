import { useEffect } from "react";

export const DEFAULT_THEME = "light";

export const withDarkTheme = (Story, context) => {
  const { theme } = context.globals;

  useEffect(() => {
    const finalTheme = theme || DEFAULT_THEME;
    const oppositeTheme = finalTheme === "light" ? "dark" : "light";

    // Set the "class" on the iFrame body tag
    const bodyContainer = document.body;
    bodyContainer.classList.remove(oppositeTheme);
    bodyContainer.classList.add(finalTheme);

    // Set the "class" on the iFrame .docs-story div (for storybook docs)
    const storyContainer = document.querySelector("#storybook-root");
    if (storyContainer) {
      storyContainer.classList.remove(oppositeTheme);
      storyContainer.classList.add(finalTheme);
    }
  });

  return <Story />;
};
