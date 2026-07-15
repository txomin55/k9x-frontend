import { Show } from "solid-js";
import type { JSX } from "solid-js";
import "./styles.css";

export type CardProps = {
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  subHeader?: JSX.Element;
  description?: JSX.Element;
  content?: JSX.Element;
  actions?: JSX.Element;
};

export default function Card(props: CardProps) {
  return (
    <article class="card">
      <header class="card__top">
        <div class="card__top-left text-body-lg">{props.topLeft}</div>
        <div class="card__top-right">{props.topRight}</div>
      </header>

      <Show when={props.subHeader !== undefined}>
        <span class="card__sub-header text-caption-sm">{props.subHeader}</span>
      </Show>

      <Show when={props.description !== undefined}>
        <p class="card__description text-body-sm">{props.description}</p>
      </Show>

      <Show when={props.content !== undefined}>
        <section class="card__content">{props.content}</section>
      </Show>

      <Show when={props.actions !== undefined}>
        <footer class="card__actions">{props.actions}</footer>
      </Show>
    </article>
  );
}
