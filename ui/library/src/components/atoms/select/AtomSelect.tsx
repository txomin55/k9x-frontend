import * as Select from "@kobalte/core/select";
import { createVirtualizer } from "@tanstack/solid-virtual";
import type { AtomSelectOption, AtomSelectProps } from "@lib/components/atoms/select/AtomSelect.types";
import "./styles.css";
import { For, Show } from "solid-js";

const ITEM_HEIGHT = 44;
const OVERSCAN = 5;

export default function AtomSelect(props: AtomSelectProps) {
  let listboxRef: HTMLUListElement | null = null;

  const virtualizer = createVirtualizer({
    get count() {
      return props.options.length;
    },
    getScrollElement: () => listboxRef,
    getItemKey: (index) => String(props.options[index]?.value ?? index),
    estimateSize: () => ITEM_HEIGHT,
    initialRect: { width: 0, height: ITEM_HEIGHT * 6 },
    overscan: OVERSCAN,
  });

  const getVirtualRows = () => {
    return props.options.map((_, index) => ({
      key: String(props.options[index]?.value ?? index),
      index,
      start: index * ITEM_HEIGHT,
      size: ITEM_HEIGHT,
    }));
  };

  const getItemPreLabel = (idx: number) => props.options[idx]?.preLabel;

  return (
    <Select.Root<AtomSelectOption>
      class="atom-select"
      defaultValue={props.defaultValue}
      disabled={props.disabled}
      gutter={8}
      onChange={props.onChange}
      onOpenChange={props.onOpenChange}
      open={props.open}
      optionDisabled="disabled"
      optionTextValue="label"
      optionValue="value"
      options={props.options}
      placeholder={props.placeholder ?? "--Select an option"}
      required={props.required}
      sameWidth
      validationState={props.validationState}
      value={props.value}
      virtualized
    >
      <Select.HiddenSelect />
      {props.label ? (
        <Select.Label class="atom-select__label">{props.label}</Select.Label>
      ) : null}
      <Select.Trigger class="atom-select__trigger">
        <Select.Value<AtomSelectOption> class="atom-select__value">
          {(state) => state.selectedOption()?.label}
        </Select.Value>
        <Select.Icon class="atom-select__icon">▾</Select.Icon>
      </Select.Trigger>
      {props.description ? (
        <Select.Description class="atom-select__description">
          {props.description}
        </Select.Description>
      ) : null}
      {props.errorMessage ? (
        <Select.ErrorMessage class="atom-select__error-message">
          {props.errorMessage}
        </Select.ErrorMessage>
      ) : null}
      <Select.Portal>
        <Select.Content class="atom-select__content">
          <Select.Listbox
            ref={listboxRef}
            class="atom-select__listbox"
            style={{
              height: `${Math.min(virtualizer.getTotalSize() + 8, 256)}px`,
              "overflow-y": "auto",
            }}
            scrollToItem={(key) => {
              virtualizer.scrollToIndex(
                props.options.findIndex((option) => option.value === key),
              );
            }}
          >
            {(items) => (
              <div
                style={{
                  height: `${virtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                <For each={getVirtualRows()}>
                  {(virtualRow) => {
                    const item = items().getItem(String(virtualRow.key));
                    if (!item) return null;

                    return (
                      <Select.Item
                        aria-label={item.rawValue.label}
                        class="atom-select__item"
                        item={item}
                        style={{
                          position: "absolute",
                          top: "0",
                          left: "0",
                          right: "0",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div class="atom-select__item-option">
                          <Show when={getItemPreLabel(item.index)}>
                            {getItemPreLabel(item.index)}
                          </Show>
                          <Select.ItemLabel class="atom-select__item-label">
                            {item.rawValue.label}
                          </Select.ItemLabel>
                        </div>

                        <Select.ItemIndicator class="atom-select__item-indicator">
                          ✓
                        </Select.ItemIndicator>
                      </Select.Item>
                    );
                  }}
                </For>
              </div>
            )}
          </Select.Listbox>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
