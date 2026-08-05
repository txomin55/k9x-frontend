import { createMemo, For, Show } from "solid-js";
import { SERIES_COLORS } from "../theme";
import type { SlotFillingCase } from "../types";

const REAL_SLOT = {
  background: SERIES_COLORS.blue,
  color: "#ffffff",
};

const FILLER_SLOT = {
  background: SERIES_COLORS.fillerBg,
  color: SERIES_COLORS.fillerFg,
  "border-color": SERIES_COLORS.obdx,
  "border-style": "dashed",
};

type Props = {
  cases: SlotFillingCase[];
  slots: number;
  caseLabel: (count: number, score: number) => string;
  levelLabel: (level: number) => string;
  lastNote: string;
  minNote: string;
  minDetail: (weak: SlotFillingCase) => string;
};

export default function SlotFilling(props: Props) {
  const ramp = createMemo(() => props.cases.slice(0, props.slots));
  const weak = createMemo(() => props.cases[props.slots]);

  return (
    <>
      <div class="methodology-page__slots">
        <For each={ramp()}>
          {(slotCase, columnIndex) => (
            <div class="methodology-page__slot-case">
              <span class="methodology-page__slot-title">
                {props.caseLabel(
                  slotCase.results.length,
                  slotCase.results[0] ?? 0,
                )}
              </span>
              <div class="methodology-page__slot-boxes">
                <For each={slotCase.slots}>
                  {(slot, slotIndex) => (
                    <span
                      class="methodology-page__slot"
                      style={
                        slotIndex() >= slotCase.results.length
                          ? FILLER_SLOT
                          : REAL_SLOT
                      }
                    >
                      {slot}
                    </span>
                  )}
                </For>
              </div>
              <span class="methodology-page__slot-formula">
                {`(${slotCase.slots.join(" + ")}) / ${props.slots}`}
              </span>
              <span class="methodology-page__slot-level">
                {props.levelLabel(slotCase.level)}
              </span>
              <Show when={columnIndex() === ramp().length - 1}>
                <span class="methodology-page__slot-note">
                  {props.lastNote}
                </span>
              </Show>
            </div>
          )}
        </For>
      </div>
      <p class="methodology-page__slot-min">
        {props.minNote}
        <Show when={weak()}>
          {(weakCase) => <span>{props.minDetail(weakCase())}</span>}
        </Show>
      </p>
    </>
  );
}
