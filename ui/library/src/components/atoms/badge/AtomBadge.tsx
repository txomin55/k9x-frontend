import { Badge } from "@kobalte/core/badge";
import type { AtomBadgeProps } from "@lib/components/atoms/badge/AtomBadge.types";
import { getTagColorStyle } from "@lib/utils/tagColor";
import "./styles.css";

export const BADGE_TYPES = {
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  ACCENT: "accent",
  PRIMARY: "primary",
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
