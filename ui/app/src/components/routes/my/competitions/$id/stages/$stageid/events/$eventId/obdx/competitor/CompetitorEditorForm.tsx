import AtomButton, { BUTTON_TYPES } from "library/src/components/atoms/button/AtomButton";
import AtomCheckbox from "library/src/components/atoms/checkbox/AtomCheckbox";
import { AtomCombobox, type AtomComboboxOption } from "library/src/components/atoms/combobox/AtomCombobox";
import AtomNumberInput from "library/src/components/atoms/number-input/AtomNumberInput";
import type { AtomSelectOption } from "library/src/components/atoms/select/AtomSelect.types";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import { Show } from "solid-js";
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
  dogOptions: AtomSelectOption[];
  dogsById: Map<string, Dog>;
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

  const dogOptions = (): AtomComboboxOption[] =>
    props.dogOptions.map((option) => ({
      disabled: option.disabled,
      label: option.label,
      preLabel: option.preLabel,
      value: option.value,
    }));

  const handleDogChange = (option: AtomComboboxOption | null) => {
    const dog = option ? props.dogsById.get(option.value) : undefined;

    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            dogId: option?.value ?? "",
            name: dog?.name ?? "",
            breed: dog?.breed ?? "",
            identity: dog?.identity ?? "",
            country: dog?.country ?? "",
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

  const selectedDog = (dogId: string) => props.dogsById.get(dogId);

  return (
    <Show when={props.competitorDialogDraft}>
      {(draft) => (
        <div class="competitor-editor-form">
          <AtomCombobox
            label={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.DOG")}
            onChange={handleDogChange}
            options={dogOptions()}
            placeholder={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.SELECT_DOG")}
            value={
              dogOptions().find((option) => option.value === draft().dogId) ??
              null
            }
          >
            <Show when={dogOptions().length === 0}>
              <AtomButton type={BUTTON_TYPES.GHOST} onClick={handleGoToDogs}>
                {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.CREATE_DOG")}
              </AtomButton>
            </Show>
          </AtomCombobox>

          <div class="competitor-editor-form__info">
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.COUNTRY")}
              <CountryFlag country={selectedDog(draft().dogId)?.country} />
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.SEX")}
              <SexIcon sex={selectedDog(draft().dogId)?.sex} />
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.CHIP")}
              <span class="text-label-sm">
                {selectedDog(draft().dogId)?.id ?? draft().dogId}
              </span>
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.IDENTITY")}
              <span class="text-label-sm">
                {selectedDog(draft().dogId)?.identity ?? draft().identity}
              </span>
            </span>
            <span class="text-caption-md">
              {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.BREED")}
              <span>{selectedDog(draft().dogId)?.breed ?? draft().breed}</span>
            </span>
            <div class="competitor-editor-form__info--handler">
              <span class="text-caption-md">
                {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.HANDLER")}
                <span class="text-label-sm">
                  {selectedDog(draft().dogId)?.handler ?? draft().handler}
                </span>
              </span>
              <span class="text-caption-md">
                {i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.TEAM")}
                <span class="text-label-sm">
                  ({selectedDog(draft().dogId)?.team ?? draft().team})
                </span>
              </span>
            </div>
          </div>
          <AtomNumberInput
            label={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.ORDER")}
            value={draft().position}
            onBlur={props.onCommitCompetitor}
            onChange={setOrder}
            minValue={minOrder}
            maxValue={maxOrder}
          />
          <Show when={selectedDog(draft().dogId)?.sex !== "MALE"}>
            <AtomCheckbox
              label={i18n.t("MY.COMPETITIONS.COMPETITOR_EDITOR.BIH")}
              checked={draft().bih}
              setChecked={setBih}
            />
          </Show>
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
