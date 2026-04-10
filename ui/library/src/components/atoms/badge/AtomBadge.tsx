import { Badge } from "@kobalte/core/badge";
import { AtomBadgeProps } from "@lib/components/atoms/badge/AtomBadge.types";
import "./styles.css";

export default function (props: AtomBadgeProps) {
  return (
    <Badge
      class="atom-badge"
      data-variant={props.kind}
      textValue={props.textValue}
    >
      {props.children}
    </Badge>
  );
}
