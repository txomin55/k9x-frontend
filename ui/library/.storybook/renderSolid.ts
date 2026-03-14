import type { JSX } from "solid-js";
import { render } from "solid-js/web";

export function renderSolid(component: () => JSX.Element) {
  const container = document.createElement("div");
  render(component, container);
  return container;
}
