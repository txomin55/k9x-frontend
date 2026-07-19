import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  Suspense,
} from "solid-js";
import Card from "@lib/components/molecules/card/Card";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import CompetitionInfo from "@/components/routes/my/competitions/$id/competition-info/CompetitionInfo";
import StagesSection from "@/components/routes/my/competitions/$id/stages-section/StagesSection";
import {
  useCompetition,
  useCompetitions,
} from "@/services/secured/competition-crud/competitionCrud";
import {
  type CompetitionResponseDTO,
  type UpdateCompetitionRequestDTO,
} from "@/services/secured/competition-crud/competitionCrud.types";
import {
  toApiStage,
  useApiStage,
} from "@/services/secured/stage-crud/stageCrud";
import { canDeleteCompetition, canEditCompetition } from "@/utils/competition";
import { toUndefinedIfBlank } from "@/utils/date";
import {
  validateRequiredSelection,
  validateRequiredText,
} from "@/utils/validation/textField";
import FloatingEditMenu from "@/components/common/floating-edit-menu/FloatingEditMenu";
import plusIcon from "@/assets/miscelaneous/plus.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import StageEditorForm from "@/components/routes/my/competitions/$id/stages-section/StageEditorForm";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { useI18n } from "@/stores/i18n/i18n";
import {
  StageEditorModel,
  UpdateStageRequestDTO,
} from "@/services/secured/stage-crud/stageCrud.types";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { generateEntityId } from "@/utils/id/generateEntityId";
import { useAuthUser } from "@/stores/auth/auth";
import "./styles.css";

export const Route = createFileRoute("/my/competitions/$id/")({
  component: CompetitionDetailRoute,
});

function CompetitionDetailRoute() {
  return (
    <Suspense fallback={<CompetitionDetailSkeleton />}>
      <CompetitionDetailPage />
    </Suspense>
  );
}

