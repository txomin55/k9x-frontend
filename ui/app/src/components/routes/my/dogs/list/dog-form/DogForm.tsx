import type { Dog, DogSex } from "@/services/secured/dog-crud/dogCrud.types";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import AtomSelect, { type AtomSelectOption } from "@lib/components/atoms/select/AtomSelect";
import { createSignal, Show } from "solid-js";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import CountryField from "@/components/common/country-field/CountryField";
import { useBreeds } from "@/services/secured/breed-crud/breedCrud";
import {
  MIN_TEXT_LENGTH,
  type TextFieldError,
  validateEmail,
  validateRequiredSelection,
  validateRequiredText,
} from "@/utils/validation/textField";

type DogFormProps = {
  draft: () => Dog;
  onDraftChange: (updater: (current: Dog) => Dog) => void;
  onCancel: () => void;
  onSave: () => void;
  isEditMode: boolean;
};

export default function DogForm(props: DogFormProps) {
  const i18n = useI18n();
  const breedsQuery = useBreeds({ refetchOnMount: false });
  const BREED_SELECT_OPTIONS = (): AtomSelectOption[] =>
    (breedsQuery.data ?? []).map(({ id, name }) => ({
      label: name,
      value: id,
    }));

  const SEX_SELECT_OPTIONS = (): AtomSelectOption[] => [
    { label: i18n.t("MY.DOGS.DOG_FORM.SEX_MALE"), value: "MALE" },
    { label: i18n.t("MY.DOGS.DOG_FORM.SEX_FEMALE"), value: "FEMALE" },
  ];

  const user = useAuthUser();

  const [touched, setTouched] = createSignal<Record<string, boolean>>({});
  const markTouched = (field: string) =>
    setTouched((current) => ({ ...current, [field]: true }));

  const errorMessage = (error: TextFieldError) => {
    if (error === "REQUIRED") return i18n.t("COMMON.VALIDATION.REQUIRED");
    if (error === "MIN_LENGTH")
      return i18n.t("COMMON.VALIDATION.MIN_LENGTH", { min: MIN_TEXT_LENGTH });
    if (error === "INVALID_EMAIL")
      return i18n.t("COMMON.VALIDATION.INVALID_EMAIL");
    return undefined;
  };

  const ownerFieldVisible = () => !!user()?.organizer && !props.draft().owned;

  const idError = () => validateRequiredText(props.draft().id);
  const nameError = () => validateRequiredText(props.draft().name);
  const countryError = () =>
    validateRequiredSelection(props.draft().country.id);
  const ownerError = () =>
    ownerFieldVisible() ? validateEmail(props.draft().owner) : null;

  const isValid = () =>
    !idError() && !nameError() && !countryError() && !ownerError();

  const fieldProps = (field: string, error: () => TextFieldError) => ({
    onBlur: () => markTouched(field),
    validationState: (touched()[field] && error()
      ? "invalid"
      : undefined) as "invalid" | undefined,
    errorMessage: touched()[field] ? errorMessage(error()) : undefined,
  });

  const selectedBreedOption = () =>
    BREED_SELECT_OPTIONS().find(
      (breedOption) => breedOption.value === props.draft().breed.id,
    ) ?? null;

  const selectedSexOption = () =>
    SEX_SELECT_OPTIONS().find(
      (sexOption) => sexOption.value === props.draft().sex,
    ) ?? null;

  const updateId = (id: string) =>
    props.onDraftChange((current) => ({
      ...current,
      id,
    }));

  const updateName = (name: string) =>
    props.onDraftChange((current) => ({
      ...current,
      name,
    }));

  const updateOwned = (owned: boolean) =>
    props.onDraftChange((current) => ({
      ...current,
      owned,
      owner: owned ? (user()?.email ?? "") : "",
    }));

  const updateBreed = (breed: IdNameDTO) =>
    props.onDraftChange((current) => ({
      ...current,
      breed,
    }));

  const updateIdentity = (identity: string) =>
    props.onDraftChange((current) => ({
      ...current,
      identity,
    }));

  const updateOwner = (owner: string) =>
    props.onDraftChange((current) => ({
      ...current,
      owner,
    }));

  const updateHandler = (handler: string) =>
    props.onDraftChange((current) => ({
      ...current,
      handler,
    }));

  const updateTeam = (team: string) =>
    props.onDraftChange((current) => ({
      ...current,
      team,
    }));

  const updateCountry = (country: IdNameDTO) =>
    props.onDraftChange((current) => ({
      ...current,
      country,
    }));

  const updateSex = (sex: DogSex) =>
    props.onDraftChange((current) => ({
      ...current,
      sex,
    }));

  const updateWithersCm = (withersCm: number) =>
    props.onDraftChange((current) => ({
      ...current,
      withersCm,
    }));

  const updateThreeFciGenerationsConfirmed = (
    threeFciGenerationsConfirmed: boolean,
  ) =>
    props.onDraftChange((current) => ({
      ...current,
      threeFciGenerationsConfirmed,
    }));
  return (
    <div class="form-grid form-grid--2col">
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.CHIP")}
        value={props.draft().id}
        onChange={updateId}
        disabled={props.isEditMode}
        {...fieldProps("id", idError)}
      />
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.NAME")}
        value={props.draft().name}
        onChange={updateName}
        {...fieldProps("name", nameError)}
      />
      <div class="form-grid__full">
        <AtomInput
          label={i18n.t("MY.DOGS.DOG_FORM.IMAGE")}
          value={props.draft().image}
          disabled
        />
      </div>
      <AtomSelect
        label={i18n.t("MY.DOGS.DOG_FORM.BREED")}
        placeholder={i18n.t("MY.DOGS.DOG_FORM.SELECT_BREED")}
        onChange={(option) =>
          updateBreed({ id: option?.value ?? "", name: option?.label ?? "" })
        }
        options={BREED_SELECT_OPTIONS()}
        value={selectedBreedOption()}
      />
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.IDENTIFIER")}
        value={props.draft().identity}
        onChange={updateIdentity}
        description={i18n.t("MY.DOGS.DOG_FORM.IDENTIFIER_HINT")}
      />
      <AtomSelect
        label={i18n.t("MY.DOGS.DOG_FORM.SEX")}
        placeholder={i18n.t("MY.DOGS.DOG_FORM.SELECT_SEX")}
        onChange={(option) => updateSex((option?.value as DogSex) ?? "MALE")}
        options={SEX_SELECT_OPTIONS()}
        value={selectedSexOption()}
      />
      <AtomNumberInput
        label={i18n.t("MY.DOGS.DOG_FORM.WITHERS_CM")}
        value={props.draft().withersCm}
        onRawValueChange={updateWithersCm}
        step={0.1}
        minValue={0}
      />
      <div class="form-grid__full">
        <AtomCheckbox
          label={i18n.t("MY.DOGS.DOG_FORM.THREE_FCI_GENERATIONS_CONFIRMED")}
          checked={props.draft().threeFciGenerationsConfirmed}
          setChecked={updateThreeFciGenerationsConfirmed}
        />
      </div>
      <Show when={!!user()?.organizer}>
        <div class="form-grid__full">
          <AtomCheckbox
            label={i18n.t("MY.DOGS.DOG_FORM.OWNED")}
            checked={props.draft().owned}
            setChecked={updateOwned}
          />
        </div>
      </Show>
      <Show when={ownerFieldVisible()}>
        <div class="form-grid__full">
          <AtomInput
            label={i18n.t("MY.DOGS.DOG_FORM.OWNER")}
            type="email"
            description={i18n.t("MY.DOGS.DOG_FORM.OWNER_HINT")}
            value={props.draft().owner}
            onChange={updateOwner}
            {...fieldProps("owner", ownerError)}
          />
        </div>
      </Show>
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.HANDLER")}
        value={props.draft().handler}
        onChange={updateHandler}
      />
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.TEAM")}
        value={props.draft().team}
        onChange={updateTeam}
      />
      <CountryField
        onChange={(value) => {
          markTouched("country");
          updateCountry({ id: value.value, name: value.label });
        }}
        value={props.draft().country.id}
        validationState={
          touched().country && countryError() ? "invalid" : undefined
        }
        errorMessage={
          touched().country ? errorMessage(countryError()) : undefined
        }
      />
      <div class="form-grid__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          {i18n.t("MY.DOGS.DOG_FORM.CANCEL")}
        </AtomButton>
        <AtomButton onClick={props.onSave} disabled={!isValid()}>
          {i18n.t("MY.DOGS.DOG_FORM.SAVE")}
        </AtomButton>
      </div>
    </div>
  );
}
