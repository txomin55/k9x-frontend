import { type Accessor, Index, Show } from "solid-js";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import StageEditorForm from "@/components/routes/my/competitions/$id/stages-section/StageEditorForm";
import { formatStageDateRange } from "@/utils/date";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import Card from "@lib/components/molecules/card/Card";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import "./styles.css";
import { StageEditorModel } from "@/services/secured/stage-crud/stageCrud.types";
import { STAGE_STATUS } from "@/utils/stage";
import { useI18n } from "@/stores/i18n/i18n";

type StageItem = NonNullable<CompetitionResponseDTO["stages"]>[number];

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
  stages?: CompetitionResponseDTO["stages"];
};

export default function StagesSection(props: StagesSectionProps) {
  const i18n = useI18n();
  return (
    <div class="stages-section">
      <div class="stages-section__title">
        <h2>{i18n.t("MY.COMPETITIONS.STAGES_SECTION.STAGES")}</h2>
        <Show when={props.isEditing}>
          <AtomDialog
            closeButtonText={i18n.t("MY.COMPETITIONS.STAGES_SECTION.CLOSE_DIALOG")}
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
            title={i18n.t("MY.COMPETITIONS.STAGES_SECTION.NEW_STAGE")}
            trigger={<CircleButton>+</CircleButton>}
          />
        </Show>
      </div>
      <div class="stages-section__stages">
        <Index each={props.stages ?? []}>
          {(stage) => (
            <Card
              topLeft={stage().name}
              subHeader={
                <p>{formatStageDateRange(stage().dateFrom, stage().dateTo)}</p>
              }
              actions={
                props.isEditing ? (
                  <div class="stages-section__stages--actions">
                    <Show when={stage().status !== STAGE_STATUS.CREATED}>
                      <ConfirmActionButton
                        text={stage().name}
                        onConfirm={() => props.onDeleteStage(stage().id)}
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          {i18n.t("MY.COMPETITIONS.STAGES_SECTION.DELETE")}
                        </AtomButton>
                      </ConfirmActionButton>
                    </Show>
                    <AtomDialog
                      closeButtonText={i18n.t("MY.COMPETITIONS.STAGES_SECTION.CLOSE_DIALOG")}
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
                      title={`${i18n.t("MY.COMPETITIONS.STAGES_SECTION.EDIT")} ${stage().name}`}
                      trigger={<span>{i18n.t("MY.COMPETITIONS.STAGES_SECTION.EDIT")}</span>}
                    />
                  </div>
                ) : (
                  <AtomButton
                    type={BUTTON_TYPES.ACCENT}
                    onClick={() => props.onNavigateToStage(stage().id)}
                  >
                    {i18n.t("MY.COMPETITIONS.STAGES_SECTION.INFO")}
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
