import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createSignal,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import CompetitionInfo from "@/components/routes/my-competitions/$id/competition-info/CompetitionInfo";
import StagesSection from "@/components/routes/my-competitions/$id/stages-section/StagesSection";
import { useCompetition } from "@/services/api/competition_crud/competitionCrud";
import {
  type Competition,
  type PostCompetition,
} from "@/services/api/competition_crud/competitionCrudTypes";
import {
  type StageEditorModel,
  toApiStage,
  useApiStage,
} from "@/services/api/stage_api_crud/stageApiCrud";
import { parseOptionalNumber, toUndefinedIfBlank } from "@/utils/stage";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import FloatingCircle from "@/components/floating_circle/FloatingCircle";
import "./styles.css";

const EDIT_DEBOUNCE_MS = 400;

export const Route = createFileRoute("/my-competitions/$id/")({
  component: CompetitionDetailPage,
});

function CompetitionDetailPage() {
  const navigate = useNavigate();
  const params = useParams({ from: "/my-competitions/$id/" });
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
      to: "/my-competitions/$id",
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
                to: "/my-competitions/list",
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
  const [latitude, setLatitude] = createSignal(
    props.competition()?.location?.latitude?.toString() ?? "",
  );
  const [longitude, setLongitude] = createSignal(
    props.competition()?.location?.longitude?.toString() ?? "",
  );
  const [isCreatingStage, setIsCreatingStage] = createSignal(false);
  const [editingStageId, setEditingStageId] = createSignal<string | null>(null);
  const [stageDialogDraft, setStageDialogDraft] =
    createSignal<StageEditorModel | null>(null);

  createEffect(() => {
    if (isEditing()) return;
    const competition = props.competition();

    if (!competition) return;

    setTitle(competition.name);
    setCountry(competition.country);
    setDescription(competition.description ?? "");
    setAddress(competition.location?.address ?? "");
    setLatitude(competition.location?.latitude?.toString() ?? "");
    setLongitude(competition.location?.longitude?.toString() ?? "");
  });

  createEffect(() => {
    if (!isEditing()) return;
    const competition = props.competition();

    if (!competition) return;

    const nextCompetition: PostCompetition = {
      country: country(),
      description: description(),
      id: competition.id,
      location: {
        address: toUndefinedIfBlank(address()),
        latitude: parseOptionalNumber(latitude()),
        longitude: parseOptionalNumber(longitude()),
      },
      name: title(),
    };
    const hasChanges =
      nextCompetition.name !== competition.name ||
      nextCompetition.country !== competition.country ||
      nextCompetition.description !== (competition.description ?? "") ||
      nextCompetition.location?.address !==
        (competition.location?.address ?? "") ||
      nextCompetition.location?.latitude !== competition.location?.latitude ||
      nextCompetition.location?.longitude !== competition.location?.longitude;

    if (!hasChanges) return;

    const timeoutId = globalThis.setTimeout(() => {
      props.onUpdate(nextCompetition);
    }, EDIT_DEBOUNCE_MS);

    onCleanup(() => globalThis.clearTimeout(timeoutId));
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
        latitude={latitude()}
        longitude={longitude()}
        onAddressChange={setAddress}
        onCountryChange={setCountry}
        onDescriptionChange={setDescription}
        onLatitudeChange={setLatitude}
        onLongitudeChange={setLongitude}
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
        onDeleteStage={(stageId) => {
          if (editingStageId() === stageId) {
            closeStageEditor();
          }

          const competition = props.competition();

          if (!competition) return;

          deleteApiStage(stageId, competition.id);
        }}
        onNavigateToStage={(stageId) => {
          const competition = props.competition();

          if (!competition) return;

          void navigate({
            params: {
              id: competition.id,
              stageId,
            },
            to: "/my-competitions/$id/stages/$stageId",
          });
        }}
        onOpenNewStageEditor={openNewStageEditor}
        onOpenStageEditor={openStageEditor}
        onSaveStageEditor={saveStageEditor}
        onUpdateStageDialogDraft={updateStageDialogDraft}
        stages={props.competition()?.stages}
      />
      <FloatingCircle
        aria-label={isEditing() ? "--Close edit" : "--Edit competition"}
        onClick={() => setIsEditing((current) => !current)}
      >
        {isEditing() ? "--Close" : "--Edit"}
      </FloatingCircle>
      <Show when={isEditing()}>
        <AtomButton type="destructive" onClick={props.onDelete}>
          --Delete
        </AtomButton>
      </Show>
    </div>
  );
}
