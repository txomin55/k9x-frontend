import type { JSX } from "solid-js";

export type CardProps = {
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  subHeader?: JSX.Element;
  description?: JSX.Element;
  content?: JSX.Element;
  actions?: JSX.Element;
};
