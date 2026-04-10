import { JSX } from "solid-js";
import { BADGE_TYPES } from "@lib/components/atoms/badge/AtomBadge";

export interface AtomBadgeProps {
  type?: (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];
  textValue?: string;
  children: JSX.Element;
}
