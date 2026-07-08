import { createFileRoute, useNavigate, useParams } from "@tanstack/solid-router";
import { type Accessor, createEffect, createMemo, createSignal, Show, Suspense } from "solid-js";
import CompetitionInfo from "@/components/routes/my/competitions/$id/competition-info/CompetitionInfo";
import StagesSection from "@/components/routes/my/competitions/$id/stages-section/StagesSection";
import { useCompetition } from "@/services/secured/competition-crud/competitionCrud";
import {
  type CompetitionResponseDTO,
  type UpdateCompetitionRequestDTO
} from "@/services/secured/competition-crud/competitionCrud.types";
import { toApiStage, useApiStage } from "@/services/secured/stage-crud/stageCrud";
import { canDeleteCompetition, canEditCompetition } from "@/utils/competition";
import { toUndefinedIfBlank } from "@/utils/date";
import { validateRequiredSelection, validateRequiredText } from "@/utils/validation/textField";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import pencilIcon from "@/assets/pencil.svg";
import eyeIcon from "@/assets/eye.svg";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { useI18n } from "@/stores/i18n/i18n";
import { StageEditorModel, UpdateStageRequestDTO } from "@/services/secured/stage-crud/stageCrud.types";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import { generateEntityId } from "@/utils/id/generateEntityId";
import "./styles.css";

export const Route = createFileRoute("/my/competitions/$id/")({
  component: CompetitionDetailPage,
});

function CompetitionDetailPage() {
  const i18n = useI18n();
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
    <span>{i18n.t("MY.COMPETITIONS.DETAIL.CREATING_COMPETITION")}</span>
  ) : (
    <CompetitionDetailContent id={params().id} />
  );
}

function CompetitionDetailContent(props: { id: string }) {
  const i18n = useI18n();
  const navigate = useNavigate();
  const { deleteCompetition, updateCompetition, getCompetition } =
    useCompetition();

  const competition = getCompetition(props.id);

  return (
    <div class="competition-detail">
      <Suspense
        fallback={
          <span>{i18n.t("MY.COMPETITIONS.DETAIL.LOADING_COMPETITION")}</span>
        }
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
        isCreatingStage={isCreatingStage()}
        isEditing={isEditing()}
        onCloseStageEditor={closeStageEditor}
        onDeleteStage={getOnDeleteStage()}
        onNavigateToStage={onNavigateToStage}
        onOpenNewStageEditor={openNewStageEditor}
        onOpenStageEditor={openStageEditor}
        onSaveStageEditor={saveStageEditor}
        onUpdateStageDialogDraft={updateStageDialogDraft}
        stages={sortedStages()}
      />
      <Show when={canEditCompetition(props.competition()?.status)}>
        <FloatingToggleCircle
          onClick={() => setIsEditing((current) => !current)}
          toggled={isEditing()}
          nonToggledText={i18n.t("MY.COMPETITIONS.DETAIL.EDIT")}
          toggledText={i18n.t("MY.COMPETITIONS.DETAIL.VIEW")}
          nonToggledIcon={pencilIcon}
          toggledIcon={eyeIcon}
        />
      </Show>
      <Show
        when={
          isEditing() && canDeleteCompetition(props.competition()?.status)
        }
      >
        <ConfirmActionButton text={title()} onConfirm={props.onDelete}>
          <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
            {i18n.t("MY.COMPETITIONS.DETAIL.DELETE")}
          </AtomButton>
        </ConfirmActionButton>
      </Show>
    </div>
  );
}
