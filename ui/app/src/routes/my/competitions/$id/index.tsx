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
  Show,
  Suspense,
} from "solid-js";
import CompetitionInfo from "@/components/routes/my/competitions/$id/competition-info/CompetitionInfo";
import StagesSection from "@/components/routes/my/competitions/$id/stages-section/StagesSection";
import { useCompetition } from "@/services/api/competition-crud/competitionCrud";
import {
  type Competition,
  type PostCompetition,
} from "@/services/api/competition-crud/competitionCrud.types";
import {
  type StageEditorModel,
  toApiStage,
  useApiStage,
} from "@/services/api/stage-api-crud/stageApiCrud";
import { toUndefinedIfBlank } from "@/utils/stage";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import "./styles.css";

export const Route = createFileRoute("/my/competitions/$id/")({
  component: CompetitionDetailPage,
});

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
    <span>--Creating competition</span>
  ) : (
    <CompetitionDetailContent id={params().id} />
  );
}

function CompetitionDetailContent(props: { id: string }) {
  const navigate = useNavigate();
  const { deleteCompetition, updateCompetition, getCompetition } =
    useCompetition();

  const competition = getCompetition(props.id);

  return (
    <div class="competition-detail">
      <Suspense fallback={<span>--Loading competition</span>}>
        <Show when={competition()} fallback={<p>--Competition not found.</p>}>
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
  competition: Accessor<Competition | undefined>;
  onDelete: () => void;
  onUpdate: (competition: PostCompetition) => void;
}) {
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
    props.competition()?.location?.address ?? "",
  );
  const [isCreatingStage, setIsCreatingStage] = createSignal(false);
  const [editingStageId, setEditingStageId] = createSignal<string | null>(null);
  const [stageDialogDraft, setStageDialogDraft] =
    createSignal<StageEditorModel | null>(null);
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
    setAddress(competition.location?.address ?? "");
  });

  createEffect(() => {
    if (isEditing()) return;

    closeStageEditor();
  });

  const openStageEditor = (
    stage: NonNullable<Competition["stages"]>[number],
  ) => {
    const competition = props.competition();

    if (!competition) return;

    setIsCreatingStage(false);
    setEditingStageId(stage.id);
    setStageDialogDraft(toApiStage(stage, competition.id));
  };

  const openNewStageEditor = () => {
    const competition = props.competition();

    if (!competition) return;

    const draft = createDefaultApiStage(competition.id);

    setIsCreatingStage(true);
    setEditingStageId(draft.id ?? null);
    setStageDialogDraft({
      competitionId: draft.competitionId ?? competition.id,
      dateFrom: draft.dateFrom ?? Date.now(),
      dateTo: draft.dateTo ?? Date.now(),
      events: [],
      id: draft.id ?? globalThis.crypto.randomUUID(),
      name: draft.name ?? "",
    });
  };

  const closeStageEditor = () => {
    setIsCreatingStage(false);
    setEditingStageId(null);
    setStageDialogDraft(null);
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
      updateApiStage(draft);
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

    const nextCompetition: PostCompetition = {
      country: country(),
      description: description(),
      id: competition.id,
      location: {
        address: toUndefinedIfBlank(address()),
      },
      name: title(),
    };
    const hasChanges =
      nextCompetition.name !== competition.name ||
      nextCompetition.country !== competition.country ||
      nextCompetition.description !== (competition.description ?? "") ||
      nextCompetition.location?.address !==
        (competition.location?.address ?? "");

    if (!hasChanges) return;

    props.onUpdate(nextCompetition);
  };

  return (
    <div class="competition-detail">
      <CompetitionInfo
        address={address()}
        country={country()}
        description={description()}
        displayAddress={props.competition()?.location?.address}
        displayDescription={props.competition()?.description}
        displayLatitude={props.competition()?.location?.latitude}
        displayLongitude={props.competition()?.location?.longitude}
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
        onDeleteStage={getOnDeleteStage}
        onNavigateToStage={onNavigateToStage}
        onOpenNewStageEditor={openNewStageEditor}
        onOpenStageEditor={openStageEditor}
        onSaveStageEditor={saveStageEditor}
        onUpdateStageDialogDraft={updateStageDialogDraft}
        stages={sortedStages()}
      />
      <FloatingToggleCircle
        onClick={() => setIsEditing((current) => !current)}
        toggled={isEditing()}
        nonToggledText="--Edit"
        toggledText="--Save"
      />
      <Show when={isEditing()}>
        <ConfirmActionButton text={title()} onConfirm={props.onDelete}>
          <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>--Delete</AtomButton>
        </ConfirmActionButton>
      </Show>
    </div>
  );
}
