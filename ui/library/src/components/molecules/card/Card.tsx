import { Show } from "solid-js";
import type { CardProps } from "@lib/components/molecules/card/Card.types";
import "./styles.css";

export default function Card({
  topLeft,
  topRight,
  subHeader,
  description,
  content,
  actions,
}: CardProps) {
  return (
    <article class="data-card">
      <header class="data-card__top">
        <div class="data-card__top-left">{topLeft}</div>
        <div class="data-card__top-right">{topRight}</div>
      </header>

      <Show when={subHeader !== undefined}>
        <span class="data-card__sub-header text-caption-sm">{subHeader}</span>
      </Show>

      <Show when={description !== undefined}>
        <p class="data-card__description text-body-md">{description}</p>
      </Show>

      <Show when={content !== undefined}>
        <section class="data-card__content">{content}</section>
      </Show>

      <Show when={actions !== undefined}>
        <footer class="data-card__actions">{actions}</footer>
      </Show>
    </article>
  );
}
