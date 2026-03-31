import {createFileRoute, useNavigate, useParams,} from "@tanstack/solid-router";
import {type Accessor, createEffect, createSignal, Index, onCleanup, Show, Suspense,} from "solid-js";
import CountryFlag from "@/components/common/CountryFlag";
import StageDialog from "@/components/routes/my-competitions/$id/stage-dialog/StageDialog";
import {useCompetition} from "@/services/api/competition_crud/competitionCrud";
import {type Competition, type PostCompetition,} from "@/services/api/competition_crud/competitionCrudTypes";
import {type StageEditorModel, toApiStage, useApiStage,} from "@/services/api/stage_api_crud/stageApiCrud";
import {formatStageDateRange, parseOptionalNumber, toUndefinedIfBlank,} from "@/utils/stage";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";
import FloatingCircle from "@/components/floating_circle/FloatingCircle";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import "./styles.css";
import Card from "@lib/components/molecules/card/Card";

const COUNTRY_OPTIONS = [
  { code: "pt", label: "Portugal" },
  { code: "es", label: "Spain" },
  { code: "fr", label: "France" },
  { code: "it", label: "Italy" },
  { code: "gb", label: "United Kingdom" },
];

const COUNTRY_SELECT_OPTIONS = COUNTRY_OPTIONS.map((countryOption) => ({
  label: countryOption.label,
  value: countryOption.code,
}));

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

  const selectedCountryOption = () =>
    COUNTRY_SELECT_OPTIONS.find(
      (countryOption) => countryOption.value === country(),
    ) ?? null;

  return (
    <div class="competition-detail">
      <div class="competition-detail__content--info">
        <CountryFlag country={country()} alt={`${title()} flag`} />
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{title()}</h1>
              <span>--Status: {props.competition()?.status}</span>
            </>
          }
        >
          <div>
            <p>--Editing mode active.</p>
            <AtomInput
              label="--Title"
              name="name"
              value={title()}
              onChange={setTitle}
            />
            <AtomSelect
              label="--Country"
              onChange={(value) => setCountry(value?.value ?? "")}
              options={COUNTRY_SELECT_OPTIONS}
              value={selectedCountryOption()}
            />
            <AtomTextArea
              label="--Description"
              name="description"
              value={description()}
              onChange={setDescription}
            />
            <AtomInput
              label="--Address"
              name="address"
              value={address()}
              onChange={setAddress}
            />
            <AtomNumberInput
              label="--Latitude"
              name="latitude"
              value={latitude()}
              onChange={setLatitude}
            />
            <AtomNumberInput
              label="--Longitude"
              name="longitude"
              value={longitude()}
              onChange={setLongitude}
            />
          </div>
        </Show>
      </div>
      <Show when={!isEditing() && description()}>
        <p>{description()}</p>
      </Show>
      <Show when={props.competition()?.location?.address}>
        <p>{props.competition()?.location?.address}</p>
      </Show>
      <Show
        when={
          props.competition()?.location?.latitude !== undefined ||
          props.competition()?.location?.longitude !== undefined
        }
      >
        <p>
          {`${props.competition()?.location?.latitude ?? "--"} / ${props.competition()?.location?.longitude ?? "--"}`}
        </p>
      </Show>
      <div class="competition-detail__content--stage-title">
        <h2>--Stages</h2>
        <Show when={isEditing()}>
          <CircleButton aria-label="--Add stage" onClick={openNewStageEditor}>
            +
          </CircleButton>
          <AtomDialog
            closeButtonText="--Close dialog"
            content={
              <StageDialog
                draft={stageDialogDraft}
                onCancel={closeStageEditor}
                onDraftChange={updateStageDialogDraft}
                onSave={saveStageEditor}
              />
            }
            onOpenChange={(isOpen) => {
              if (!isOpen && isCreatingStage()) {
                closeStageEditor();
              }
            }}
            open={isCreatingStage()}
            title="--New stage"
            trigger={<span />}
          />
        </Show>
      </div>
      <div class="competition-detail__content--stages">
        <Index each={props.competition()?.stages ?? []}>
          {(stage) => (
            <Card
              topLeft={stage().name}
              subHeader={<p>{formatStageDateRange(stage())}</p>}
              actions={
                <>
                  <Show when={isEditing()}>
                    <>
                      <AtomDialog
                        closeButtonText="--Close dialog"
                        content={
                          <StageDialog
                            draft={stageDialogDraft}
                            onCancel={closeStageEditor}
                            onDraftChange={updateStageDialogDraft}
                            onSave={saveStageEditor}
                          />
                        }
                        onOpenChange={(isOpen) => {
                          if (isOpen) {
                            openStageEditor(stage());
                            return;
                          }

                          if (editingStageId() === stage().id) {
                            closeStageEditor();
                          }
                        }}
                        open={editingStageId() === stage().id}
                        title={`--Edit ${stage().name}`}
                        trigger={<span>{`--Edit`}</span>}
                      />
                      <CircleButton
                        aria-label={`--Delete ${stage().name}`}
                        onClick={() => {
                          if (editingStageId() === stage().id) {
                            closeStageEditor();
                          }

                          const competition = props.competition();

                          if (!competition) return;

                          deleteApiStage(stage().id, competition.id);
                        }}
                      >
                        -
                      </CircleButton>
                    </>
                  </Show>
                  <Show when={!isEditing()}>
                    <AtomButton
                      onClick={() => {
                        const competition = props.competition();

                        if (!competition) return;

                        void navigate({
                          params: {
                            id: competition.id,
                            stageId: stage().id,
                          },
                          to: "/my-competitions/$id/stages/$stageId",
                        });
                      }}
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
