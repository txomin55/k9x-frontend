import AtomButton, {
  BUTTON_TYPES,
} from "library/src/components/atoms/button/AtomButton";
import AtomCheckbox from "library/src/components/atoms/checkbox/AtomCheckbox";
import AtomInput from "library/src/components/atoms/input/AtomInput";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "library/src/components/atoms/combobox/AtomCombobox";
import AtomNumberInput from "library/src/components/atoms/number-input/AtomNumberInput";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import { createMemo, createSignal, Show } from "solid-js";
import { EventCompetitorDetail } from "@/services/secured/event-crud/eventCrud.types";
import { useNavigate } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import SexIcon from "@/components/common/sex-icon/SexIcon";

type OrderBounds = {
  minValue: number;
  maxValue: number;
};

type CompetitorDialogContentProps = {
  competitorDialogDraft: EventCompetitorDetail | null;
  onCloseCompetitorEditor: () => void;
  onCommitCompetitor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: EventCompetitorDetail | null,
    ) => EventCompetitorDetail | null,
  ) => void;
  onCreateCompetitor: () => void;
  orderBounds: OrderBounds;
  dogOptions: AtomComboboxOption[];
  dogsById: Map<string, Dog>;
  /**
   * Text typed in the dog box: past a few characters the options are searched for on the server, by
   * dog name or by identification.
   */
  onDogSearchChange: (value: string) => void;
  onLoadMoreDogs: () => void;
  dogsHaveMore: boolean;
  dogsAreLoadingMore: boolean;
  displaySave?: boolean;
};

