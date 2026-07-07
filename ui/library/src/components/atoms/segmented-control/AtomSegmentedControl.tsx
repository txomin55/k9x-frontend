import { SegmentedControl } from "@kobalte/core/segmented-control";
import { createEffect, createSignal, For, JSX, Match, Switch } from "solid-js";
import "./styles.css";

interface AtomSegmentedControlPropsControl {
  value: string;
  text: string;
  // Pass a thunk instead of JSX when the content owns refs/effects that
  // must observe a real, connected element (e.g. a virtualized list) —
  // Solid treats a function child as a reactive getter, so it's only
  // invoked (and its DOM created) once this tab is actually selected.
  content: JSX.Element | (() => JSX.Element);
  disabled?: boolean;
}

interface AtomSegmentedControlProps {
  title: string;
  control?: string;
  onControlChange?: (value: string) => void;
  controls: AtomSegmentedControlPropsControl[];
}

export function AtomSegmentedControl(props: AtomSegmentedControlProps) {
  const [selectedValue, setSelectedValue] = createSignal(props.control);

  const updateSelectedValue = (value: string) => {
    setSelectedValue(value);
    if (props.onControlChange) {
      props.onControlChange(value);
    }
  };

  createEffect(() => {
    setSelectedValue(props.control);
  });
  return (
    <div class="atom-segmented-control">
      <SegmentedControl
        class="atom-segmented-control__controls"
        value={selectedValue()}
        onChange={updateSelectedValue}
        defaultValue={props.control}
      >
        <SegmentedControl.Label class="atom-segmented-control__label">
          {props.title}
        </SegmentedControl.Label>
        <div class="atom-segmented-control__wrapper" role="presentation">
          <SegmentedControl.Indicator class="atom-segmented-control__indicator" />
          <div class="atom-segmented-control__items" role="presentation">
            <For each={props.controls}>
              {(item) => (
                <SegmentedControl.Item
                  value={item.value}
                  class="atom-segmented-control__item"
                  disabled={item.disabled}
                >
                  <SegmentedControl.ItemInput class="atom-segmented-control__item-input" />
                  <SegmentedControl.ItemLabel class="atom-segmented-control__item-label">
                    {item.text}
                  </SegmentedControl.ItemLabel>
                </SegmentedControl.Item>
              )}
            </For>
          </div>
        </div>
      </SegmentedControl>

      <Switch>
        <For each={props.controls}>
          {(control) => (
            // Solid renders a function child as a reactive getter at
            // runtime, invoking it lazily — Match's types just don't
            // model a zero-arg thunk, hence the cast.
            <Match when={selectedValue() === control.value}>
              {control.content as JSX.Element}
            </Match>
          )}
        </For>
      </Switch>
    </div>
  );
}
