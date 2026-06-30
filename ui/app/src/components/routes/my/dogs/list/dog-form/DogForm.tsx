import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { createSignal, Show } from "solid-js";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import CountryField from "@/components/common/country-field/CountryField";
import {
  MIN_TEXT_LENGTH,
  type TextFieldError,
  validateEmail,
  validateRequiredSelection,
  validateRequiredText,
} from "@/utils/validation/textField";
import "./styles.css";

type DogFormProps = {
  draft: () => Dog;
  onDraftChange: (updater: (current: Dog) => Dog) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function DogForm(props: DogFormProps) {
  const i18n = useI18n();
  const BREED_SELECT_OPTIONS: AtomSelectOption[] = [
    { label: i18n.t("MY.DOGS.DOG_FORM.BORDER_COLLIE"), value: "border-collie" },
    { label: i18n.t("MY.DOGS.DOG_FORM.SPANISH_WATERDOG"), value: "swd" },
    {
      label: i18n.t("MY.DOGS.DOG_FORM.BELGIAN_SHEPHERD_MALINOIS"),
      value: "belgian-malinois",
    },
    {
      label: i18n.t("MY.DOGS.DOG_FORM.LABRADOR_RETRIEVER"),
      value: "labrador-retriever",
    },
    {
      label: i18n.t("MY.DOGS.DOG_FORM.GOLDEN_RETRIEVER"),
      value: "golden-retriever",
    },
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
  const countryError = () => validateRequiredSelection(props.draft().country);
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
    BREED_SELECT_OPTIONS.find(
      (breedOption) => breedOption.value === props.draft().breed,
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

  const updateBreed = (breed: string) =>
    props.onDraftChange((current) => ({
      ...current,
      breed,
    }));

  const updateIdentifier = (identifier: string) =>
    props.onDraftChange((current) => ({
      ...current,
      identifier,
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

  const updateCountry = (country: string) =>
    props.onDraftChange((current) => ({
      ...current,
      country,
    }));
  return (
    <div class="dog-form">
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.CHIP")}
        value={props.draft().id}
        onChange={updateId}
        {...fieldProps("id", idError)}
      />
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.NAME")}
        value={props.draft().name}
        onChange={updateName}
        {...fieldProps("name", nameError)}
      />
      <Show when={!!user()?.organizer}>
        <AtomCheckbox
          label={i18n.t("MY.DOGS.DOG_FORM.OWNED")}
          checked={props.draft().owned}
          setChecked={updateOwned}
        />
      </Show>
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.IMAGE")}
        value={props.draft().image}
        disabled
      />
      <AtomSelect
        label={i18n.t("MY.DOGS.DOG_FORM.BREED")}
        onChange={(option) => updateBreed(option.value)}
        options={BREED_SELECT_OPTIONS}
        value={selectedBreedOption()}
      />
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.IDENTIFIER")}
        value={props.draft().identifier}
        onChange={updateIdentifier}
      />
      <Show when={!!user()?.organizer}>
        <Show when={!props.draft().owned}>
          <AtomInput
            label={i18n.t("MY.DOGS.DOG_FORM.OWNER")}
            type="email"
            description={i18n.t("MY.DOGS.DOG_FORM.OWNER_HINT")}
            value={props.draft().owner}
            onChange={updateOwner}
            {...fieldProps("owner", ownerError)}
          />
        </Show>
        <AtomInput
          label={i18n.t("MY.DOGS.DOG_FORM.HANDLER")}
          value={props.draft().handler}
          onChange={updateHandler}
        />
      </Show>
      <AtomInput
        label={i18n.t("MY.DOGS.DOG_FORM.TEAM")}
        value={props.draft().team}
        onChange={updateTeam}
      />
      <CountryField
        onChange={(value) => {
          markTouched("country");
          updateCountry(value.value);
        }}
        value={props.draft().country}
        validationState={
          touched().country && countryError() ? "invalid" : undefined
        }
        errorMessage={
          touched().country ? errorMessage(countryError()) : undefined
        }
      />
      <div class="dog-form__actions">
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