export default function CompetitorEditorForm(
  props: CompetitorDialogContentProps,
) {
  const navigate = useNavigate();
  const i18n = useI18n();
  const minOrder = Math.max(props.orderBounds.minValue, 1);
  const maxOrder = Math.max(minOrder, props.orderBounds.maxValue);

  const setOrder = (value: string) => {
    const parsedOrder = Number(value);
    const normalizedOrder = Number.isFinite(parsedOrder)
      ? Math.min(Math.max(parsedOrder, minOrder), maxOrder)
      : minOrder;

    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            position: normalizedOrder,
          }
        : current,
    );
  };
  const setCompetitorNumber = (value: string) => {
    const parsedNumber = Number(value);
    const normalizedNumber = Number.isFinite(parsedNumber)
      ? Math.max(parsedNumber, 0)
      : 0;

    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            competitorNumber: normalizedNumber,
          }
        : current,
    );
  };
  const setBih = (value: boolean) => {
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            bih: value,
          }
        : current,
    );

    props.onCommitCompetitor();
  };
  const setPrimer = (value: string) => {
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            primer: value,
          }
        : current,
    );
  };
  const setReserve = (value: boolean) => {
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            reserve: value,
          }
        : current,
    );

    props.onCommitCompetitor();
  };

  const handleDogChange = (option: AtomComboboxOption | null) => {
    const dog = option ? props.dogsById.get(option.value) : undefined;

    setPickedDogOption(option);

    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            dogIdentification: option?.value ?? "",
            name: dog?.name ?? "",
            breed: dog?.breed.name ?? "",
            origin: dog?.origin ?? "",
            country: dog?.country.id ?? "",
            team: dog?.team ?? "",
          }
        : current,
    );

    props.onCommitCompetitor();
  };

  const handleGoToDogs = () =>
    navigate({
      to: "/my/dogs",
    });

  const selectedDog = (dogIdentification: string) =>
    props.dogsById.get(dogIdentification);

  // The option as it was picked, kept as it was: it is what the box shows while a new search empties
  // the list around it, and rebuilding it from a list that no longer holds the dog changes its label.
  const [pickedDogOption, setPickedDogOption] =
    createSignal<AtomComboboxOption | null>(null);

  /**
   * The picked dog stays picked even when the listed options no longer hold it: a search narrows the
   * list down to what the server matched, and a selection dropped by that would put the box back to
   * empty — which reads as the dog having been un-picked.
   *
   * The same option object is kept while it says the same thing: the options are rebuilt on every
   * search, and handing the box a new object for the same dog makes it write the label back over
   * whatever is being typed.
   */
  const selectedDogOption = createMemo<AtomComboboxOption | null>((previous) => {
    const dogIdentification = props.competitorDialogDraft?.dogIdentification;
    if (!dogIdentification) return null;

    const picked = pickedDogOption();
    if (picked?.value === dogIdentification) return picked;

    const dog = selectedDog(dogIdentification);
    const listed = props.dogOptions.find(
      (option) => option.value === dogIdentification,
    );
    const option = listed ?? {
      label: dog?.handler
        ? `${dog.name} (${dog.handler})`
        : (dog?.name ?? dogIdentification),
      value: dogIdentification,
      caption: dogIdentification,
    };

    return previous?.value === option.value && previous.label === option.label
      ? previous
      : option;
  }, null);

  return (
    <Show when={props.competitorDialogDraft}>
      {(draft) => (
        <div class="competitor-editor-form">
          <AtomCombobox
            label={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.DOG")}
            onChange={handleDogChange}
            onInputChange={props.onDogSearchChange}
            onLoadMore={props.onLoadMoreDogs}
            hasMore={props.dogsHaveMore}
            isLoadingMore={props.dogsAreLoadingMore}
            options={props.dogOptions}
            placeholder={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.SELECT_DOG")}
            value={selectedDogOption()}
          >
            <Show when={props.dogOptions.length === 0}>
              <AtomButton type={BUTTON_TYPES.GHOST} onClick={handleGoToDogs}>
                {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.CREATE_DOG")}
              </AtomButton>
            </Show>
          </AtomCombobox>

          <div class="competitor-editor-form__info">
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.COUNTRY")}
              <Show when={selectedDog(draft().dogIdentification)}>
                {(selected) => (
                  <CountryFlag
                    country={selected().country.id ?? draft().country}
                  />
                )}
              </Show>
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.SEX")}
              <Show when={selectedDog(draft().dogIdentification)}>
                {(selected) => <SexIcon sex={selected().sex} />}
              </Show>
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.IDENTIFICATION")}
              <Show when={selectedDog(draft().dogIdentification)}>
                {(selected) => (
                  <span class="text-label-sm">
                    {selected().identification ?? draft().dogIdentification}
                  </span>
                )}
              </Show>
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.ORIGIN")}
              <Show when={selectedDog(draft().dogIdentification)}>
                {(selected) => (
                  <span class="text-label-sm">
                    {selected().origin ?? draft().origin}
                  </span>
                )}
              </Show>
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.LICENSE")}
              <Show when={selectedDog(draft().dogIdentification)}>
                {(selected) => (
                  <span class="text-label-sm">{selected().license}</span>
                )}
              </Show>
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.BREED")}
              <Show when={selectedDog(draft().dogIdentification)}>
                {(selected) => (
                  <span class="text-label-sm">
                    {selected().breed.name ?? draft().breed}
                  </span>
                )}
              </Show>
            </span>
            <div class="competitor-editor-form__info--handler">
              <span class="text-caption-md">
                {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.HANDLER")}
                <Show when={selectedDog(draft().dogIdentification)}>
                  {(selected) => (
                    <span class="text-label-sm">
                      {selected().handler ?? draft().handler}
                    </span>
                  )}
                </Show>
              </span>
              <span class="text-caption-md">
                {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.TEAM")}
                <Show when={selectedDog(draft().dogIdentification)}>
                  {(selected) => (
                    <span class="text-label-sm">
                      ({selected().team ?? draft().team})
                    </span>
                  )}
                </Show>
              </span>
            </div>
          </div>
          <div class="form-grid form-grid--2col">
            <AtomNumberInput
              label={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.ORDER")}
              value={draft().position}
              onBlur={props.onCommitCompetitor}
              onChange={setOrder}
              minValue={minOrder}
              maxValue={maxOrder}
            />
            <AtomNumberInput
              label={i18n.t(
                "MY.COMPETITIONS.COMPETITOR_EDITOR.COMPETITOR_NUMBER",
              )}
              value={draft().competitorNumber}
              onBlur={props.onCommitCompetitor}
              onChange={setCompetitorNumber}
              minValue={0}
            />
          </div>
          <Show when={selectedDog(draft().dogIdentification)?.sex !== "MALE"}>
            <AtomCheckbox
              label={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.BIH")}
              checked={draft().bih}
              setChecked={setBih}
            />
          </Show>
          <AtomInput
            label={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.PRIMER")}
            value={draft().primer}
            onChange={setPrimer}
            onBlur={props.onCommitCompetitor}
          />
          <AtomCheckbox
            label={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.RESERVE")}
            checked={draft().reserve}
            setChecked={setReserve}
          />
          <div class="competitor-editor-form__actions">
            <AtomButton
              type={BUTTON_TYPES.ACCENT}
              onClick={props.onCloseCompetitorEditor}
            >
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.CLOSE")}
            </AtomButton>
            <Show when={props.displaySave}>
              <AtomButton onClick={props.onCreateCompetitor}>
                {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.CREATE")}
              </AtomButton>
            </Show>
          </div>
        </div>
      )}
    </Show>
  );
}
