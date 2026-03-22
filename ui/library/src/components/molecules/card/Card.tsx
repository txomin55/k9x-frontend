import "./styles.css";
import AtomButton from "@lib/components/atoms/button/AtomButton";

export default function Card() {
  return (
    <article class="data-card">
      <header class="data-card__header">
        <div class="data-card__main-info">
          <div class="data-card__country-flag">
            <span class="fi fi-es" />
          </div>
          <h3 class="data-card__title text-heading-sm">
            Campeonato Regional 2026
          </h3>
        </div>
        <div class="data-card__country-badge text-label-sm">Bell</div>
      </header>

      <span class="data-card__date text-caption-sm">Desde - Hasta</span>

      <p class="data-card__description text-body-md">
        Torneo clasificatorio de alta intensidad para categorías senior.
      </p>
      <section class="data-card__grades">
        <h4 class="data-card__sub-title text-label-sm">Categorías (Grades)</h4>
        <ul class="data-card__grades-list">
          <li class="data-card__grade-pill">
            <span class="data-card__grade-name text-body-sm">Master</span>
            <span class="data-card__grade-count text-label-md">
              24 <small class="text-caption-sm">competidores</small>
            </span>
          </li>
        </ul>
      </section>

      <footer class="data-card__actions">
        <AtomButton type="primary">Ver clasificacion</AtomButton>
      </footer>
    </article>
  );
}
