import {Combobox} from "@kobalte/core/combobox";
import {createVirtualizer} from "@tanstack/solid-virtual";
import {createMemo, createSignal, For, type JSX, type ParentProps,} from "solid-js";
import "./styles.css";

export type AtomComboboxOption = {
  label: string;
  value: string;
  disabled?: boolean;
  preLabel?: JSX.Element;
  caption?: JSX.Element;
  searchText?: string;
};

type AtomComboboxBaseProps = {
  options: AtomComboboxOption[];
  placeholder?: string;
  label?: string;
  description?: string;
  errorMessage?: string;
  disabled?: boolean;
  validationState?: "valid" | "invalid";
};

type AtomComboboxSingleProps = AtomComboboxBaseProps & {
  multiple?: false;
  value?: AtomComboboxOption | null;
  defaultValue?: AtomComboboxOption;
  onChange?: (value: AtomComboboxOption | null) => void;
};

type AtomComboboxMultipleProps = AtomComboboxBaseProps & {
  multiple: true;
  value?: AtomComboboxOption[];
  defaultValue?: AtomComboboxOption[];
  onChange?: (value: AtomComboboxOption[]) => void;
};

export type AtomComboboxProps = ParentProps<
  AtomComboboxSingleProps | AtomComboboxMultipleProps
>;

const ITEM_HEIGHT = 36;
const ITEM_HEIGHT_WITH_CAPTION = 48;
const OVERSCAN = 5;

export function AtomCombobox(props: AtomComboboxProps) {
  let listboxRef: HTMLUListElement | null = null;
  const [inputValue, setInputValue] = createSignal("");

  const visibleOptions = createMemo(() => {
    const query = inputValue().trim().toLocaleLowerCase();
    if (!query) return props.options;

    return props.options.filter((option) =>
      (option.searchText ?? option.label)
        .toLocaleLowerCase()
        .includes(query),
    );
  });

  const virtualizer = createVirtualizer({
    get count() {
      return visibleOptions().length;
    },
    getScrollElement: () => listboxRef,
    getItemKey: (index) => String(visibleOptions()[index]?.value ?? index),
    estimateSize: (index) =>
      visibleOptions()[index]?.caption ? ITEM_HEIGHT_WITH_CAPTION : ITEM_HEIGHT,
    initialRect: { width: 0, height: ITEM_HEIGHT * 6 },
    overscan: OVERSCAN,
  });

  const virtualRows = () => {
    void visibleOptions();
    return virtualizer.getVirtualItems().map((row) => ({
      key: String(row.key),
      index: row.index,
      start: row.start,
      size: row.size,
    }));
  };

  return (
    <Combobox<AtomComboboxOption>
      class="atom-combobox"
      multiple={props.multiple as true}
      defaultValue={props.defaultValue as AtomComboboxOption[]}
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
      value={props.value as AtomComboboxOption[]}
      onChange={props.onChange as (value: AtomComboboxOption[]) => void}
      onInputChange={setInputValue}
      placeholder={props.placeholder}
      virtualized
    >
      {props.label ? (
        <Combobox.Label class="atom-combobox__label">
          {props.label}
        </Combobox.Label>
      ) : null}
      <Combobox.Control<AtomComboboxOption> class="atom-combobox__control">
        {(state) => (
          <>
            {props.multiple && state.selectedOptions().length ? (
              <div class="atom-combobox__tags">
                <For each={state.selectedOptions()}>
                  {(option) => (
                    <span class="atom-combobox__tag">
                      {option.label}
                      <button
                        type="button"
                        class="atom-combobox__tag-remove"
                        aria-label={`Remove ${option.label}`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => state.remove(option)}
                      >
                        x
                      </button>
                    </span>
                  )}
                </For>
              </div>
            ) : null}
            <Combobox.Input
              class="atom-combobox__input"
              placeholder={props.placeholder}
            />
            <Combobox.Trigger>
              <Combobox.Icon class="atom-combobox__icon">^</Combobox.Icon>
            </Combobox.Trigger>
          </>
        )}
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
                          <div class="atom-combobox__item-text">
                            <Combobox.ItemLabel class="atom-combobox__item-label">
                              {item.rawValue.label}
                            </Combobox.ItemLabel>
                            {item.rawValue.caption ? (
                              <span class="atom-combobox__item-caption">
                                {item.rawValue.caption}
                              </span>
                            ) : null}
                          </div>
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
