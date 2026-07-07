import { JSX } from "solid-js";
import { BADGE_TYPES } from "@lib/components/atoms/badge/AtomBadge";

export interface AtomBadgeProps {
  type?: (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];
  textValue?: string;
  pulse?: boolean;
  dotMode?: boolean;
  colorByLabel?: boolean;
  children: JSX.Element;
}
