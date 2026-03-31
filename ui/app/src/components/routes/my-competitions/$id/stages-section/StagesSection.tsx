import { type Accessor, Index, Show } from "solid-js";
import type { Competition } from "@/services/api/competition_crud/competitionCrudTypes";
import type { StageEditorModel } from "@/services/api/stage_api_crud/stageApiCrud";
import StageDialog from "@/components/routes/my-competitions/$id/stage-dialog/StageDialog";
import { formatStageDateRange } from "@/utils/stage";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import Card from "@lib/components/molecules/card/Card";
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
          <CircleButton
            aria-label="--Add stage"
            onClick={props.onOpenNewStageEditor}
          >
            +
          </CircleButton>
          <AtomDialog
            closeButtonText="--Close dialog"
            content={
              <StageDialog
                draft={props.draft}
                onCancel={props.onCloseStageEditor}
                onDraftChange={props.onUpdateStageDialogDraft}
                onSave={props.onSaveStageEditor}
              />
            }
            onOpenChange={(isOpen) => {
              if (!isOpen && props.isCreatingStage) {
                props.onCloseStageEditor();
              }
            }}
            open={props.isCreatingStage}
            title="--New stage"
            trigger={<span />}
          />
        </Show>
      </div>
      <div class="stages-section--stages">
        <Index each={props.stages ?? []}>
          {(stage) => (
            <Card
              topLeft={stage().name}
              subHeader={<p>{formatStageDateRange(stage())}</p>}
              actions={
                <>
                  <Show when={props.isEditing}>
                    <>
                      <AtomDialog
                        closeButtonText="--Close dialog"
                        content={
                          <StageDialog
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
                      <CircleButton
                        aria-label={`--Delete ${stage().name}`}
                        onClick={() => props.onDeleteStage(stage().id)}
                      >
                        -
                      </CircleButton>
                    </>
                  </Show>
                  <Show when={!props.isEditing}>
                    <AtomButton
                      type="accent"
                      onClick={() => props.onNavigateToStage(stage().id)}
                    >
                      --+Info
                    </AtomButton>
                  </Show>
                </>
              }
            />
          )}
        </Index>
      </div>
    </div>
  );
}
