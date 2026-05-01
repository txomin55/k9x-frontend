import type { CreateDogRequest } from "@/services/secured/dog-crud/dogCrud.types";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { Show } from "solid-js";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import { useAuthUser } from "@/stores/auth/auth";
import "./styles.css";

type DogFormProps = {
  draft: () => CreateDogRequest;
  onDraftChange: (
    updater: (current: CreateDogRequest) => CreateDogRequest,
  ) => void;
  onCancel: () => void;
  onSave: () => void;
};

export default function DogForm(props: DogFormProps) {
  const BREED_SELECT_OPTIONS: AtomSelectOption[] = [
    { label: "--Border Collie", value: "border-collie" },
    { label: "--Spanish Waterdog", value: "swd" },
    { label: "--Belgian Shepperd malinois", value: "belgian-malinois" },
    { label: "--Labrador retriever", value: "labrador-retriever" },
    { label: "--Golder retriever", value: "golden-retriever" },
  ];

  const user = useAuthUser();

  const selectedBreedOption = () =>
    BREED_SELECT_OPTIONS.find(
      (breedOption) => breedOption.value === props.draft().breed,
    ) ?? null;

  const updateName = (name: string) =>
    props.onDraftChange((current) => ({
      ...current,
      name,
    }));

  const updateOwned = (owned: boolean) =>
    props.onDraftChange((current) => ({
      ...current,
      owned,
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
        label="--Name"
        value={props.draft().name}
        onChange={updateName}
      />
      <Show when={!!user()?.organizer}>
        <AtomCheckbox
          label="--Owned"
          checked={props.draft().owned}
          setChecked={updateOwned}
        />
      </Show>
      <AtomInput label="--Image" value={props.draft().image} disabled />
      <AtomSelect
        label="--Breed"
        onChange={(option) => updateBreed(option.value)}
        options={BREED_SELECT_OPTIONS}
        value={selectedBreedOption()}
      />
      <AtomInput
        label="--Identifier"
        value={props.draft().identifier}
        onChange={updateIdentifier}
      />
      <AtomInput
        label="--Owner"
        value={props.draft().owner}
        onChange={updateOwner}
      />
      <AtomInput
        label="--Team"
        value={props.draft().team}
        onChange={updateTeam}
      />
      <AtomInput
        label="--Country"
        value={props.draft().country}
        onChange={updateCountry}
      />
      <div class="dog-form__actions">
        <AtomButton type={BUTTON_TYPES.ACCENT} onClick={props.onCancel}>
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
