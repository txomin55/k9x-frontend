import { createMemo, createSignal, For, Show, Suspense } from "solid-js";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { useI18n } from "@/stores/i18n/i18n";
import PageSeo from "@/components/common/page-seo/PageSeo";
import { useObdxMethodology } from "./api";
import FederationSelector from "./components/FederationSelector";
import MeritCurve from "./components/MeritCurve";
import MethodologyHeader from "./components/MethodologyHeader";
import MethodologySection from "./components/MethodologySection";
import RankScale from "./components/RankScale";
import TierChart from "./components/TierChart";
import { RANK_COLORS, SERIES_COLORS } from "./theme";
import type {
  CompetitorRange,
  GlobalScaleRange,
  Grade,
  LocalizedText,
  ObdxMethodology,
} from "./types";
import "./styles.css";

const DEFAULT_FEDERATION = "FCI";

function MethodologySkeleton() {
  return (
    <div class="methodology-page">
      <For each={Array.from({ length: 3 })}>
        {() => <AtomSkeleton variant="rectangular" />}
      </For>
    </div>
  );
}

function ObdxMethodologyContent(props: { data: ObdxMethodology }) {
  const i18n = useI18n();

  const [federationId, setFederationId] = createSignal(DEFAULT_FEDERATION);
  const [gradeId, setGradeId] = createSignal<string | undefined>();

  const localized = (text: LocalizedText) =>
    i18n.locale() === "es" ? text.es : text.en;

  const federation = createMemo(
    () =>
      props.data.federations.find(
        (candidate) => candidate.id === federationId(),
      ) ?? props.data.federations[0]!,
  );

  const grade = createMemo(
    () =>
      federation().grades.find((candidate) => candidate.id === gradeId()) ??
      federation().grades[0]!,
  );

  const enabledLetters = createMemo(
    () =>
      new Set(
        federation().grades.flatMap((candidate) =>
          candidate.possibleLetters
            .map((letter) => letter.replace(
              props.data.globalScale.internationalSuffix,
              "",
            ))
            .filter(
              (letter) =>
                !props.data.globalScale.ranges.some(
                  (range) => range.letter === letter && range.manual,
                ),
            ),
        ),
      ),
  );

  const meritGrade = createMemo(() =>
    props.data.federations
      .flatMap((candidate) => candidate.grades)
      .find(
        (candidate) =>
          candidate.id === props.data.meritCurve.context.configuration,
      ),
  );

  const meritGradeName = createMemo(() => {
    const found = meritGrade();
    return found ? localized(found.name) : props.data.meritCurve.context.configuration;
  });

  const qualificationLabel = (index: number) => {
    const qualification =
      props.data.meritCurve.context.qualifications[index]!;
    return i18n.locale() === "es" ? qualification.id : qualification.nameEn;
  };

  const qualificationsSummary = createMemo(() =>
    props.data.meritCurve.context.qualifications
      .map(
        (qualification, index) =>
          `${qualificationLabel(index)} (${qualification.score})`,
      )
      .join(", "),
  );

  const topQualification = createMemo(() => {
    const { qualifications } = props.data.meritCurve.context;
    const index = qualifications.findIndex(
      (qualification) => qualification.top,
    );
    return qualificationLabel(index >= 0 ? index : qualifications.length - 1);
  });

  const kneeValue = createMemo(() => {
    const knee = props.data.meritCurve.series.find(
      (series) => series.id === "knee",
    );
    return (knee?.points[0]?.y ?? 0).toLocaleString(i18n.locale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  });

  const competitorsLabel = (
    competitors: CompetitorRange,
    tier: number,
    index: number,
    keys: { first: string; range: string; last: string },
  ) => {
    if (index === 0) {
      return i18n.t(keys.first, { max: (competitors.max ?? 0) + 1, tier });
    }

    if (competitors.max === null) {
      return i18n.t(keys.last, { min: competitors.min, tier });
    }

    return i18n.t(keys.range, {
      min: competitors.min,
      max: competitors.max,
      tier,
    });
  };

  const tierLabels = createMemo(() =>
    grade().tiers.map((tier, index) =>
      competitorsLabel(tier.competitors, tier.tier, index, {
        first: "METHODOLOGY.CHART.TIER_LABEL_FIRST",
        range: "METHODOLOGY.CHART.TIER_LABEL_RANGE",
        last: "METHODOLOGY.CHART.TIER_LABEL_LAST",
      }),
    ),
  );

  const scaleProps = createMemo(() => ({
    ariaLabel: i18n.t("METHODOLOGY.OBDX.S1_FIG", {
      min: props.data.globalScale.min,
      max: props.data.globalScale.max,
    }),
    enabledLetters: enabledLetters(),
    gradeName: (item: Grade) => localized(item.name),
    grades: federation().grades,
    manualLabel: (range: GlobalScaleRange) =>
      i18n.t("METHODOLOGY.OBDX.S1_MANUAL_S", {
        letter: range.letter,
        min: range.min,
        max: range.max,
      }),
    manualTooltip: i18n.t("METHODOLOGY.OBDX.S1_MANUAL_S_TOOLTIP", {
      cap: props.data.globalScale.automaticCap,
      letter:
        props.data.globalScale.ranges.find((range) => range.manual)?.letter ??
        "",
    }),
    scale: props.data.globalScale,
  }));

  const meritTickLabel = (value: number) => {
    const { qualifications, maxScore } = props.data.meritCurve.context;
    const index = qualifications.findIndex(
      (qualification) => qualification.score === value,
    );

    if (index >= 0) {
      return i18n.t("METHODOLOGY.CHART.MERIT_TICK", {
        score: value,
        label: qualificationLabel(index),
      });
    }

    if (value === maxScore) {
      return i18n.t("METHODOLOGY.CHART.MERIT_TICK_MAX", { score: value });
    }

    const onCurve = props.data.meritCurve.series
      .find((series) => series.id === "curve")
      ?.points.some((point) => point.x === value);

    return onCurve ? String(value) : "";
  };

  return (
    <article class="methodology-page">
      <PageSeo
        title={i18n.t("METHODOLOGY.OBDX.META_TITLE")}
        description={i18n.t("METHODOLOGY.OBDX.META_DESCRIPTION")}
      />

      <MethodologyHeader
        brand={i18n.t("METHODOLOGY.OBDX.BRAND")}
        discipline="obdx"
        subtitle={i18n.t("METHODOLOGY.OBDX.SUBTITLE")}
        title={i18n.t("METHODOLOGY.OBDX.TITLE")}
      >
        <div class="methodology-page__chips" aria-hidden="true">
          <For each={props.data.globalScale.ranges}>
            {(range, index) => (
              <span
                class="methodology-page__chip"
                style={{
                  background: RANK_COLORS[range.letter].bg,
                  color: RANK_COLORS[range.letter].fg,
                  "border-color": RANK_COLORS[range.letter].fg,
                }}
              >
                {range.letter}
                <small>
                  {index() === 0
                    ? i18n.t("METHODOLOGY.CHART.CHIP_UPTO", { max: range.max })
                    : i18n.t("METHODOLOGY.CHART.CHIP_RANGE", {
                        min: range.min,
                        max: range.max,
                      })}
                </small>
              </span>
            )}
          </For>
        </div>
      </MethodologyHeader>

      <FederationSelector
        federationId={federation().id}
        federationLabel={i18n.t("METHODOLOGY.OBDX.FEDERATION_LABEL")}
        federations={props.data.federations}
        gradeId={grade().id}
        gradeLabel={i18n.t("METHODOLOGY.OBDX.GRADE_LABEL")}
        gradeName={(item: Grade) => localized(item.name)}
        grades={federation().grades}
        onSelectFederation={(id) => {
          setFederationId(id);
          setGradeId(undefined);
        }}
        onSelectGrade={setGradeId}
      />

      <MethodologySection
        discipline="obdx"
        eyebrow={i18n.t("METHODOLOGY.OBDX.S1_EYEBROW")}
        lede={i18n.t("METHODOLOGY.OBDX.S1_LEDE")}
        note={i18n.t("METHODOLOGY.OBDX.S1_NOTE")}
        title={i18n.t("METHODOLOGY.OBDX.S1_TITLE")}
      >
        <figure class="methodology-page__figure">
          <div class="methodology-page__fig-title">
            {i18n.t("METHODOLOGY.OBDX.S1_FIG", {
              min: props.data.globalScale.min,
              max: props.data.globalScale.max,
            })}
          </div>
          <div class="methodology-page__fig-sub">
            {i18n.t("METHODOLOGY.OBDX.S1_FIGSUB")}
          </div>
          <div class="methodology-page__scale-wide">
            <RankScale {...scaleProps()} />
          </div>
          <div class="methodology-page__scale-compact">
            <RankScale {...scaleProps()} compact />
          </div>
        </figure>
      </MethodologySection>

      <MethodologySection
        discipline="obdx"
        eyebrow={i18n.t("METHODOLOGY.OBDX.S2_EYEBROW")}
        lede={i18n.t("METHODOLOGY.OBDX.S2_LEDE", {
          bonus: props.data.international.bonusValue,
          suffix: props.data.globalScale.internationalSuffix,
        })}
        note={i18n.t("METHODOLOGY.OBDX.S2_NOTE")}
        title={i18n.t("METHODOLOGY.OBDX.S2_TITLE")}
      >
        <figure class="methodology-page__figure">
          <div class="methodology-page__fig-title">
            {i18n.t("METHODOLOGY.OBDX.S2_FIG", {
              grade: localized(grade().name),
            })}
          </div>
          <div class="methodology-page__fig-sub">
            {i18n.t("METHODOLOGY.OBDX.S2_FIGSUB", {
              min: grade().band.min,
              max: grade().band.max,
            })}
          </div>
          <div class="methodology-page__legend">
            <span>
              <span
                class="methodology-page__swatch"
                style={{ background: SERIES_COLORS.blue }}
              />
              <span>{i18n.t("METHODOLOGY.OBDX.S2_LEG_TIER")}</span>
            </span>
            <span>
              <span
                class="methodology-page__swatch"
                style={{ background: SERIES_COLORS.obdx }}
              />
              <span>
                {i18n.t("METHODOLOGY.OBDX.S2_LEG_INTL", {
                  bonus: grade().internationalBonus.bonusValue,
                  suffix: props.data.globalScale.internationalSuffix,
                })}
              </span>
            </span>
          </div>
          <TierChart
            axisLabel={i18n.t("METHODOLOGY.CHART.TIER_AXIS", {
              grade: localized(grade().name),
              min: grade().band.min,
              max: grade().band.max,
            })}
            grade={grade()}
            internationalTooltip={(score) =>
              i18n.t("METHODOLOGY.CHART.TOOLTIP_TIER_INTL", { score })
            }
            nationalTooltip={(score) =>
              i18n.t("METHODOLOGY.CHART.TOOLTIP_TIER_NATIONAL", { score })
            }
            tierLabels={tierLabels()}
          />
        </figure>
        <table class="methodology-page__table">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th>{i18n.t("METHODOLOGY.OBDX.S2_TH_COMP")}</th>
                <th>{i18n.t("METHODOLOGY.OBDX.S2_TH_TIER")}</th>
                <th>{i18n.t("METHODOLOGY.OBDX.S2_TH_TIERCONTRIB")}</th>
                <th>{i18n.t("METHODOLOGY.OBDX.S2_TH_FOREIGN")}</th>
              </tr>
            </thead>
            <tbody>
              <For each={grade().tiers}>
                {(tier, index) => (
                  <tr>
                    <td>
                      {competitorsLabel(tier.competitors, tier.tier, index(), {
                        first: "METHODOLOGY.CHART.TABLE_COMP_FIRST",
                        range: "METHODOLOGY.CHART.TABLE_COMP_RANGE",
                        last: "METHODOLOGY.CHART.TABLE_COMP_LAST",
                      })}
                    </td>
                    <td>{tier.tier}</td>
                    <td>
                      {i18n.t("METHODOLOGY.CHART.TIER_PCT", {
                        pct: tier.tierContributionPctOfRange,
                      })}
                    </td>
                    <td>{tier.requiredForeigners}</td>
                  </tr>
                )}
              </For>
            </tbody>
        </table>
      </MethodologySection>

      <MethodologySection
        discipline="obdx"
        eyebrow={i18n.t("METHODOLOGY.OBDX.S3_EYEBROW")}
        lede={i18n.t("METHODOLOGY.OBDX.S3_LEDE", {
          unlock: props.data.meritCurve.context.parameters.unlockPct,
          top: topQualification(),
        })}
        note={i18n.t("METHODOLOGY.OBDX.S3_NOTE")}
        title={i18n.t("METHODOLOGY.OBDX.S3_TITLE")}
      >
        <figure class="methodology-page__figure">
          <div class="methodology-page__fig-title">
            {i18n.t("METHODOLOGY.OBDX.S3_FIG", {
              grade: meritGradeName(),
              score: props.data.meritCurve.context.eventScore,
            })}
          </div>
          <div class="methodology-page__fig-sub">
            {i18n.t("METHODOLOGY.OBDX.S3_FIGSUB", {
              min: props.data.meritCurve.context.band.min,
              max: props.data.meritCurve.context.band.max,
              maxScore: props.data.meritCurve.context.maxScore,
              qualifications: qualificationsSummary(),
            })}
          </div>
          <div class="methodology-page__legend">
            <span>
              <span
                class="methodology-page__swatch--dash"
                style={{ "border-color": SERIES_COLORS.gray }}
              />
              <span>
                {i18n.t("METHODOLOGY.OBDX.S3_LEG_FLOOR", {
                  first: qualificationLabel(0),
                  floor:
                    props.data.meritCurve.context.parameters
                      .floorBelowFirstQualification,
                })}
              </span>
            </span>
            <span>
              <span
                class="methodology-page__swatch--line"
                style={{ "border-color": SERIES_COLORS.blue }}
              />
              <span>{i18n.t("METHODOLOGY.OBDX.S3_LEG_CURVE")}</span>
            </span>
            <span>
              <span
                class="methodology-page__swatch--dot"
                style={{
                  background: SERIES_COLORS.red,
                  color: SERIES_COLORS.red,
                }}
              />
              <span>
                {i18n.t("METHODOLOGY.OBDX.S3_LEG_KNEE", {
                  top: topQualification(),
                  value: kneeValue(),
                  share: Math.round(
                    props.data.meritCurve.context.parameters.kneeShare * 100,
                  ),
                })}
              </span>
            </span>
          </div>
          <MeritCurve
            meritCurve={props.data.meritCurve}
            tickLabel={meritTickLabel}
            tooltip={(x, y) =>
              i18n.t("METHODOLOGY.CHART.TOOLTIP_MERIT", { x, y })
            }
            xTitle={i18n.t("METHODOLOGY.CHART.MERIT_X", {
              max: props.data.meritCurve.context.maxScore,
            })}
            yTitle={i18n.t("METHODOLOGY.CHART.MERIT_Y")}
          />
        </figure>
      </MethodologySection>

      <footer class="methodology-page__footer">
        {i18n.t("METHODOLOGY.OBDX.FOOTER")}
      </footer>
    </article>
  );
}

export default function ObdxMethodologyPage() {
  const methodology = useObdxMethodology();

  return (
    <Suspense fallback={<MethodologySkeleton />}>
      <Show when={methodology.data}>
        {(data) => <ObdxMethodologyContent data={data()} />}
      </Show>
    </Suspense>
  );
}
