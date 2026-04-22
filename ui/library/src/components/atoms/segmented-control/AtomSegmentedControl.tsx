import { SegmentedControl } from "@kobalte/core/segmented-control";
import { createSignal, For } from "solid-js";
import "./styles.css";

interface AtomSegmentedControlPropsControl {
  value: string;
  text: string;
}

interface AtomSegmentedControlProps {
  title: string;
  defaultValue: string;
  onControlChange?: (value: string) => void;
  controls: AtomSegmentedControlPropsControl[];
}

export function AtomSegmentedControl(props: AtomSegmentedControlProps) {
  const [selectedValue, setSelectedValue] = createSignal(props.defaultValue);

  const updateValue = (v: string) => {
    setSelectedValue(v);
    props.onControlChange?.(v);
  };

  return (
    <SegmentedControl
      class="segmented-control"
      value={selectedValue()}
      onChange={updateValue}
      defaultValue={props.defaultValue}
    >
      <SegmentedControl.Label class="segmented-control__label">
        {props.title}
      </SegmentedControl.Label>
      <div class="segmented-control__wrapper" role="presentation">
        <SegmentedControl.Indicator class="segmented-control__indicator" />
        <div class="segmented-control__items" role="presentation">
          <For each={props.controls}>
            {(item) => (
              <SegmentedControl.Item
                value={item.value}
                class="segmented-control__item"
              >
                <SegmentedControl.ItemInput class="segmented-control__item-input" />
                <SegmentedControl.ItemLabel class="segmented-control__item-label">
                  {item.text}
                </SegmentedControl.ItemLabel>
              </SegmentedControl.Item>
            )}
          </For>
        </div>
      </div>
    </SegmentedControl>
  );
}
