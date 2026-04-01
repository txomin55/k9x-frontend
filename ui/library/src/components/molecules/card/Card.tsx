import { Show } from "solid-js";
import type { CardProps } from "@lib/components/molecules/card/Card.types";
import "./styles.css";

export default function Card(props: CardProps) {
  return (
    <article class="data-card">
      <header class="data-card__top">
        <div class="data-card__top-left text-body-lg">{props.topLeft}</div>
        <div class="data-card__top-right">{props.topRight}</div>
      </header>

      <Show when={props.subHeader !== undefined}>
        <span class="data-card__sub-header text-caption-sm">
          {props.subHeader}
        </span>
      </Show>

      <Show when={props.description !== undefined}>
        <p class="data-card__description text-body-md">{props.description}</p>
      </Show>

      <Show when={props.content !== undefined}>
        <section class="data-card__content">{props.content}</section>
      </Show>

      <Show when={props.actions !== undefined}>
        <footer class="data-card__actions">{props.actions}</footer>
      </Show>
    </article>
  );
}
