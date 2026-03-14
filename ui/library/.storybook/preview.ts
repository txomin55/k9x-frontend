import "../src/assets/styles/index.css";
import type { Preview } from "@storybook/html";
import { withDarkTheme } from "./withDarkTheme.decorator";

const preview: Preview = {
  decorators: [withDarkTheme],
  globalTypes: {
  theme: {
    name: "Theme",
    description: "Global theme for components",
    toolbar: {
      icon: "paintbrush",
      // Array of plain string values or MenuItem shape
      items: [
        { value: "light", title: "Light", left: "🌞" },
        { value: "dark", title: "Dark", left: "🌛" },
      ],
      // Change title based on selected value
      dynamicTitle: true,
    },
  },
  },
  tags: ["autodocs"],
};

export default preview;
