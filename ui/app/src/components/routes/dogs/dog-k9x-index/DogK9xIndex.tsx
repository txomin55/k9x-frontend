import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { Link } from "@tanstack/solid-router";
import type {
  ActiveElement,
  Chart,
  ChartConfiguration,
  ChartEvent,
  ScriptableLineSegmentContext,
} from "chart.js";
import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import PositionMedal from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-medal/PositionMedal";
import { useObdxMethodology } from "@/features/methodology/api";
import { useChart } from "@/features/methodology/charts/useChart";
import {
  AXIS_FONT,
  RANK_COLORS,
  readChartTheme,
  SERIES_COLORS,
} from "@/features/methodology/theme";
import type { GlobalScaleRange } from "@/features/methodology/types";
import { usePublicDogIndex } from "@/services/fetch-dogs/fetchDogs";
import type {
  DogIndexEvent,
  DogIndexPoint,
  DogIndexTimeline,
} from "@/services/fetch-dogs/fetchDogs.types";
import { useI18n } from "@/stores/i18n/i18n";
import { isDark } from "@/stores/theme/theme";
import { formatUtcDateOnly } from "@/utils/date";
import { rankColorOf, rankLetterOf, withAlpha } from "./rankBands";
import "./styles.css";

export type DogK9xIndexProps = {
  identification: string;
};

const INDEX_MIN = 0;
const INDEX_MAX = 1000;
const Y_STEP = 100;
const FALLBACK_COLOR = SERIES_COLORS.blue;
const SCORE_ALPHA = 0.35;
const FRESHNESS_DEGRADATION_COLOR = SERIES_COLORS.red;
const DASH = [6, 4];
/** Share of the time span left empty on each side, so the dots at the edges are not cut in half. */
const X_PADDING_RATIO = 0.03;
/** Minimum side padding, for a dog whose whole history spans a few days. */
const MIN_X_PADDING = 15 * 86_400_000;
/** Share of the time span the index takes to climb into an event, so the jump reads as a curve. */
const JUMP_RATIO = 0.012;
/** Datasets whose dots open the event card: the faint score dots and the solid index dots. */
const SCORE_DATASET = 1;
const EVENT_DATASET = 2;
/** Half the card's max width, to keep it inside the chart when the dot is near an edge. */
const CARD_HALF_WIDTH = 140;

/** What a point of the chart carries so a click can open its event. */
type ChartPoint = {
  x: number;
  y: number;
  kind: "curve" | "score" | "event" | "marker";
  event?: DogIndexEvent;
};

/** The open event card: the event and where its dot sits inside the chart box, in CSS pixels. */
type Selection = { event: DogIndexEvent; x: number; y: number };

/**
 * The API sends two samples at each event instant — the index just before and just after — which a line
 * draws as a vertical step. The "before" sample is moved a little earlier (never past half the gap to the
 * sample preceding it) so that, with monotone interpolation, the line climbs into the event as a rounded
 * shoulder that still lands exactly on the event's dot and never overshoots.
 */
export const roundJumps = (curve: DogIndexPoint[], jump: number) =>
  curve.map((point, index): ChartPoint => {
    const next = curve[index + 1];
    const previous = curve[index - 1];
    const isBeforeJump = next?.timestamp === point.timestamp;
    const room = previous ? (point.timestamp - previous.timestamp) / 2 : jump;

    return {
      x: isBeforeJump
        ? point.timestamp - Math.min(jump, room)
        : point.timestamp,
      y: point.index,
      kind: "curve",
    };
  });

const formatScore = (score: number) => Math.round(score * 100) / 100;

const formatMonth = (timestamp: number) =>
  new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    year: "2-digit",
    timeZone: "UTC",
  });

/** A vertical line across the whole index scale, drawn as a two-point dataset: Chart.js has no rule mark. */
const verticalLine = (x: number): ChartPoint[] => [
  { x, y: INDEX_MIN, kind: "marker" },
  { x, y: INDEX_MAX, kind: "marker" },
];

/** The podium places, which the classification draws as a rosette instead of a number. */
const medalOf = (position: number | null): 1 | 2 | 3 | undefined =>
  position === 1 || position === 2 || position === 3 ? position : undefined;

