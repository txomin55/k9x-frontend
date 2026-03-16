import React from "react";
import { addons } from "storybook/manager-api";
import "./index.css";

export const BADGES = {
  FIGMA: "figma",
};

const BADGE_TYPE_COLORS = {
  [BADGES.FIGMA]: "rgb(98, 225, 191)",
};

addons.setConfig({
  navSize: 300,
  bottomPanelHeight: 300,
  rightPanelWidth: 300,
  panelPosition: "bottom",
  enableShortcuts: true,
  showToolbar: true,
  theme: undefined,
  selectedPanel: undefined,
  initialActive: "sidebar",
  sidebar: {
    showRoots: true,
    renderLabel: (item) => {
      const badges: Array<{ color?: string; text: string }> = [];
      if (item.type === "story") {
        item?.tags
          ?.filter(
            (tag) => !["dev", "test", "autodocs", "manifest"].includes(tag),
          )
          ?.forEach((tag) => {
            const parts = tag.split(":");
            const text = parts.length === 2 ? parts[1] : parts[0];

            badges.push({ text, color: BADGE_TYPE_COLORS[parts[0]] });
          });
      }

      return React.createElement(
        "span",
        null,
        React.createElement("span", { title: item.name }, item.name),
        ...badges.map((tag, idx) =>
          React.createElement(
            "span",
            {
              key: idx,
              className: "story-badge",
              style: { backgroundColor: tag.color },
            },
            tag.text.toUpperCase(),
          ),
        ),
      );
    },
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
