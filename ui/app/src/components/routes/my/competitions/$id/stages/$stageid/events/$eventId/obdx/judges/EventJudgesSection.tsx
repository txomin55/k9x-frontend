import { createMemo, createSignal, Index, Show } from "solid-js";
import AtomDialog from "library/src/components/atoms/dialog/AtomDialog";
import AtomButton, {
  BUTTON_TYPES,
} from "library/src/components/atoms/button/AtomButton";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import AtomTable, { type ColumnDef } from "@lib/components/atoms/table/AtomTable";
import Card from "library/src/components/molecules/card/Card";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import plusIcon from "@/assets/miscelaneous/plus.svg";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import JudgeEditorForm from "./JudgeEditorForm";
import { useJudges } from "@/services/secured/judge-crud/judgeCrud";
import { EventJudgeDetailResponseDTO } from "@/services/secured/event-crud/eventCrud.types";
import { useI18n } from "@/stores/i18n/i18n";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { useViewportFillHeight } from "@/utils/layout/useViewportFillHeight";
import "./styles.css";

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

type EventJudgesSectionProps = {
  editingJudgeId: string | null;
  onCommitJudge: () => void;
  isCreatingJudge: boolean;
  isEditing: boolean;
  menuOpen: boolean;
  judgeDialogDraft: EventJudgeDetailResponseDTO | null;
  judges: EventJudgeDetailResponseDTO[];
  onAddJudge: () => void;
  onDeleteJudge: (judgeId: string) => void;
  onJudgeDraftChange: (
    updater: (
      current: EventJudgeDetailResponseDTO | null,
    ) => EventJudgeDetailResponseDTO | null,
  ) => void;
  onOpenJudgeEditor: (judge: EventJudgeDetailResponseDTO) => void;
  onCreateJudge: () => void;
};

