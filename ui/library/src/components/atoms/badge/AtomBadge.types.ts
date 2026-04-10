import { JSX } from "solid-js";

export interface AtomBadgeProps {
  kind?: "success" | "warning" | "error" | "accent";
  textValue?: string;
  children: JSX.Element;
}
