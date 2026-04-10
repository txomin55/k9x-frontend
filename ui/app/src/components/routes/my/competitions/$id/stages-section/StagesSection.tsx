import { type Accessor, Index, Show } from "solid-js";
import type { Competition } from "@/services/api/competition-crud/competitionCrud.types";
import type { StageEditorModel } from "@/services/api/stage-api-crud/stageApiCrud";
import StageEditorForm from "@/components/routes/my/competitions/$id/stages-section/StageEditorForm";
import { formatStageDateRange } from "@/utils/stage";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import Card from "@lib/components/molecules/card/Card";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import "./styles.css";

type StageItem = NonNullable<Competition["stages"]>[number];

type StagesSectionProps = {
  draft: Accessor<StageEditorModel | null>;
  editingStageId: string | null;
  isCreatingStage: boolean;
  isEditing: boolean;
  onCloseStageEditor: () => void;
  onDeleteStage: (stageId: string) => void;
  onNavigateToStage: (stageId: string) => void;
  onOpenNewStageEditor: () => void;
  onOpenStageEditor: (stage: StageItem) => void;
  onSaveStageEditor: () => void;
  onUpdateStageDialogDraft: (
    updater: (current: StageEditorModel | null) => StageEditorModel | null,
  ) => void;
  stages?: Competition["stages"];
};

export default function StagesSection(props: StagesSectionProps) {
  return (
    <div class="stages-section">
      <div class="stages-section__title">
        <h2>--Stages</h2>
        <Show when={props.isEditing}>
          <AtomDialog
            closeButtonText="--Close dialog"
            content={
              <StageEditorForm
                draft={props.draft}
                onCancel={props.onCloseStageEditor}
                onDraftChange={props.onUpdateStageDialogDraft}
                onSave={props.onSaveStageEditor}
              />
            }
            onOpenChange={(isOpen) => {
              if (isOpen) {
                props.onOpenNewStageEditor();
              } else {
                props.onCloseStageEditor();
              }
            }}
            open={props.isCreatingStage}
            title="--New stage"
            trigger={<CircleButton>+</CircleButton>}
          />
        </Show>
      </div>
      <div class="stages-section__stages">
        <Index each={props.stages ?? []}>
          {(stage) => (
            <Card
              topLeft={stage().name}
              subHeader={<p>{formatStageDateRange(stage())}</p>}
              actions={
                props.isEditing ? (
                  <div class="stages-section__stages--actions">
                    <ConfirmActionButton
                      text={stage().name}
                      onConfirm={() => props.onDeleteStage(stage().id)}
                    >
                      <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                        --Delete
                      </AtomButton>
                    </ConfirmActionButton>
                    <AtomDialog
                      closeButtonText="--Close dialog"
                      content={
                        <StageEditorForm
                          draft={props.draft}
                          onCancel={props.onCloseStageEditor}
                          onDraftChange={props.onUpdateStageDialogDraft}
                          onSave={props.onSaveStageEditor}
                        />
                      }
                      onOpenChange={(isOpen) => {
                        if (isOpen) {
                          props.onOpenStageEditor(stage());
                          return;
                        }

                        if (props.editingStageId === stage().id) {
                          props.onCloseStageEditor();
                        }
                      }}
                      open={props.editingStageId === stage().id}
                      title={`--Edit ${stage().name}`}
                      trigger={<span>--Edit</span>}
                    />
                  </div>
                ) : (
                  <AtomButton
                    type={BUTTON_TYPES.ACCENT}
                    onClick={() => props.onNavigateToStage(stage().id)}
                  >
                    --+Info
                  </AtomButton>
                )
              }
            />
          )}
        </Index>
      </div>
    </div>
  );
}
