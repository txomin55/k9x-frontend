import "./styles.css";

export default function Card({
  topLeft,
  topRight,
  subHeader,
  description,
  content,
  actions,
}) {
  return (
    <article class="data-card">
      <header class="data-card__top">
        <div class="data-card__top-left">{topLeft}</div>
        <div class="data-card__top-right">{topRight}</div>
      </header>

      <span class="data-card__date text-caption-sm">{subHeader}</span>

      <p class="data-card__description text-body-md">{description}</p>
      <section class="data-card__content">{content}</section>

      <footer class="data-card__actions">{actions}</footer>
    </article>
  );
}
