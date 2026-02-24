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
      const badges = [];
      if (item.type === "story") {
        item?.tags
          ?.filter((tag) => !["dev", "test", "autodocs"].includes(tag))
          ?.forEach((tag) => {
            const parts = tag.split(":");
            const text = parts.length === 2 ? parts[1] : parts[0];

            badges.push({ text, color: BADGE_TYPE_COLORS[parts[0]] });
          });
      }

      return (
        <span>
          <span title={item.name}>{item.name}</span>
          {badges.map((tag, idx) => (
            <span
              key={idx}
              className="story-badge"
              style={{ backgroundColor: tag.color }}
            >
              {tag.text.toUpperCase()}
            </span>
          ))}
        </span>
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
