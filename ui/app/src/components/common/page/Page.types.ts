import type { JSX } from "solid-js";

export interface PageProps {
  title?: string;
  actions?: JSX.Element;
  children: JSX.Element;
}