/**
 * The dog's K9X index over its career, like the methodology's career profiles: the line is the index, solid
 * dots the index right after each event, faint dots what the dog scored in it, all colored by the rank band
 * they fall in. A red dashed vertical line marks where the whole index starts fading if the dog does not
 * compete again. Clicking a dot opens a card with the event, which links to its classification with the dog
 * pinned. The query is read under its own `<Suspense>`, as the participations tab does.
 */
export default function DogK9xIndex(props: DogK9xIndexProps) {
  return (
    <Suspense fallback={<DogK9xIndexSkeleton />}>
      <DogK9xIndexContent identification={props.identification} />
    </Suspense>
  );
}

function DogK9xIndexSkeleton() {
  return (
    <div class="dog-k9x-index" aria-busy="true">
      <AtomSkeleton width="60%" />
      <div class="dog-k9x-index__chart-box">
        <AtomSkeleton width="100%" height="100%" />
      </div>
    </div>
  );
}

function DogK9xIndexContent(props: DogK9xIndexProps) {
  const i18n = useI18n();
  const query = usePublicDogIndex(() => props.identification);
  // The rank bands come from the same static document the methodology page draws its scale from.
  const methodology = useObdxMethodology();
  const ranges = () => methodology.data?.globalScale.ranges ?? [];
  const bandGradient = () =>
    `linear-gradient(to right, ${Object.values(RANK_COLORS)
      .map((colors) => (isDark() ? colors.bg : colors.fg))
      .join(", ")})`;

  return (
    <Show
      when={query.data?.events.length ? query.data : undefined}
      fallback={
        <p class="dog-k9x-index__empty text-body-sm">
          {i18n.t("DOGS.DETAIL.K9X_EMPTY")}
        </p>
      }
    >
      {(timeline) => (
        <div class="dog-k9x-index">
          <div class="dog-k9x-index__legend text-caption-sm">
            <span>
              <span
                class="dog-k9x-index__swatch--band"
                style={{ background: bandGradient() }}
              />
              {i18n.t("DOGS.DETAIL.K9X_LEGEND_INDEX")}
            </span>
            <span>
              <span
                class="dog-k9x-index__swatch--dot"
                style={{ background: withAlpha(SERIES_COLORS.gray, 0.5) }}
              />
              {i18n.t("DOGS.DETAIL.K9X_LEGEND_SCORE")}
            </span>
            <Show when={timeline().freshnessDegradationFrom != null}>
              <span>
                <span
                  class="dog-k9x-index__swatch--dash"
                  style={{ "border-color": FRESHNESS_DEGRADATION_COLOR }}
                />
                {i18n.t("DOGS.DETAIL.K9X_LEGEND_FRESHNESS_DEGRADATION")}
              </span>
            </Show>
          </div>
          <DogK9xIndexChart
            identification={props.identification}
            timeline={timeline()}
            ranges={ranges()}
          />
        </div>
      )}
    </Show>
  );
}

