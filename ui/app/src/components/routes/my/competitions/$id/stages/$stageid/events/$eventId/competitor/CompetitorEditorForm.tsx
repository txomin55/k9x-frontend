import type { EventCompetitorDetail } from "@/services/api/competition-crud/competitionCrudTypes";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import { BUTTON_TYPES } from "@lib/components/atoms/button/atomButton.constants";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import { Show } from "solid-js";

type CompetitorDialogContentProps = {
  competitorDialogDraft: EventCompetitorDetail | null;
  onCloseCompetitorEditor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: EventCompetitorDetail | null,
    ) => EventCompetitorDetail | null,
  ) => void;
  onSaveCompetitor: () => void;
};

export default function CompetitorEditorForm(
  props: CompetitorDialogContentProps,
) {
  const setFinalScore = (value) =>
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            finalScore: Number(value) || 0,
          }
        : current,
    );

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
  return (
    <Show when={props.competitorDialogDraft}>
      {(draft) => (
        <div class="competitor-editor-form">
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
          />
          <AtomNumberInput
            label="--Final score"
            value={draft().finalScore}
            onChange={setFinalScore}
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
