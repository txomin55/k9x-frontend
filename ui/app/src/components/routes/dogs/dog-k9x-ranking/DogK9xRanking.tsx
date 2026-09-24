import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import type { Chart, ChartConfiguration, Plugin } from "chart.js";
import { createMemo, createSignal, Show, Suspense } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import {
  rankColorOf,
  rankLetterOf,
  withAlpha,
} from "@/components/routes/dogs/dog-k9x-index/rankBands";
import { densityLines, LINE_STEP, SCALE_MAX, SCALE_MIN } from "./density";
import { useObdxMethodology } from "@/features/methodology/api";
import { useChart } from "@/features/methodology/charts/useChart";
import { readChartTheme, SERIES_COLORS } from "@/features/methodology/theme";
import type { GlobalScaleRange } from "@/features/methodology/types";
import { usePublicK9xRanking } from "@/services/fetch-dogs/fetchDogs";
import type { K9xRanking } from "@/services/fetch-dogs/fetchDogs.types";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import { isDark } from "@/stores/theme/theme";
import { formatUtcDateOnly } from "@/utils/date";
import "./styles.css";

export type DogK9xRankingProps = {
  identification: string;
  /** The dog's country, which the ranking can be narrowed to. Without it only the world ranking is offered. */
  country?: IdNameDTO;
};

const SCOPE = { WORLD: "WORLD", COUNTRY: "COUNTRY" } as const;

const FALLBACK_COLOR = SERIES_COLORS.blue;
/** Lines outside the dog's band are washed out, so the dog's band is the one the eye lands on. */
const FIELD_ALPHA = 0.35;
/** Width of the ranking's bands, the unit the dog's own band is lit up in. */
const BAND_WIDTH = 20;
/** Index points between two labels of the axis. */
const X_LABEL_STEP = 100;
/** Lines shorter than this share of the tallest one are left to the dotted baseline, as the tails of the bell. */
const MIN_LINE_SHARE = 0.01;
/** Room left above the silhouette for the dog's label. */
const LABEL_ROOM = 34;

/**
 * Where the dog stands in the K9X world ranking, like a race's world ranking: its position among every charted
 * dog, the top percentage that puts it in, and the bell the whole field draws over the index, with a dotted line
 * and a label marking the dog. The ranking can be narrowed to the dog's country. Only
 * dogs whose index is 100 or more are charted, so a dog below that sees the field without being placed on it.
 * Until the cron has written the snapshot for the first time there is no ranking at all, and the panel says so.
 * The query is read under its own `<Suspense>`, as the index chart does.
 */
export default function DogK9xRanking(props: DogK9xRankingProps) {
  return (
    <Suspense fallback={<DogK9xRankingSkeleton />}>
      <DogK9xRankingContent
        identification={props.identification}
        country={props.country}
      />
    </Suspense>
  );
}

function DogK9xRankingSkeleton() {
  return (
    <div class="dog-k9x-ranking" aria-busy="true">
      <AtomSkeleton width="40%" height="var(--text-heading-sm)" />
      <div class="dog-k9x-ranking__chart-box">
        <AtomSkeleton width="100%" height="100%" />
      </div>
    </div>
  );
}