export default function EventJudgesSection(props: EventJudgesSectionProps) {
  const i18n = useI18n();
  const judgesQuery = useJudges({
    refetchOnMount: !isOffline(),
    gcTime: 5 * 60 * 1000,
  });
  const judgeNameById = createMemo(() => {
    const map = new Map<string, string>();
    for (const judge of judgesQuery.data ?? []) {
      map.set(judge.id, judge.name);
    }
    return map;
  });

  const judgeOptions = createMemo(() => {
    const addedJudgeIds = new Set(
      props.judges
        .filter((judge) => judge.id !== props.editingJudgeId)
        .map((judge) => judge.id),
    );

    return (judgesQuery.data ?? [])
      .filter((judge) => !addedJudgeIds.has(judge.id))
      .map((judge) => ({
        label: judge.name,
        value: judge.id,
        preLabel: <CountryFlag country={judge.country} alt={`${judge.country} flag`} />,
      }));
  });

  const judgeCountryById = createMemo(() => {
    const map = new Map<string, string>();
    for (const judge of judgesQuery.data ?? []) {
      map.set(judge.id, judge.country);
    }
    return map;
  });

  const getJudgeName = (judgeId: string) =>
    judgeNameById().get(judgeId) ?? judgeId;
  const getJudgeCountry = (judgeId: string) =>
    judgeCountryById().get(judgeId) ?? "";

  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [view, setView] = createSignal<string>(VIEW.LIST);
  const tableFill = useViewportFillHeight();

  const openJudgeEditor = (judge: EventJudgeDetailResponseDTO) => {
    props.onOpenJudgeEditor(judge);
    setDialogOpen(true);
  };

  const viewDialogTitle = () => {
    if (props.isCreatingJudge) {
      return i18n.t("MY.COMPETITIONS.EVENT_JUDGES.NEW_JUDGE");
    }

    return i18n.t("MY.COMPETITIONS.EVENT_JUDGES.EDIT_JUDGE");
  };

  const columns = createMemo<ColumnDef<EventJudgeDetailResponseDTO, any>[]>(
    () => {
      const cols: ColumnDef<EventJudgeDetailResponseDTO, any>[] = [
        {
          id: "name",
          accessorFn: (judge) => getJudgeName(judge.id),
          header: i18n.t("MY.COMPETITIONS.EVENT_JUDGES.NAME"),
          cell: (info) => (
            <div class="list-table__name">
              <CountryFlag country={getJudgeCountry(info.row.original.id)} />
              <span>{getJudgeName(info.row.original.id)}</span>
            </div>
          ),
        },
        {
          id: "email",
          accessorFn: (judge) => judge.collectorEmail,
          header: i18n.t("MY.COMPETITIONS.EVENT_JUDGES.EMAIL"),
          cell: (info) => info.row.original.collectorEmail,
        },
      ];

      if (props.isEditing) {
        cols.push({
          id: "actions",
          header: () => null,
          enableSorting: false,
          cell: (info) => (
            <div class="list-table__actions">
              <ConfirmActionButton
                text={getJudgeName(info.row.original.id)}
                onConfirm={() => props.onDeleteJudge(info.row.original.id)}
              >
                <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                  <AtomSvgIcon
                    src={trashIcon}
                    alt={i18n.t("MY.COMPETITIONS.EVENT_JUDGES.DELETE")}
                    tinted
                  />
                </AtomButton>
              </ConfirmActionButton>
              <AtomButton
                type={BUTTON_TYPES.ACCENT}
                onClick={() => openJudgeEditor(info.row.original)}
              >
                <AtomSvgIcon
                  src={pencilIcon}
                  alt={i18n.t("MY.COMPETITIONS.EVENT_JUDGES.EDIT")}
                  tinted
                />
              </AtomButton>
            </div>
          ),
        });
      }

      return cols;
    },
  );

  const listContent = () => (
    <div class="event-judges-section__judges">
      <Index each={props.judges}>
        {(judge) => (
          <Card
            topLeft={
              <div class="event-judges-section__judge-name">
                <CountryFlag country={getJudgeCountry(judge().id)} />
                <span>{getJudgeName(judge().id)}</span>
              </div>
            }
            description={
              <p>{`${i18n.t("MY.COMPETITIONS.EVENT_JUDGES.EMAIL")}: ${judge().collectorEmail}`}</p>
            }
            actions={
              props.isEditing ? (
                <div class="event-judges-section__judges--actions">
                  <ConfirmActionButton
                    text={getJudgeName(judge().id)}
                    onConfirm={() => props.onDeleteJudge(judge().id)}
                  >
                    <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                      {i18n.t("MY.COMPETITIONS.EVENT_JUDGES.DELETE")}
                    </AtomButton>
                  </ConfirmActionButton>
                  <span onClick={() => openJudgeEditor(judge())}>
                    {i18n.t("MY.COMPETITIONS.EVENT_JUDGES.EDIT")}
                  </span>
                </div>
              ) : undefined
            }
          />
        )}
      </Index>
    </div>
  );

  const tableContent = () => (
    <div
      class="event-judges-section__table"
      ref={tableFill.ref}
      style={{ "--table-max-height": `${tableFill.height()}px` }}
    >
      <AtomTable<EventJudgeDetailResponseDTO>
        data={props.judges}
        columns={columns()}
        getRowId={(row) => row.id}
      />
    </div>
  );

  const controls = createMemo(() => [
    {
      value: VIEW.LIST,
      text: i18n.t("MY.COMPETITIONS.EVENT_JUDGES.LIST"),
      content: listContent,
    },
    {
      value: VIEW.TABLE,
      text: i18n.t("MY.COMPETITIONS.EVENT_JUDGES.TABLE"),
      content: tableContent,
    },
  ]);

  return (
    <section class="event-judges-section">
      <Show when={props.isEditing && props.menuOpen}>
        <div class="floating-action floating-action--level-2">
          <button
            class="floating-action__trigger"
            onClick={() => {
              props.onAddJudge();
              setDialogOpen(true);
            }}
          >
            <span class="floating-action__label">
              {i18n.t("MY.COMPETITIONS.EVENT_JUDGES.ADD_JUDGE")}
            </span>
            <span class="floating-action__circle">
              <AtomSvgIcon
                src={plusIcon}
                alt={i18n.t("MY.COMPETITIONS.EVENT_JUDGES.ADD_JUDGE")}
                tinted
              />
            </span>
          </button>
        </div>
      </Show>
      <Show
        when={props.judges.length > 0}
        fallback={<p>{i18n.t("MY.COMPETITIONS.EVENT_JUDGES.NO_JUDGES")}</p>}
      >
        <AtomSegmentedControl
          title={i18n.t("MY.COMPETITIONS.EVENT_JUDGES.JUDGES_BY")}
          control={view()}
          onControlChange={setView}
          controls={controls()}
        />
      </Show>
      <AtomDialog
        closeButtonText={i18n.t("MY.COMPETITIONS.EVENT_JUDGES.CLOSE_DIALOG")}
        content={
          <Show when={props.judgeDialogDraft}>
            {(draft) => (
              <JudgeEditorForm
                draft={draft}
                onCommit={props.onCommitJudge}
                onDraftChange={props.onJudgeDraftChange}
                onCancel={() => {
                  setDialogOpen(false);
                }}
                onCreate={() => {
                  props.onCreateJudge();
                  setDialogOpen(false);
                }}
                judgeOptions={judgeOptions()}
                displaySave={props.isCreatingJudge}
              />
            )}
          </Show>
        }
        onOpenChange={setDialogOpen}
        open={dialogOpen()}
        title={viewDialogTitle()}
      />
    </section>
  );
}
