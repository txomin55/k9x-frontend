import type { CreateDogRequest } from "@/services/api/dog-crud/dogCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
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
  const updateField = (field: keyof CreateDogRequest) => (value: string) => {
    props.onDraftChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <div class="dog-form">
      <AtomInput
        label="--Name"
        value={props.draft().name ?? ""}
        onChange={updateField("name")}
      />
      <AtomInput
        label="--Image"
        value={props.draft().image ?? ""}
        onChange={updateField("image")}
        disabled
      />
      <AtomInput
        label="--Breed"
        value={props.draft().breed ?? ""}
        onChange={updateField("breed")}
      />
      <AtomInput
        label="--Identifier"
        value={props.draft().identifier ?? ""}
        onChange={updateField("identifier")}
      />
      <AtomInput
        label="--Owner"
        value={props.draft().owner ?? ""}
        onChange={updateField("owner")}
      />
      <AtomInput
        label="--Team"
        value={props.draft().team ?? ""}
        onChange={updateField("team")}
      />
      <AtomInput
        label="--Country"
        value={props.draft().country ?? ""}
        onChange={updateField("country")}
      />
      <div class="dog-form__actions">
        <AtomButton type={BUTTON_TYPES.GHOST} onClick={props.onCancel}>
          --Cancel
        </AtomButton>
        <AtomButton onClick={props.onSave}>--Save</AtomButton>
      </div>
    </div>
  );
}
