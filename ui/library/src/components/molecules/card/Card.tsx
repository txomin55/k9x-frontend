import { JSX, Show } from "solid-js";
import "./styles.css";

export type CardProps = {
  topLeft?: JSX.Element;
  topRight?: JSX.Element;
  subHeader?: JSX.Element;
  description?: JSX.Element;
  content?: JSX.Element;
  actions?: JSX.Element;
};

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

      <span class="data-card__sub-header text-caption-sm">{subHeader}</span>

      <p class="data-card__description text-body-md">{description}</p>
      <section class="data-card__content">{content}</section>

      <Show when={actions !== null}>
        <footer class="data-card__actions">{actions}</footer>
      </Show>
    </article>
  );
}
