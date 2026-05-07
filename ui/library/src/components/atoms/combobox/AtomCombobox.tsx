import {Combobox} from "@kobalte/core/combobox";
import {createVirtualizer} from "@tanstack/solid-virtual";
import {createMemo, createSignal, For, type JSX, type ParentProps,} from "solid-js";
import "./styles.css";

export type AtomComboboxOption = {
  label: string;
  value: string;
  disabled?: boolean;
  preLabel?: JSX.Element;
};

export type AtomComboboxProps = ParentProps<{
  options: AtomComboboxOption[];
  value?: AtomComboboxOption | null;
  defaultValue?: AtomComboboxOption;
  onChange?: (value: AtomComboboxOption | null) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  disabled?: boolean;
  validationState?: "valid" | "invalid";
}>;

const ITEM_HEIGHT = 36;
const OVERSCAN = 5;

export function AtomCombobox(props: AtomComboboxProps) {
  let listboxRef: HTMLUListElement | undefined;
  const [inputValue, setInputValue] = createSignal("");

  const visibleOptions = createMemo(() => {
    const query = inputValue().trim().toLocaleLowerCase();
    if (!query) return props.options;

    return props.options.filter((option) =>
      option.label.toLocaleLowerCase().includes(query),
    );
  });

  const virtualizer = createVirtualizer({
    count: visibleOptions().length,
    getScrollElement: () => listboxRef,
    getItemKey: (index) => String(visibleOptions()[index]?.value ?? index),
    estimateSize: () => ITEM_HEIGHT,
    initialRect: { width: 0, height: ITEM_HEIGHT * 6 },
    overscan: OVERSCAN,
  });

  const virtualRows = () => {
    return visibleOptions().map((option, index) => ({
      key: String(option.value ?? index),
      index,
      start: index * ITEM_HEIGHT,
      size: ITEM_HEIGHT,
    }));
  };

  return (
    <Combobox
      class="atom-combobox"
      defaultValue={props.defaultValue}
      aria-label={props.label ?? "--Combobox"}
      disabled={props.disabled}
      allowsEmptyCollection
      triggerMode="focus"
      validationState={props.validationState}
      options={visibleOptions()}
      optionDisabled="disabled"
      optionLabel="label"
      optionTextValue="label"
      optionValue="value"
      value={props.value}
      onChange={props.onChange}
      onInputChange={setInputValue}
      placeholder={props.placeholder}
      virtualized
    >
      {props.label ? (
        <Combobox.Label class="atom-combobox__label">
          {props.label}
        </Combobox.Label>
      ) : null}
      <Combobox.Control class="atom-combobox__control">
        <Combobox.Input
          class="atom-combobox__input"
          placeholder={props.placeholder}
        />
        <Combobox.Trigger>
          <Combobox.Icon class="atom-combobox__icon">^</Combobox.Icon>
        </Combobox.Trigger>
      </Combobox.Control>
      {props.description ? (
        <Combobox.Description class="atom-combobox__description">
          {props.description}
        </Combobox.Description>
      ) : null}
      {props.errorMessage ? (
        <Combobox.ErrorMessage class="atom-combobox__error-message">
          {props.errorMessage}
        </Combobox.ErrorMessage>
      ) : null}
      {props.children}
      <Combobox.Portal>
        <Combobox.Content class="atom-combobox__content">
          <Combobox.Listbox
            ref={listboxRef}
            class="atom-combobox__listbox"
            style={{
              height: `${visibleOptions().length * ITEM_HEIGHT + 8}px`,
              "overflow-y": "auto",
            }}
            scrollToItem={(key) => {
              virtualizer.scrollToIndex(
                visibleOptions().findIndex((option) => option.value === key),
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
                <For each={virtualRows()}>
                  {(virtualRow) => {
                    const item = items().getItem(String(virtualRow.key));
                    if (!item) return null;

                    return (
                      <Combobox.Item
                        item={item}
                        class="atom-combobox__item"
                        style={{
                          position: "absolute",
                          top: "0",
                          left: "0",
                          right: "0",
                          height: `${virtualRow.size}px`,
                          transform: `translateY(${virtualRow.start}px)`,
                        }}
                      >
                        <div class="atom-combobox__item-option">
                          {item.rawValue.preLabel}
                          <Combobox.ItemLabel class="atom-combobox__item-label">
                            {item.rawValue.label}
                          </Combobox.ItemLabel>
                        </div>
                        <Combobox.ItemIndicator class="atom-combobox__item-indicator">
                          x
                        </Combobox.ItemIndicator>
                      </Combobox.Item>
                    );
                  }}
                </For>
              </div>
            )}
          </Combobox.Listbox>
        </Combobox.Content>
      </Combobox.Portal>
    </Combobox>
  );
}
