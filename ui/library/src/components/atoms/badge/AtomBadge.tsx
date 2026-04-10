import { Badge } from "@kobalte/core/badge";
import type { AtomBadgeProps } from "@lib/components/atoms/badge/AtomBadge.types";
import "./styles.css";

export const BADGE_TYPES = {
  WARNING: "warning",
  ERROR: "error",
  SUCCESS: "success",
  ACCENT: "accent",
} as const;

export default function (props: AtomBadgeProps) {
  return (
    <Badge
      class="atom-badge"
      data-variant={props.type}
      textValue={props.textValue}
    >
      {props.children}
    </Badge>
  );
}
