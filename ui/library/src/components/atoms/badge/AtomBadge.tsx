import { Badge } from "@kobalte/core/badge";
import { JSX } from "solid-js";
import { getTagColorStyle } from "@lib/utils/tagColor";
import "./styles.css";

export interface AtomBadgeProps {
  type?: (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];
  textValue?: string;
  pulse?: boolean;
  dotMode?: boolean;
  colorByLabel?: boolean;
  children: JSX.Element;
}

export const BADGE_TYPES = {
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  ACCENT: "accent",
  PRIMARY: "primary",
  SPECIAL: "special",
} as const;

export default function (props: AtomBadgeProps) {
  return (
    <Badge
      class="atom-badge"
      classList={{
        "atom-badge--pulse": props.pulse,
        "atom-badge--dot": props.dotMode,
      }}
      data-variant={props.colorByLabel ? "tag" : props.type}
      style={
        props.colorByLabel && props.textValue
          ? getTagColorStyle(props.textValue)
          : undefined
      }
      textValue={props.textValue}
    >
      {!props.dotMode && props.children}
    </Badge>
  );
}
