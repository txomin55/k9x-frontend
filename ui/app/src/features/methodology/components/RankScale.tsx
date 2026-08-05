import { createMemo, For, Show } from "solid-js";
import { RANK_COLORS } from "../theme";
import type {
  GlobalScale,
  GlobalScaleRange,
  Grade,
  RankLetter,
} from "../types";

/**
 * Two hand-tuned viewBoxes instead of one scaled drawing: an SVG shrunk to phone
 * width renders its 12.5px labels at ~7px. The compact layout keeps the same
 * proportional scale but narrows the viewBox — so text stays at its real size —
 * and moves each band label onto its own line above the bar, which is the only
 * way a "FCI Grade 3 · 601–900" label fits next to a 300px track.
 */
const LAYOUTS = {
  wide: {
    width: 680,
    pad: 40,
    track: 600,
    letterY: 40,
    letterHeight: 36,
    tickY: 96,
    rowStart: 130,
    rowHeight: 28,
    rowGap: 14,
    labelAbove: false,
    minTickGap: 40,
  },
  compact: {
    width: 340,
    pad: 16,
    track: 308,
    letterY: 6,
    letterHeight: 30,
    tickY: 52,
    rowStart: 90,
    rowHeight: 18,
    rowGap: 34,
    labelAbove: true,
    minTickGap: 34,
  },
} as const;

const SEGMENT_GAP = 2;
const LABEL_GAP = 8;
const LABEL_OFFSET = 6;

type Props = {
  scale: GlobalScale;
  grades: Grade[];
  enabledLetters: Set<string>;
  gradeName: (grade: Grade) => string;
  manualLabel: (range: GlobalScaleRange) => string;
  manualTooltip: string;
  ariaLabel: string;
  compact?: boolean;
};

type Segment = { letter: RankLetter; from: number; to: number };

export default function RankScale(props: Props) {
  const layout = createMemo(() => (props.compact ? LAYOUTS.compact : LAYOUTS.wide));

  const position = (value: number) =>
    layout().pad +
    ((value - props.scale.min) / (props.scale.max - props.scale.min)) *
      layout().track;

  const manualRanges = createMemo(() =>
    props.scale.ranges.filter((range) => range.manual),
  );

  const rows = createMemo(() => props.grades.length + manualRanges().length);

  const height = createMemo(
    () =>
      layout().rowStart +
      rows() * (layout().rowHeight + layout().rowGap) +
      layout().rowGap,
  );

  /** Drops boundary labels that would collide once the track narrows. */
  const ticks = createMemo(() => {
    const boundaries = [
      props.scale.ranges[0]?.min ?? props.scale.min,
      ...props.scale.ranges.map((range) => range.max),
    ];

    return boundaries.filter((tick, index) => {
      if (index === 0 || index === boundaries.length - 1) return true;

      const previous = boundaries
        .slice(0, index)
        .reverse()
        .find(
          (candidate) =>
            position(tick) - position(candidate) >= layout().minTickGap,
        );

      return (
        previous !== undefined &&
        position(boundaries[boundaries.length - 1]!) - position(tick) >=
          layout().minTickGap
      );
    });
  });

  const segmentsOf = (min: number, max: number): Segment[] =>
    props.scale.ranges
      .filter((range) => range.max >= min && range.min <= max)
      .map((range) => ({
        letter: range.letter,
        from: Math.max(range.min, min),
        to: Math.min(range.max, max),
      }));

  const rowY = (index: number) =>
    layout().rowStart + index * (layout().rowHeight + layout().rowGap);

  const labelsOnLeft = (max: number) =>
    position(max) > layout().pad + layout().track * 0.72;

  const bandLabel = (text: string, y: number, max: number, min: number) => (
    <Show
      when={!layout().labelAbove}
      fallback={
        <text class="is-strong" x={layout().pad} y={y - LABEL_OFFSET}>
          {text}
        </text>
      }
    >
      <text
        dominant-baseline="central"
        text-anchor={labelsOnLeft(max) ? "end" : "start"}
        x={
          labelsOnLeft(max)
            ? position(min) - LABEL_GAP
            : position(max) + LABEL_GAP
        }
        y={y + layout().rowHeight / 2}
      >
        {text}
      </text>
    </Show>
  );

  return (
    <svg
      aria-label={props.ariaLabel}
      class="methodology-page__scale"
      role="img"
      viewBox={`0 0 ${layout().width} ${height()}`}
    >
      <For each={props.scale.ranges}>
        {(range) => {
          const colors = RANK_COLORS[range.letter];
          const x = () => position(range.min);
          const width = () =>
            Math.max(position(range.max) - x() - SEGMENT_GAP, 1);
          const enabled = () => props.enabledLetters.has(range.letter);

          return (
            <g classList={{ "is-disabled": !enabled() }}>
              <Show when={range.manual}>
                <title>{props.manualTooltip}</title>
              </Show>
              <rect
                fill={colors.bg}
                height={layout().letterHeight}
                rx="4"
                stroke={colors.fg}
                stroke-width="0.5"
                width={width()}
                x={x()}
                y={layout().letterY}
              />
              <text
                class="is-letter"
                dominant-baseline="central"
                style={{ fill: colors.fg }}
                text-anchor="middle"
                x={x() + width() / 2}
                y={layout().letterY + layout().letterHeight / 2}
              >
                {range.letter}
              </text>
            </g>
          );
        }}
      </For>

      <For each={ticks()}>
        {(tick, index) => (
          <text
            text-anchor={
              index() === 0
                ? "start"
                : index() === ticks().length - 1
                  ? "end"
                  : "middle"
            }
            x={position(tick)}
            y={layout().tickY}
          >
            {tick}
          </text>
        )}
      </For>

      <For each={props.grades}>
        {(grade, index) => {
          const y = () => rowY(index());

          return (
            <g>
              <For each={segmentsOf(grade.band.min, grade.band.max)}>
                {(segment) => (
                  <rect
                    fill={RANK_COLORS[segment.letter].bg}
                    height={layout().rowHeight}
                    rx="4"
                    stroke={RANK_COLORS[segment.letter].fg}
                    stroke-width="0.5"
                    width={Math.max(
                      position(segment.to) - position(segment.from) - 1,
                      1,
                    )}
                    x={position(segment.from)}
                    y={y()}
                  />
                )}
              </For>
              {bandLabel(
                `${props.gradeName(grade)} · ${grade.band.min}–${grade.band.max}`,
                y(),
                grade.band.max,
                grade.band.min,
              )}
            </g>
          );
        }}
      </For>

      <For each={manualRanges()}>
        {(range, index) => {
          const y = () => rowY(props.grades.length + index());

          return (
            <g>
              <title>{props.manualTooltip}</title>
              <rect
                fill={RANK_COLORS[range.letter].bg}
                height={layout().rowHeight}
                rx="4"
                stroke={RANK_COLORS[range.letter].fg}
                stroke-width="0.5"
                width={Math.max(
                  position(range.max) - position(range.min) - 1,
                  1,
                )}
                x={position(range.min)}
                y={y()}
              />
              <Show
                when={!layout().labelAbove}
                fallback={
                  <text
                    class="is-strong"
                    x={layout().pad}
                    y={y() - LABEL_OFFSET}
                  >
                    {props.manualLabel(range)}
                  </text>
                }
              >
                <text
                  dominant-baseline="central"
                  text-anchor="end"
                  x={position(range.min) - LABEL_GAP}
                  y={y() + layout().rowHeight / 2}
                >
                  {props.manualLabel(range)}
                </text>
              </Show>
            </g>
          );
        }}
      </For>
    </svg>
  );
}