function DogK9xIndexChart(props: {
  identification: string;
  timeline: DogIndexTimeline;
  ranges: GlobalScaleRange[];
}) {
  const i18n = useI18n();
  let canvas: HTMLCanvasElement | undefined;
  let box: HTMLDivElement | undefined;
  let card: HTMLDivElement | undefined;
  const [selection, setSelection] = createSignal<Selection>();

  const colorOf = (value: number) =>
    rankColorOf(value, props.ranges, isDark(), FALLBACK_COLOR);

  /** The event behind the dots under the pointer, ignoring the line, whose samples are not events. */
  const eventDotAt = (elements: ActiveElement[], chart: Chart) =>
    elements
      .filter(
        (element) =>
          element.datasetIndex === SCORE_DATASET ||
          element.datasetIndex === EVENT_DATASET,
      )
      .map((element) => ({
        element,
        point: chart.data.datasets[element.datasetIndex]!.data[
          element.index
        ] as unknown as ChartPoint,
      }))
      .find(({ point }) => point.event);

  const onChartClick = (
    _event: ChartEvent,
    elements: ActiveElement[],
    chart: Chart,
  ) => {
    const hit = eventDotAt(elements, chart);
    if (!hit?.point.event) {
      setSelection(undefined);
      return;
    }
    // The card opens on the solid dot even when the faint one was clicked: it describes the index it left.
    const indexDot = chart
      .getDatasetMeta(EVENT_DATASET)
      .data.find(
        (_element, index) =>
          (
            chart.data.datasets[EVENT_DATASET]!.data[
              index
            ] as unknown as ChartPoint
          ).event === hit.point.event,
      );
    const anchor = indexDot ?? hit.element.element;
    setSelection({ event: hit.point.event, x: anchor.x, y: anchor.y });
  };

  const onChartHover = (
    _event: ChartEvent,
    elements: ActiveElement[],
    chart: Chart,
  ) => {
    chart.canvas.style.cursor = eventDotAt(elements, chart)
      ? "pointer"
      : "default";
  };

  // The card stays open until the reader clicks elsewhere or presses Escape. A click on the canvas is left to
  // the chart, which either opens another event or closes this one.
  onMount(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (card?.contains(target) || canvas?.contains(target)) return;
      setSelection(undefined);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelection(undefined);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    });
  });

  const config = createMemo<ChartConfiguration>(() => {
    isDark();

    const theme = readChartTheme();
    const { events, curve, freshnessDegradationFrom } = props.timeline;
    const xMin = curve[0]?.timestamp ?? events[0]!.date;
    // The chart reaches the freshness line even while it is still ahead, so the reader sees when fading starts.
    const xMax = Math.max(
      curve.at(-1)?.timestamp ?? xMin,
      freshnessDegradationFrom ?? xMin,
    );
    const xPadding = Math.max((xMax - xMin) * X_PADDING_RATIO, MIN_X_PADDING);
    const scores = events.filter((event) => event.eventScore != null);

    return {
      type: "line",
      data: {
        datasets: [
          {
            data: roundJumps(curve, (xMax - xMin) * JUMP_RATIO),
            cubicInterpolationMode: "monotone" as const,
            borderColor: FALLBACK_COLOR,
            // Each stretch of the line takes the band of the higher of its two ends, so a jump into a new
            // band is drawn in the band it reaches.
            segment: {
              borderColor: (context: ScriptableLineSegmentContext) =>
                colorOf(
                  Math.max(context.p0.parsed.y ?? 0, context.p1.parsed.y ?? 0),
                ),
            },
            borderWidth: 2,
            pointRadius: 0,
            pointHitRadius: 0,
          },
          {
            type: "scatter" as const,
            data: scores.map(
              (event): ChartPoint => ({
                x: event.date,
                y: event.eventScore!,
                kind: "score",
                event,
              }),
            ),
            pointRadius: 5,
            pointHoverRadius: 6,
            pointBackgroundColor: scores.map((event) =>
              withAlpha(colorOf(event.eventScore!), SCORE_ALPHA),
            ),
            pointBorderWidth: 0,
          },
          {
            type: "scatter" as const,
            data: events.map(
              (event): ChartPoint => ({
                x: event.date,
                y: event.index,
                kind: "event",
                event,
              }),
            ),
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: events.map((event) => colorOf(event.index)),
            pointBorderColor: theme.surface,
            pointBorderWidth: 2,
          },
          ...(freshnessDegradationFrom == null
            ? []
            : [
                {
                  type: "line" as const,
                  data: verticalLine(freshnessDegradationFrom),
                  borderColor: FRESHNESS_DEGRADATION_COLOR,
                  borderDash: DASH,
                  borderWidth: 1,
                  pointRadius: 0,
                  pointHitRadius: 0,
                },
              ]),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: true },
        onClick: onChartClick,
        onHover: onChartHover,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        scales: {
          x: {
            type: "linear",
            min: xMin - xPadding,
            max: xMax + xPadding,
            grid: { color: theme.grid },
            ticks: {
              color: theme.tick,
              maxTicksLimit: 8,
              callback: (value) => formatMonth(Number(value)),
            },
          },
          y: {
            min: INDEX_MIN,
            max: INDEX_MAX,
            grid: { color: theme.grid },
            ticks: { color: theme.tick, stepSize: Y_STEP },
            title: {
              display: true,
              text: i18n.t("DOGS.DETAIL.K9X_AXIS_INDEX"),
              color: theme.tick,
              font: AXIS_FONT,
            },
          },
        },
      },
    };
  });

  useChart(
    () => canvas,
    () => config(),
  );

  /** Centered over its dot, but kept inside the chart box; it drops below the dot when there is no room above. */
  const cardStyle = (open: Selection) => {
    const width = box?.clientWidth ?? 0;
    const left = Math.min(
      Math.max(open.x, CARD_HALF_WIDTH),
      Math.max(width - CARD_HALF_WIDTH, CARD_HALF_WIDTH),
    );
    const above = open.y > (box?.clientHeight ?? 0) / 2;
    return {
      left: `${left}px`,
      top: `${open.y}px`,
      transform: above
        ? "translate(-50%, calc(-100% - var(--unit-1)))"
        : "translate(-50%, var(--unit-1))",
    };
  };

  return (
    <div class="dog-k9x-index__chart-box" ref={box}>
      <canvas ref={canvas} aria-label={i18n.t("DOGS.DETAIL.K9X_CHART")} />
      <Show when={selection()}>
        {(open) => (
          <div
            class="dog-k9x-index__card"
            ref={card}
            role="dialog"
            aria-label={open().event.event.name}
            style={cardStyle(open())}
          >
            <EventCard
              identification={props.identification}
              event={open().event}
              colorOf={colorOf}
              letterOf={(value) => rankLetterOf(value, props.ranges)}
            />
          </div>
        )}
      </Show>
    </div>
  );
}