function DogK9xRankingContent(props: DogK9xRankingProps) {
  const i18n = useI18n();
  const [scope, setScope] = createSignal<string>(SCOPE.WORLD);
  const country = () =>
    scope() === SCOPE.COUNTRY ? props.country?.id : undefined;
  const query = usePublicK9xRanking(() => props.identification, country);
  // The rank bands come from the same document the index chart colors its dots with.
  const methodology = useObdxMethodology();
  const ranges = () => methodology.data?.globalScale.ranges ?? [];

  return (
    <div class="dog-k9x-ranking">
      <Show when={props.country?.id}>
        <AtomSegmentedControl
          title={i18n.t("DOGS.DETAIL.K9X_RANKING_SCOPE")}
          control={scope()}
          onControlChange={setScope}
          controls={[
            {
              value: SCOPE.WORLD,
              text: i18n.t("DOGS.DETAIL.K9X_RANKING_WORLD"),
              content: null,
            },
            {
              value: SCOPE.COUNTRY,
              text: props.country?.name ?? props.country?.id ?? "",
              content: null,
            },
          ]}
        />
      </Show>
      <Show
        when={query.data?.asOf != null ? query.data : undefined}
        fallback={
          <p class="dog-k9x-ranking__empty text-body-sm">
            {i18n.t("DOGS.DETAIL.K9X_RANKING_EMPTY")}
          </p>
        }
      >
        {(ranking) => (
          <>
            <DogK9xRankingSummary
              ranking={ranking()}
              country={scope() === SCOPE.COUNTRY ? props.country : undefined}
            />
            <DogK9xRankingChart ranking={ranking()} ranges={ranges()} />
            <Show when={ranking().asOf}>
              {(asOf) => (
                <p class="dog-k9x-ranking__note text-caption-sm">
                  {i18n.t("DOGS.DETAIL.K9X_RANKING_AS_OF", {
                    date: formatUtcDateOnly(asOf()),
                  })}
                </p>
              )}
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}

/** The dog's place in the field — "8 / 1623 · top 1%" — or why it is not on the chart. */
function DogK9xRankingSummary(props: {
  ranking: K9xRanking;
  country?: IdNameDTO;
}) {
  const i18n = useI18n();

  return (
    <Show
      when={props.ranking.highlight}
      fallback={
        <p class="dog-k9x-ranking__note text-body-sm">
          {i18n.t("DOGS.DETAIL.K9X_RANKING_OFF_CHART", {
            total: props.ranking.total,
          })}
        </p>
      }
    >
      {(highlight) => (
        <div class="dog-k9x-ranking__summary">
          <div class="dog-k9x-ranking__position">
            <span class="dog-k9x-ranking__position-value">
              {highlight().position}
            </span>
            <span class="dog-k9x-ranking__position-total text-body-sm">
              / {props.ranking.total}
            </span>
            <Show when={props.country}>
              {(country) => (
                <CountryFlag country={country().id} alt={country().name} />
              )}
            </Show>
          </div>
          <div class="dog-k9x-ranking__top">
            <span class="text-caption-sm">
              {i18n.t("DOGS.DETAIL.K9X_RANKING_TOP")}
            </span>
            <span class="dog-k9x-ranking__top-value">
              {highlight().topPercent}%
            </span>
          </div>
        </div>
      )}
    </Show>
  );
}

/** What the chart draws on top of the silhouette: the dotted baseline and, when placed, the dog's marker. */
type DogMarkerOptions = {
  baseline: string;
  dog?: { index: number; label: string; color: string; surface: string };
};

const BASELINE_DASH = [1, 5];
const MARKER_DASH = [2, 3];
const LABEL_FONT = "600 12px system-ui, sans-serif";
const LABEL_PADDING_X = 8;
const LABEL_HEIGHT = 22;

/**
 * Draws what Chart.js has no mark for: the dotted baseline the bell's tails fade into, and the dog's marker — a
 * dotted vertical line at its exact index topped with a pill carrying its rank letter and index in its band
 * color. It reads what to draw from the chart's options on every draw rather than from a closure: the plugin is
 * handed over once, when the chart is created, while the options are replaced on each update.
 */
export const dogMarkerPlugin: Plugin<"bar"> = {
  id: "dogMarker",
  afterDatasetsDraw: (chart: Chart<"bar">) => {
    const marker = (
      chart.options.plugins as { dogMarker?: DogMarkerOptions } | undefined
    )?.dogMarker;
    if (!marker) return;
    const { ctx, chartArea, scales } = chart;
    const middle = scales.y!.getPixelForValue(0);

    ctx.save();
    ctx.lineWidth = 1;
    ctx.strokeStyle = marker.baseline;
    ctx.setLineDash(BASELINE_DASH);
    ctx.beginPath();
    ctx.moveTo(chartArea.left, middle);
    ctx.lineTo(chartArea.right, middle);
    ctx.stroke();

    if (marker.dog) {
      const x = scales.x!.getPixelForValue(marker.dog.index);
      const labelTop = chartArea.top;
      ctx.font = LABEL_FONT;
      const width =
        ctx.measureText(marker.dog.label).width + 2 * LABEL_PADDING_X;
      // Kept inside the chart when the dog sits near either end of the scale.
      const left = Math.min(
        Math.max(x - width / 2, chartArea.left),
        chartArea.right - width,
      );

      ctx.strokeStyle = marker.dog.color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(MARKER_DASH);
      ctx.beginPath();
      ctx.moveTo(x, labelTop + LABEL_HEIGHT);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.fillStyle = marker.dog.surface;
      ctx.beginPath();
      ctx.roundRect(left, labelTop, width, LABEL_HEIGHT, LABEL_HEIGHT / 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = marker.dog.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        marker.dog.label,
        left + width / 2,
        labelTop + LABEL_HEIGHT / 2,
      );
    }
    ctx.restore();
  },
};

/**
 * The field's bell: one thin line every {@link LINE_STEP} index points, mirrored around the baseline so the
 * field reads as a silhouette, as a race's world ranking draws it. Each line takes the color of the rank band
 * it stands in, washed out except for the lines of the dog's own band. The shape is the smoothed density of
 * {@link densityLines}, so it carries no count axis and no tooltip — only the shape and the dog's place in it.
 */
function DogK9xRankingChart(props: {
  ranking: K9xRanking;
  ranges: GlobalScaleRange[];
}) {
  const i18n = useI18n();
  let canvas: HTMLCanvasElement | undefined;

  const config = createMemo<ChartConfiguration>(() => {
    isDark();

    const theme = readChartTheme();
    const { buckets, highlight } = props.ranking;
    const lines = densityLines(buckets);
    const tallest = Math.max(...lines.map((line) => line.value), 1);
    const colorOf = (value: number) =>
      rankColorOf(value, props.ranges, isDark(), FALLBACK_COLOR);
    // The dog's band is the 20-point band its index falls in; a perfect 1000 shares the last one.
    const dogsBand =
      highlight == null
        ? undefined
        : Math.min(
            Math.floor(highlight.index / BAND_WIDTH) * BAND_WIDTH,
            SCALE_MAX - BAND_WIDTH,
          );
    const isDogs = (x: number) =>
      dogsBand != null && x >= dogsBand && x < dogsBand + BAND_WIDTH;
    const drawn = lines.filter(
      (line) => line.value >= tallest * MIN_LINE_SHARE,
    );
    const dogColor = highlight
      ? rankColorOf(highlight.index, props.ranges, isDark(), FALLBACK_COLOR)
      : FALLBACK_COLOR;
    const letter = highlight
      ? rankLetterOf(highlight.index, props.ranges)
      : undefined;

    return {
      type: "bar",
      plugins: [dogMarkerPlugin as Plugin],
      data: {
        datasets: [
          {
            data: drawn.map((line) => ({
              x: line.x,
              y: [-line.value, line.value],
            })) as unknown as number[],
            backgroundColor: drawn.map((line) =>
              isDogs(line.x)
                ? colorOf(line.x)
                : withAlpha(colorOf(line.x), FIELD_ALPHA),
            ),
            borderWidth: 0,
            barThickness: 2,
            borderRadius: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        events: [],
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          dogMarker: {
            baseline: theme.tick,
            dog: highlight
              ? {
                  index: highlight.index,
                  label: letter
                    ? `${letter} ${highlight.index}`
                    : String(highlight.index),
                  color: dogColor,
                  surface: theme.surface,
                }
              : undefined,
          },
        },
        scales: {
          x: {
            type: "linear",
            min: SCALE_MIN,
            max: SCALE_MAX,
            grid: { display: false },
            ticks: {
              color: theme.tick,
              stepSize: X_LABEL_STEP,
              maxRotation: 0,
            },
          },
          y: {
            display: false,
            min: -tallest,
            // Headroom above the bell for the dog's label.
            max: tallest * (1 + LABEL_ROOM / 100),
          },
        },
      },
    };
  });

  useChart(
    () => canvas,
    () => config(),
  );

  return (
    <div class="dog-k9x-ranking__chart-box">
      <canvas
        ref={canvas}
        aria-label={i18n.t("DOGS.DETAIL.K9X_RANKING_CHART")}
      />
    </div>
  );
}
