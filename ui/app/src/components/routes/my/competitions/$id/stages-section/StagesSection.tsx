import { type Accessor, createMemo, createSignal, Index, Show } from "solid-js";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import StageEditorForm from "@/components/routes/my/competitions/$id/stages-section/StageEditorForm";
import { formatStageDateRange } from "@/utils/date";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import AtomTable, { type ColumnDef } from "@lib/components/atoms/table/AtomTable";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import Card from "@lib/components/molecules/card/Card";
import eyeIcon from "@/assets/miscelaneous/eye.svg";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { StageEditorModel } from "@/services/secured/stage-crud/stageCrud.types";
import { canDeleteStage } from "@/utils/stage";
import { useI18n } from "@/stores/i18n/i18n";
import { useDeviceType } from "@/utils/media-query/useDeviceType";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import "./styles.css";

type StageItem = NonNullable<CompetitionResponseDTO["stages"]>[number];

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

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
  const [view, setView] = createSignal<string>(VIEW.LIST);
  const device = useDeviceType();

  const cardActions = (stage: StageItem) =>
    props.isEditing ? (
      <div class="stages-section__stages--actions">
        <Show when={canDeleteStage(stage.status)}>
          <ConfirmActionButton
            text={stage.name}
            onConfirm={() => props.onDeleteStage(stage.id)}
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
              props.onOpenStageEditor(stage);
              return;
            }

            if (props.editingStageId === stage.id) {
              props.onCloseStageEditor();
            }
          }}
          open={props.editingStageId === stage.id}
          title={`${i18n.t("MY.COMPETITIONS.STAGES_SECTION.EDIT")} ${stage.name}`}
          trigger={
            <span>{i18n.t("MY.COMPETITIONS.STAGES_SECTION.EDIT")}</span>
          }
        />
      </div>
    ) : (
      <AtomButton
        type={BUTTON_TYPES.ACCENT}
        onClick={() => props.onNavigateToStage(stage.id)}
      >
        {i18n.t("MY.COMPETITIONS.STAGES_SECTION.INFO")}
      </AtomButton>
    );

  const tableActions = (stage: StageItem) =>
    props.isEditing ? (
      <div class="list-table__actions">
        <Show when={canDeleteStage(stage.status)}>
          <ConfirmActionButton
            text={stage.name}
            onConfirm={() => props.onDeleteStage(stage.id)}
          >
            <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
              <AtomSvgIcon
                src={trashIcon}
                alt={i18n.t("MY.COMPETITIONS.STAGES_SECTION.DELETE")}
                tinted
              />
            </AtomButton>
          </ConfirmActionButton>
        </Show>
        <AtomButton
          type={BUTTON_TYPES.ACCENT}
          onClick={() => props.onOpenStageEditor(stage)}
        >
          <AtomSvgIcon
            src={pencilIcon}
            alt={i18n.t("MY.COMPETITIONS.STAGES_SECTION.EDIT")}
            tinted
          />
        </AtomButton>
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
            if (!isOpen && props.editingStageId === stage.id) {
              props.onCloseStageEditor();
            }
          }}
          open={props.editingStageId === stage.id}
          title={`${i18n.t("MY.COMPETITIONS.STAGES_SECTION.EDIT")} ${stage.name}`}
        />
      </div>
    ) : (
      <div class="list-table__actions">
        <AtomButton
          type={BUTTON_TYPES.ACCENT}
          onClick={() => props.onNavigateToStage(stage.id)}
        >
          <AtomSvgIcon
            src={eyeIcon}
            alt={i18n.t("MY.COMPETITIONS.STAGES_SECTION.INFO")}
            tinted
          />
        </AtomButton>
      </div>
    );

  const columns = createMemo<ColumnDef<StageItem, any>[]>(() => {
    const cols: ColumnDef<StageItem, any>[] = [
      {
        accessorKey: "name",
        header: i18n.t("MY.COMPETITIONS.STAGES_SECTION.NAME"),
        cell: (info) => info.getValue<string>(),
      },
      {
        id: "status",
        accessorFn: (stage) => stage.status,
        header: i18n.t("MY.COMPETITIONS.STAGES_SECTION.STATUS"),
        enableSorting: false,
        cell: (info) => (
          <Show when={info.row.original.status}>
            {(status) => <StatusBadge status={status()} />}
          </Show>
        ),
      },
    ];

    if (device() !== "mobile") {
      cols.push({
        id: "dates",
        header: i18n.t("MY.COMPETITIONS.STAGES_SECTION.DATES"),
        enableSorting: false,
        cell: (info) =>
          formatStageDateRange(
            info.row.original.dateFrom,
            info.row.original.dateTo,
          ),
      });
    }

    if (device() === "laptop") {
      cols.push({
        id: "events",
        header: i18n.t("MY.COMPETITIONS.STAGES_SECTION.EVENTS"),
        cell: (info) => info.row.original.events.length,
      });
    }

    cols.push({
      id: "actions",
      header: () => null,
      enableSorting: false,
      cell: (info) => tableActions(info.row.original),
    });

    return cols;
  });

  const listContent = () => (
    <div class="stages-section__stages">
      <Index each={props.stages ?? []}>
        {(stage) => (
          <Card
            topLeft={stage().name}
            topRight={
              <Show when={stage().status}>
                {(status) => <StatusBadge status={status()} />}
              </Show>
            }
            subHeader={
              <span class="text-caption-md">
                {formatStageDateRange(stage().dateFrom, stage().dateTo)}
              </span>
            }
            content={
              <span class="stages-section__events-count text-caption-md">
                {i18n.t("MY.COMPETITIONS.STAGES_SECTION.EVENTS")}:{" "}
                {stage().events?.length ?? 0}
              </span>
            }
            actions={cardActions(stage())}
          />
        )}
      </Index>
    </div>
  );

  const tableContent = () => (
    <div class="stages-section__table">
      <AtomTable<StageItem>
        data={props.stages ?? []}
        columns={columns()}
        getRowId={(row) => row.id}
      />
    </div>
  );

  const controls = createMemo(() => [
    {
      value: VIEW.LIST,
      text: i18n.t("MY.COMPETITIONS.STAGES_SECTION.LIST"),
      content: listContent,
    },
    {
      value: VIEW.TABLE,
      text: i18n.t("MY.COMPETITIONS.STAGES_SECTION.TABLE"),
      content: tableContent,
    },
  ]);

  return (
    <div class="stages-section">
      <div class="stages-section__title">
        <span class="text-heading-sm">
          {i18n.t("MY.COMPETITIONS.STAGES_SECTION.STAGES")}
        </span>
        <Show when={props.isEditing}>
          <AtomDialog
            closeButtonText={i18n.t(
              "MY.COMPETITIONS.STAGES_SECTION.CLOSE_DIALOG",
            )}
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
      <AtomSegmentedControl
        title={i18n.t("MY.COMPETITIONS.STAGES_SECTION.STAGES_BY")}
        control={view()}
        onControlChange={setView}
        controls={controls()}
      />
    </div>
  );
}