/** The event behind a dot: where and when, how it went, and the index it left, in the app's own card. */
function EventCard(props: {
  identification: string;
  event: DogIndexEvent;
  colorOf: (value: number) => string;
  letterOf: (value: number) => string | undefined;
}) {
  const i18n = useI18n();
  const position = () => props.event.position;

  const figures = () => [
    ...(props.event.eventScore == null
      ? []
      : [
          {
            label: i18n.t("DOGS.DETAIL.K9X_CARD_SCORE"),
            value: formatScore(props.event.eventScore),
          },
        ]),
    {
      label: i18n.t("DOGS.DETAIL.K9X_CARD_INDEX"),
      value: props.event.index,
    },
  ];

  return (
    <>
      <Link
        class="dog-k9x-index__card-title text-body-sm"
        to="/stages/$id/events/$eventId/classification"
        params={{ id: props.event.stageId, eventId: props.event.event.id }}
        search={{ pinned: props.identification }}
      >
        <span>{props.event.event.name}</span>
        <span aria-hidden="true">→</span>
      </Link>
      <div class="dog-k9x-index__card-meta text-caption-sm">
        <Show when={props.event.country}>
          {(country) => (
            <CountryFlag country={country().id} alt={country().name} />
          )}
        </Show>
        <span>{formatUtcDateOnly(props.event.date)}</span>
      </div>
      <Show
        when={!props.event.restricted}
        fallback={
          <p class="dog-k9x-index__card-note text-caption-sm">
            {i18n.t("DOGS.DETAIL.PARTICIPATIONS_RESTRICTED")}
          </p>
        }
      >
        <div class="dog-k9x-index__card-result">
          <span
            class="dog-k9x-index__card-position text-heading-xs"
            title={i18n.t("DOGS.DETAIL.PARTICIPATIONS_POSITION")}
          >
            <Show
              when={medalOf(position())}
              fallback={position() == null ? "—" : `${position()}º`}
            >
              {(medal) => <PositionMedal position={medal()} />}
            </Show>
          </span>
          <Show when={props.event.totalScore != null}>
            <span class="text-body-sm">
              {formatScore(props.event.totalScore!)}{" "}
              <span class="text-caption-sm">
                {i18n.t("DOGS.DETAIL.PARTICIPATIONS_POINTS")}
              </span>
            </span>
          </Show>
        </div>
      </Show>
      <dl class="dog-k9x-index__card-figures">
        <For each={figures()}>
          {(figure) => (
            <div class="dog-k9x-index__card-figure">
              <dt class="text-caption-sm">{figure.label}</dt>
              <dd
                class="dog-k9x-index__card-badge text-caption-md"
                style={{
                  "border-color": props.colorOf(figure.value),
                  color: props.colorOf(figure.value),
                }}
              >
                <Show when={props.letterOf(figure.value)}>
                  {(letter) => (
                    <span class="dog-k9x-index__card-letter">{letter()}</span>
                  )}
                </Show>
                {figure.value}
              </dd>
            </div>
          )}
        </For>
      </dl>
    </>
  );
}
