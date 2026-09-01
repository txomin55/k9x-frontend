import {Combobox} from "@kobalte/core/combobox";
import { useRowWindow } from "../../../utils/virtual/useRowWindow";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  type JSX,
  type ParentProps,
} from "solid-js";
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
  /** Text typed in the box, for callers that go and fetch the options themselves. */
  onInputChange?: (value: string) => void;
  /** Called as the list is scrolled near its end, for options that arrive a page at a time. */
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
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

// The next page is asked for a screenful before the end, so it is there by the time the scroll is.
const LOAD_MORE_MIN_LEAD_PX = 160;

const ITEM_HEIGHT = 36;
const ITEM_HEIGHT_WITH_CAPTION = 48;
const OVERSCAN = 5;

export function AtomCombobox(props: AtomComboboxProps) {
  let listboxRef: HTMLUListElement | null = null;
  // A tap focuses the box and then puts the caret where it landed, so the text is taken whole on the
  // release as well: what was picked before is replaced by what is typed next, not typed into.
  let selectOnRelease = false;
  const [listbox, setListbox] = createSignal<HTMLUListElement>();
  const [inputValue, setInputValue] = createSignal("");

  const selectedOptions = (): AtomComboboxOption[] => {
    const value = props.value;
    if (!value) return [];

    return Array.isArray(value) ? value : [value];
  };

  // Picking an option makes the box write that option's own label into the input. Nobody typed it, so
  // it is not a query: taken as one it would search for the label and hide the very option just picked.
  const isSelectionEcho = (value: string) =>
    selectedOptions().some((option) => option.label === value);

  const handleInputChange = (value: string) => {
    if (isSelectionEcho(value)) {
      setInputValue("");
      return;
    }

    setInputValue(value);
    props.onInputChange?.(value);
  };

  // The list is only in the document while it is open, so the listener follows the element itself.
  createEffect(() => {
    const element = listbox();
    if (!element || !props.onLoadMore) return;

    const askForMoreAtTheEnd = () => {
      if (props.hasMore === false || props.isLoadingMore) return;
      // A list with nothing in it is not short of pages: either the text in the box is hiding what is
      // loaded, or the search behind it came back empty. Walking the rest of the collection a page at
      // a time answers neither, and there is no scroll to reach the end of.
      if (!visibleOptions().length) return;
      // Nor is a list of no height: the popup is closed, or has not been laid out yet, and the element
      // left behind reads as scrolled to its end when nothing of it is on the screen.
      if (!element.clientHeight) return;

      const remaining =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      const lead = Math.max(LOAD_MORE_MIN_LEAD_PX, element.clientHeight);

      if (remaining <= lead) props.onLoadMore?.();
    };

    // A first page shorter than the list itself leaves nothing to scroll, so it is asked for up front
    // — but not while the box holds text: what that narrows the list down to is for whoever fetches
    // the options to answer, and paging the whole collection in behind it answers nothing.
    if (!inputValue().trim()) askForMoreAtTheEnd();
    element.addEventListener("scroll", askForMoreAtTheEnd, { passive: true });

    onCleanup(() =>
      element.removeEventListener("scroll", askForMoreAtTheEnd),
    );
  });

  const visibleOptions = createMemo(() => {
    const query = inputValue().trim().toLocaleLowerCase();
    if (!query) return props.options;

    return props.options.filter((option) =>
      (option.searchText ?? option.label)
        .toLocaleLowerCase()
        .includes(query),
    );
  });

  // Options are laid out at one height each, so the rows worth rendering are a division of the scroll
  // position — and they follow it, which is what keeps the list from going blank past the first screen.
  const optionHeight = () =>
    visibleOptions().some((option) => option.caption)
      ? ITEM_HEIGHT_WITH_CAPTION
      : ITEM_HEIGHT;

  const rowWindow = useRowWindow({
    scrollElement: listbox,
    rowCount: () => visibleOptions().length,
    rowHeight: optionHeight,
    overscan: OVERSCAN,
  });

  const visibleRows = () =>
    rowWindow.rows().map((index) => ({
      key: String(visibleOptions()[index]?.value ?? index),
      index,
      start: index * optionHeight(),
      size: optionHeight(),
    }));

  return (
    <Combobox<AtomComboboxOption>
      class="atom-combobox"
      multiple={props.multiple as true}
      defaultValue={props.defaultValue as AtomComboboxOption[]}
      aria-label={props.label ?? "--Combobox"}
      disabled={props.disabled}
      allowsEmptyCollection
      sameWidth
      triggerMode="focus"
      validationState={props.validationState}
      defaultFilter={(option, query) =>
        (option.searchText ?? option.label)
          .toLocaleLowerCase()
          .includes(query.trim().toLocaleLowerCase())
      }
      options={visibleOptions()}
      optionDisabled="disabled"
      optionLabel="label"
      optionTextValue="label"
      optionValue="value"
      value={props.value as AtomComboboxOption[]}
      onChange={props.onChange as (value: AtomComboboxOption[]) => void}
      onInputChange={handleInputChange}
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
                      <span class="atom-combobox__tag-label">
                        {option.label}
                      </span>
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
              onFocus={(
                event: FocusEvent & { currentTarget: HTMLInputElement },
              ) => {
                // The box shows the label of whatever is already picked. Taking that text whole means
                // the next thing typed searches for itself, rather than being appended to the pick.
                selectOnRelease = true;
                event.currentTarget.select();
              }}
              onPointerUp={(
                event: PointerEvent & { currentTarget: HTMLInputElement },
              ) => {
                // The box keeps the focus after a pick, so a tap on it brings no focus event: what
                // says the text is there to be replaced is the text itself, still the picked label.
                if (
                  !selectOnRelease &&
                  !isSelectionEcho(event.currentTarget.value)
                ) {
                  return;
                }

                selectOnRelease = false;
                event.preventDefault();
                event.currentTarget.select();
              }}
              onBlur={() => {
                selectOnRelease = false;
              }}
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
            ref={(element: HTMLUListElement) => {
              listboxRef = element;
              setListbox(element);
            }}
            class="atom-combobox__listbox"
            scrollToItem={(key) => {
              const index = visibleOptions().findIndex(
                (option) => option.value === key,
              );
              listbox()?.scrollTo({ top: Math.max(0, index) * optionHeight() });
            }}
          >
            {(items) => (
              <div
                style={{
                  height: `${rowWindow.totalHeight()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                <For each={visibleRows()}>
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
