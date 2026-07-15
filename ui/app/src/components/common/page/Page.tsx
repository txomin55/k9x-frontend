import { Show, type JSX } from "solid-js";
import "./styles.css";

export interface PageProps {
  title?: string;
  actions?: JSX.Element;
  children: JSX.Element;
}

export default function Page(props: PageProps) {
  return (
    <div class="page">
      <Show when={props.title}>
        <div class="page__header">
          <span class="page__title" role="heading" aria-level={1}>
            {props.title}
          </span>
          <Show when={props.actions}>
            <div class="page__actions">{props.actions}</div>
          </Show>
        </div>
      </Show>
      {props.children}
    </div>
  );
}
