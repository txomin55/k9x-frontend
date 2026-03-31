import "../src/assets/styles/index.css";
import { withDarkTheme } from "./withDarkTheme.decorator";

const preview = {
  decorators: [withDarkTheme],
  parameters: {
    docs: {
      toc: {
        title: "Table of Contents",
        contentsSelector: ".sbdocs-content",
        headingSelector: "h2, h3, h4",
        ignoreSelector: ".docs-story h2, .docs-story h3, .docs-story h4",
      },
    },
  },
  tags: ["autodocs"],
};

export default preview;
