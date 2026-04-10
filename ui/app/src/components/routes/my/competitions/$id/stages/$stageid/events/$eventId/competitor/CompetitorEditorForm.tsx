import type { EventCompetitorDetail } from "@/services/api/competition-crud/competitionCrud.types";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import type { Dog } from "@/services/api/dog-crud/dogCrud.types";
import { Show } from "solid-js";

type OrderBounds = {
  minValue: number;
  maxValue: number;
};

type CompetitorDialogContentProps = {
  competitorDialogDraft: EventCompetitorDetail | null;
  onCloseCompetitorEditor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: EventCompetitorDetail | null,
    ) => EventCompetitorDetail | null,
  ) => void;
  onSaveCompetitor: () => void;
  orderBounds: OrderBounds;
  dogOptions: AtomSelectOption[];
  dogsById: Map<string, Dog>;
};

export default function CompetitorEditorForm(
  props: CompetitorDialogContentProps,
) {
  const setIdentity = (value) =>
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            identity: value,
          }
        : current,
    );

  const setTeam = (value) =>
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            team: value,
          }
        : current,
    );

  const setOwner = (value) =>
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            owner: value,
          }
        : current,
    );

  const setCountry = (value) =>
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            country: value,
          }
        : current,
    );
  const setOrder = (value: string) => {
    const parsedOrder = Number(value);
    const normalizedOrder = Number.isFinite(parsedOrder) ? parsedOrder : 0;

    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            order: normalizedOrder,
          }
        : current,
    );
  };
  const handleDogChange = (option: AtomSelectOption | null) => {
    const dog = option ? props.dogsById.get(option.value) : undefined;

    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            dogId: option?.value ?? "",
            name: dog?.name ?? "",
            breed: dog?.breed ?? "",
            identity: dog?.identifier ?? "",
            country: dog?.country ?? "",
            team: dog?.team ?? "",
          }
        : current,
    );
  };
  const minOrder = Math.max(props.orderBounds.minValue, 1);
  const maxOrder = Math.max(minOrder, props.orderBounds.maxValue);
  return (
    <Show when={props.competitorDialogDraft}>
      {(draft) => (
        <div class="competitor-editor-form">
          <AtomSelect
            label="--Dog"
            onChange={handleDogChange}
            options={props.dogOptions}
            placeholder="--Select a dog"
            value={
              props.dogOptions.find(
                (option) => option.value === draft().dogId,
              ) ?? null
            }
          />
          <AtomInput
            label="--Owner"
            value={draft().owner}
            onChange={setOwner}
          />
          <p>
            --Name {draft().name} ({draft().breed})
          </p>
          <AtomInput
            label="--Identity"
            value={draft().identity}
            onChange={setIdentity}
          />
          <AtomInput label="--Team" value={draft().team} onChange={setTeam} />
          <AtomInput
            label="--Country"
            value={draft().country}
            onChange={setCountry}
          />
          <AtomNumberInput
            label="--Order"
            value={draft().order}
            onChange={setOrder}
            minValue={minOrder}
            maxValue={maxOrder}
          />
          <div class="competitor-editor-form__actions">
            <AtomButton
              type={BUTTON_TYPES.ACCENT}
              onClick={props.onCloseCompetitorEditor}
            >
              --Cancel
            </AtomButton>
            <AtomButton onClick={props.onSaveCompetitor}>--Save</AtomButton>
          </div>
        </div>
      )}
    </Show>
  );
}
