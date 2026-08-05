import { createMemo, For, Show, Suspense } from "solid-js";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { useI18n } from "@/stores/i18n/i18n";
import PageSeo from "@/components/common/page-seo/PageSeo";
import { useK9xMethodology } from "./api";
import DecayCurves from "./components/DecayCurves";
import IndexExample from "./components/IndexExample";
import MethodologyHeader from "./components/MethodologyHeader";
import MethodologySection from "./components/MethodologySection";
import SlotFilling from "./components/SlotFilling";
import { dogColor, SERIES_COLORS } from "./theme";
import type { DecaySeries, K9xMethodology, LocalizedText } from "./types";
import "./styles.css";

function MethodologySkeleton() {
  return (
    <div class="methodology-page">
      <For each={Array.from({ length: 3 })}>
        {() => <AtomSkeleton variant="rectangular" />}
      </For>
    </div>
  );
}

function K9xMethodologyContent(props: { data: K9xMethodology }) {
  const i18n = useI18n();

  const localized = (text: LocalizedText) =>
    i18n.locale() === "es" ? text.es : text.en;

  const seriesById = (id: DecaySeries["id"]) =>
    props.data.decayCurves.series.find((series) => series.id === id);

  const parameters = () => props.data.indexExample.parameters;

  const decayLabel = (id: DecaySeries["id"]) =>
    id === "level"
      ? i18n.t("METHODOLOGY.CHART.DECAY_LEVEL")
      : i18n.t("METHODOLOGY.CHART.DECAY_FRESHNESS");

  const monthTick = (month: number) =>
    `${month}${i18n.t("METHODOLOGY.CHART.MONTH_SUFFIX")}`;

  const decayFigSub = createMemo(() => {
    const level = seriesById("level");
    const freshness = seriesById("freshness");

    return i18n.t("METHODOLOGY.K9X.S4_FIGSUB", {
      levelPlateau: level?.plateauMonths ?? 0,
      freshnessPlateau: freshness?.plateauMonths ?? 0,
      floor: level?.floor.value ?? 0,
      levelFloor: level?.floor.fromMonth ?? 0,
      freshnessFloor: freshness?.floor.fromMonth ?? 0,
    });
  });

  const dogLegend = createMemo(() =>
    props.data.indexExample.dogs.map((dog) => ({
      id: dog.id,
      name: localized(dog.name),
      dashed: dog.events.length === 1,
    })),
  );

  return (
    <article class="methodology-page">
      <PageSeo
        title={i18n.t("METHODOLOGY.K9X.META_TITLE")}
        description={i18n.t("METHODOLOGY.K9X.META_DESCRIPTION")}
      />

      <MethodologyHeader
        brand={i18n.t("METHODOLOGY.K9X.BRAND")}
        discipline="k9x"
        subtitle={i18n.t("METHODOLOGY.K9X.SUBTITLE")}
        title={i18n.t("METHODOLOGY.K9X.TITLE")}
      />

      <MethodologySection
        discipline="k9x"
        eyebrow={i18n.t("METHODOLOGY.K9X.S4_EYEBROW")}
        lede={i18n.t("METHODOLOGY.K9X.S4_LEDE", {
          n: parameters().N,
          c: parameters().C,
          levelPlateau: seriesById("level")?.plateauMonths ?? 0,
          freshnessPlateau: seriesById("freshness")?.plateauMonths ?? 0,
        })}
        note={i18n.t("METHODOLOGY.K9X.S4_NOTE", {
          provisional: parameters().provisionalIfResultsBelow,
        })}
        title={i18n.t("METHODOLOGY.K9X.S4_TITLE")}
      >
        <figure class="methodology-page__figure">
          <div class="methodology-page__fig-title">
            {i18n.t("METHODOLOGY.K9X.S4_FIG")}
          </div>
          <div class="methodology-page__fig-sub">{decayFigSub()}</div>
          <div class="methodology-page__legend">
            <span>
              <span
                class="methodology-page__swatch--line"
                style={{ "border-color": SERIES_COLORS.blue }}
              />
              <span>{i18n.t("METHODOLOGY.K9X.S4_LEG_LEVEL")}</span>
            </span>
            <span>
              <span
                class="methodology-page__swatch--dash"
                style={{ "border-color": SERIES_COLORS.orange }}
              />
              <span>{i18n.t("METHODOLOGY.K9X.S4_LEG_FRESH")}</span>
            </span>
          </div>
          <DecayCurves
            monthTick={monthTick}
            series={props.data.decayCurves.series}
            seriesLabel={decayLabel}
            tooltip={(serie, month, weight) =>
              i18n.t("METHODOLOGY.CHART.TOOLTIP_DECAY", {
                serie,
                month,
                weight,
              })
            }
            xTitle={i18n.t("METHODOLOGY.CHART.DECAY_X")}
            yTitle={i18n.t("METHODOLOGY.CHART.DECAY_Y")}
          />
        </figure>
      </MethodologySection>

      <MethodologySection
        discipline="k9x"
        eyebrow={i18n.t("METHODOLOGY.K9X.S5_EYEBROW")}
        lede={i18n.t("METHODOLOGY.K9X.S5_LEDE")}
        note={i18n.t("METHODOLOGY.K9X.S5_NOTE")}
        title={i18n.t("METHODOLOGY.K9X.S5_TITLE")}
      >
        <figure class="methodology-page__figure">
          <div class="methodology-page__fig-title">
            {i18n.t("METHODOLOGY.K9X.S5_FIG")}
          </div>
          <div class="methodology-page__fig-sub">
            {i18n.t("METHODOLOGY.K9X.S5_FIGSUB", {
              n: parameters().N,
              c: parameters().C,
            })}
          </div>
          <div class="methodology-page__legend">
            <For each={dogLegend()}>
              {(dog) => (
                <span>
                  <span
                    class={
                      dog.dashed
                        ? "methodology-page__swatch--dash"
                        : "methodology-page__swatch--line"
                    }
                    style={{ "border-color": dogColor(dog.id) }}
                  />
                  <span>{dog.name}</span>
                </span>
              )}
            </For>
            <span>
              <span
                class="methodology-page__swatch methodology-page__swatch--round"
                style={{ background: `${SERIES_COLORS.gray}55` }}
              />
              <span>{i18n.t("METHODOLOGY.K9X.S5_LEG_SCORE")}</span>
            </span>
          </div>
          <IndexExample
            dogName={(dog) => localized(dog.name)}
            dogs={props.data.indexExample.dogs}
            indexScale={props.data.indexScale}
            monthTick={monthTick}
            tooltipEvent={(dog, detail, score, index) =>
              i18n.t("METHODOLOGY.CHART.TOOLTIP_DOGS_EVENT", {
                dog,
                detail,
                score,
                index,
              })
            }
            tooltipIndex={(dog, month, index) =>
              i18n.t("METHODOLOGY.CHART.TOOLTIP_DOGS", { dog, month, index })
            }
            tooltipScore={(dog, score, month) =>
              i18n.t("METHODOLOGY.CHART.TOOLTIP_DOGS_SCORE", {
                dog,
                score,
                month,
              })
            }
            xTitle={i18n.t("METHODOLOGY.CHART.DOGS_X")}
            yTitle={i18n.t("METHODOLOGY.CHART.DOGS_Y")}
          />
        </figure>

        <figure class="methodology-page__figure">
          <div class="methodology-page__fig-title">
            {i18n.t("METHODOLOGY.K9X.S5B_FIG", { c: parameters().C })}
          </div>
          <div class="methodology-page__fig-sub">
            {i18n.t("METHODOLOGY.K9X.S5B_FIGSUB", {
              n: parameters().N,
              c: parameters().C,
              filler: parameters().filler,
              reference: localized(parameters().cReference),
            })}
          </div>
          <div class="methodology-page__legend">
            <span>
              <span
                class="methodology-page__swatch"
                style={{ background: SERIES_COLORS.blue }}
              />
              <span>{i18n.t("METHODOLOGY.K9X.S5B_LEG_REAL")}</span>
            </span>
            <span>
              <span
                class="methodology-page__swatch"
                style={{
                  background: SERIES_COLORS.fillerBg,
                  border: `1px dashed ${SERIES_COLORS.obdx}`,
                }}
              />
              <span>
                {i18n.t("METHODOLOGY.K9X.S5B_LEG_FILL", {
                  c: parameters().C,
                  reference: localized(parameters().cReference),
                })}
              </span>
            </span>
          </div>
          <SlotFilling
            caseLabel={(count, score) =>
              count === 1
                ? i18n.t("METHODOLOGY.K9X.S5B_CASE_ONE", { score })
                : i18n.t("METHODOLOGY.K9X.S5B_CASE_MANY", { count, score })
            }
            cases={props.data.indexExample.slotFilling.cases}
            lastNote={i18n.t("METHODOLOGY.K9X.S5B_LAST_NOTE")}
            levelLabel={(level) =>
              i18n.t("METHODOLOGY.K9X.S5B_LEVEL", { level })
            }
            minDetail={(weak) =>
              i18n.t("METHODOLOGY.K9X.S5B_MIN2", {
                score: weak.results[0],
                filler: weak.slots[weak.slots.length - 1],
                level: weak.level,
              })
            }
            minNote={i18n.t("METHODOLOGY.K9X.S5B_MIN1")}
            slots={parameters().N}
          />
        </figure>
      </MethodologySection>

      <footer class="methodology-page__footer">
        {i18n.t("METHODOLOGY.K9X.FOOTER")}
      </footer>
    </article>
  );
}

export default function K9xMethodologyPage() {
  const methodology = useK9xMethodology();

  return (
    <Suspense fallback={<MethodologySkeleton />}>
      <Show when={methodology.data}>
        {(data) => <K9xMethodologyContent data={data()} />}
      </Show>
    </Suspense>
  );
}
