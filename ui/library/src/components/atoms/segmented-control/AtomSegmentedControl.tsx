import { SegmentedControl } from "@kobalte/core/segmented-control";
import { createEffect, createSignal, For, JSX, Match, Switch } from "solid-js";
import "./styles.css";

interface AtomSegmentedControlPropsControl {
  value: string;
  text: string;
  content: JSX.Element;
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
            <Match when={selectedValue() === control.value}>
              {control.content}
            </Match>
          )}
        </For>
      </Switch>
    </div>
  );
}
