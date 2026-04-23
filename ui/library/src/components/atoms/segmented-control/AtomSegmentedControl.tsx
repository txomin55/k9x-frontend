import { SegmentedControl } from "@kobalte/core/segmented-control";
import { createSignal, For, JSX, Match, Switch } from "solid-js";
import "./styles.css";

interface AtomSegmentedControlPropsControl {
  value: string;
  text: string;
  content: JSX.Element;
}

interface AtomSegmentedControlProps {
  title: string;
  defaultValue: string;
  onControlChange?: (value: string) => void;
  controls: AtomSegmentedControlPropsControl[];
}

export function AtomSegmentedControl(props: AtomSegmentedControlProps) {
  const [selectedValue, setSelectedValue] = createSignal(props.defaultValue);

  return (
    <div class="atom-segmented-control__parent">
      <SegmentedControl
        class="atom-segmented-control"
        value={selectedValue()}
        onChange={setSelectedValue}
        defaultValue={props.defaultValue}
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