function CompetitionDetailSkeleton() {
  return (
    <div class="competition-detail">
      <div class="page competition-detail">
        <div class="competition-info">
          <div
            style={{
              display: "flex",
              gap: "var(--unit-1)",
              "align-items": "center",
            }}
          >
            <AtomSkeleton width="14rem" height="var(--text-heading-md)" />
            <AtomSkeleton
              variant="rectangular"
              width="5rem"
              height="var(--unit-5)"
              radius="var(--radius-full)"
            />
          </div>
          <AtomSkeleton width="6rem" />
          <AtomSkeleton count={2} />
          <AtomSkeleton width="10rem" />
        </div>

        <div class="stages-section">
          <div class="stages-section__title">
            <AtomSkeleton width="6rem" height="var(--text-heading-sm)" />
          </div>
          <div class="stages-section__stages">
            <For each={Array.from({ length: 3 })}>
              {() => (
                <Card
                  topLeft={
                    <AtomSkeleton
                      width="8rem"
                      height="var(--text-heading-xs)"
                    />
                  }
                  content={<AtomSkeleton width="10rem" />}
                />
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompetitionDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ from: "/my/competitions/$id/" });
  const { createCompetition, createDefaultCompetition } = useCompetition();
  let hasCreatedDraftCompetition = false;

  createEffect(() => {
    if (params().id !== "new" || hasCreatedDraftCompetition) return;

    hasCreatedDraftCompetition = true;
    const draftCompetition = createDefaultCompetition();

    createCompetition(draftCompetition);
    void navigate({
      params: { id: draftCompetition.id ?? "" },
      replace: true,
      to: "/my/competitions/$id",
    });
  });

  return params().id === "new" ? (
    <CompetitionDetailSkeleton />
  ) : (
    <CompetitionDetailContent id={params().id} />
  );
}

function CompetitionDetailContent(props: { id: string }) {
  const i18n = useI18n();
  const navigate = useNavigate();
  const user = useAuthUser();
  const { deleteCompetition, updateCompetition } = useCompetition();

  const competitionsQuery = useCompetitions({
    staleTime: Number.POSITIVE_INFINITY,
    enabled: () => Boolean(user()),
  });
  const competition = createMemo(() =>
    (competitionsQuery.data ?? []).find((entry) => entry.id === props.id),
  );
  const isResolved = () =>
    !competitionsQuery.isPending && !competitionsQuery.isFetching;

  return (
    <div class="competition-detail">
      <Suspense fallback={<CompetitionDetailSkeleton />}>
        <Show
          when={competition() || isResolved()}
          fallback={<CompetitionDetailSkeleton />}
        >
          <Show
            when={competition()}
            fallback={
              <p>{i18n.t("MY.COMPETITIONS.DETAIL.COMPETITION_NOT_FOUND")}</p>
            }
          >
            <CompetitionDetailBody
            competition={competition}
            onDelete={() => {
              const currentCompetition = competition();

              if (!currentCompetition) return;

              deleteCompetition(currentCompetition.id);
              void navigate({
                to: "/my/competitions/list",
              });
            }}
            onUpdate={updateCompetition}
          />
          </Show>
        </Show>
      </Suspense>
    </div>
  );
}

function CompetitionDetailBody(props: {
  competition: Accessor<CompetitionResponseDTO | undefined>;
  onDelete: () => void;
  onUpdate: (
    competitionId: string,
    competition: UpdateCompetitionRequestDTO,
  ) => void;
}) {
  const i18n = useI18n();
  const navigate = useNavigate();
  const {
    createApiStage,
    createDefaultApiStage,
    deleteApiStage,
    updateApiStage,
  } = useApiStage();
  const [isEditing, setIsEditing] = createSignal(false);
  const [menuOpen, setMenuOpen] = createSignal(false);
  const [title, setTitle] = createSignal(props.competition()?.name ?? "");
  const [country, setCountry] = createSignal(
    props.competition()?.country ?? "",
  );
  const [description, setDescription] = createSignal(
    props.competition()?.description ?? "",
  );
  const [address, setAddress] = createSignal(
    props.competition()?.address ?? "",
  );
  const [stageDialogParam, setStageDialogParam] = useSearchParam(
    "stageDialog",
    "",
    "push",
  );
  const isCreatingStage = () => stageDialogParam() === "new";
  const editingStageId = () =>
    stageDialogParam() && stageDialogParam() !== "new"
      ? stageDialogParam()
      : null;
  const [stageDialogDraft, setStageDialogDraft] =
    createSignal<StageEditorModel | null>(null);

  createEffect(() => {
    if (stageDialogParam()) setIsEditing(true);
  });

  createEffect(() => {
    const competition = props.competition();
    const param = stageDialogParam();
    if (!competition || !param || stageDialogDraft()) return;

    if (param === "new") {
      setStageDialogDraft({
        competitionId: competition.id,
        dateFrom: Date.now(),
        dateTo: Date.now(),
        events: [],
        id: generateEntityId("stage"),
        name: "",
      });
      return;
    }

    const stage = competition.stages?.find((entry) => entry.id === param);
    if (stage) {
      setStageDialogDraft(toApiStage(stage, competition.id));
    }
  });
  const sortedStages = createMemo(() => {
    const stages = props.competition()?.stages;
    if (!stages) {
      return stages;
    }

    return [...stages].toSorted((left, right) => {
      if (left.dateFrom === right.dateFrom) {
        return left.dateTo - right.dateTo;
      }
      return left.dateFrom - right.dateFrom;
    });
  });

  createEffect(() => {
    if (isEditing()) return;
    const competition = props.competition();

    if (!competition) return;

    setTitle(competition.name);
    setCountry(competition.country);
    setDescription(competition.description ?? "");
    setAddress(competition.address ?? "");
  });

  createEffect(() => {
    if (isEditing()) return;

    closeStageEditor();
  });

  const openStageEditor = (
    stage: NonNullable<CompetitionResponseDTO["stages"]>[number],
  ) => {
    const competition = props.competition();

    if (!competition) return;

    setStageDialogDraft(toApiStage(stage, competition.id));
    setStageDialogParam(stage.id);
  };

  const openNewStageEditor = () => {
    const competition = props.competition();

    if (!competition) return;

    const draft = createDefaultApiStage(competition.id);

    setStageDialogDraft({
      competitionId: draft.competitionId ?? competition.id,
      dateFrom: Date.now(),
      dateTo: Date.now(),
      events: [],
      id: draft.id ?? generateEntityId("stage"),
      name: draft.name ?? "",
    });
    setStageDialogParam("new");
  };

  const closeStageEditor = () => {
    setStageDialogDraft(null);
    setStageDialogParam("");
  };

  const updateStageDialogDraft = (
    updater: (current: StageEditorModel | null) => StageEditorModel | null,
  ) => {
    setStageDialogDraft(updater);
  };

  const saveStageEditor = () => {
    const draft = stageDialogDraft();

    if (!draft) return;

    if (isCreatingStage()) {
      createApiStage(draft);
    } else {
      updateApiStage(draft.competitionId, draft.id, {
        dateFrom: draft.dateFrom,
        dateTo: draft.dateTo,
        name: draft.name,
      } satisfies UpdateStageRequestDTO);
    }

    closeStageEditor();
  };

  const getOnDeleteStage = () => {
    return (stageId: string) => {
      if (editingStageId() === stageId) {
        closeStageEditor();
      }

      const competition = props.competition();

      if (!competition) return;

      deleteApiStage(stageId, competition.id);
    };
  };

  const onNavigateToStage = (stageId: string) => {
    const competition = props.competition();

    if (!competition) return;

    void navigate({
      params: {
        id: competition.id,
        stageId,
      },
      to: "/my/competitions/$id/stages/$stageId",
    });
  };

  const commitCompetitionEdits = () => {
    if (!isEditing()) return;

    const competition = props.competition();

    if (!competition) return;

    if (validateRequiredText(title()) || validateRequiredSelection(country())) {
      return;
    }

    const nextCompetition: UpdateCompetitionRequestDTO = {
      country: country(),
      description: description(),
      address: toUndefinedIfBlank(address()) ?? "",
      name: title(),
    };
    const hasChanges =
      nextCompetition.name !== competition.name ||
      nextCompetition.country !== competition.country ||
      nextCompetition.description !== (competition.description ?? "") ||
      nextCompetition.address !== (competition.address ?? "");

    if (!hasChanges) return;

    props.onUpdate(competition.id, nextCompetition);
  };

  return (
    <div class="page competition-detail">
      <CompetitionInfo
        address={address()}
        country={country()}
        description={description()}
        displayAddress={props.competition()?.address}
        displayDescription={props.competition()?.description}
        isEditing={isEditing()}
        onAddressChange={setAddress}
        onCommit={commitCompetitionEdits}
        onCountryChange={setCountry}
        onDescriptionChange={setDescription}
        onTitleChange={setTitle}
        status={props.competition()?.status}
        title={title()}
      />
      <StagesSection
        draft={stageDialogDraft}
        editingStageId={editingStageId()}
        isEditing={isEditing()}
        onCloseStageEditor={closeStageEditor}
        onDeleteStage={getOnDeleteStage()}
        onNavigateToStage={onNavigateToStage}
        onOpenStageEditor={openStageEditor}
        onSaveStageEditor={saveStageEditor}
        onUpdateStageDialogDraft={updateStageDialogDraft}
        stages={sortedStages()}
      />
      <Show when={canEditCompetition(props.competition()?.status)}>
        <Show when={isEditing() && menuOpen()}>
          <Show when={canDeleteCompetition(props.competition()?.status)}>
            <div class="floating-action floating-action--level-3">
              <ConfirmActionButton text={title()} onConfirm={props.onDelete}>
                <span class="floating-action__label">
                  {i18n.t("MY.COMPETITIONS.DETAIL.DELETE")}
                </span>
                <span class="floating-action__circle floating-action__circle--danger">
                  <AtomSvgIcon
                    src={trashIcon}
                    alt={i18n.t("MY.COMPETITIONS.DETAIL.DELETE")}
                    tinted
                  />
                </span>
              </ConfirmActionButton>
            </div>
          </Show>
          <div class="floating-action floating-action--level-2">
            <AtomDialog
              closeButtonText={i18n.t(
                "MY.COMPETITIONS.STAGES_SECTION.CLOSE_DIALOG",
              )}
              content={
                <StageEditorForm
                  draft={stageDialogDraft}
                  onCancel={closeStageEditor}
                  onDraftChange={updateStageDialogDraft}
                  onSave={saveStageEditor}
                />
              }
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  openNewStageEditor();
                } else {
                  closeStageEditor();
                }
              }}
              open={isCreatingStage()}
              title={i18n.t("MY.COMPETITIONS.STAGES_SECTION.NEW_STAGE")}
              triggerClass="floating-action__trigger"
              trigger={
                <>
                  <span class="floating-action__label">
                    {i18n.t("MY.COMPETITIONS.STAGES_SECTION.ADD_STAGE")}
                  </span>
                  <span class="floating-action__circle">
                    <AtomSvgIcon
                      src={plusIcon}
                      alt={i18n.t("MY.COMPETITIONS.STAGES_SECTION.ADD_STAGE")}
                      tinted
                    />
                  </span>
                </>
              }
            />
          </div>
        </Show>
        <FloatingEditMenu
          editing={isEditing()}
          menuOpen={menuOpen()}
          onMenuToggle={() => setMenuOpen((current) => !current)}
          onEditToggle={() => setIsEditing((current) => !current)}
          configLabel={i18n.t("COMMON.FLOATING_MENU.OPTIONS")}
          editLabel={i18n.t("MY.COMPETITIONS.DETAIL.EDIT")}
          viewLabel={i18n.t("MY.COMPETITIONS.DETAIL.VIEW")}
        />
      </Show>
    </div>
  );
}
