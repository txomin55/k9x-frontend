import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/solid-router";
import { createEffect, createSignal, For, Index, onCleanup, Show, Suspense } from "solid-js";
import CountryFlag from "@/components/common/CountryFlag";
import { useCompetition } from "@/services/api/competition_crud/competitionCrud";
import {
  type Competition,
  type PostCompetition,
  type Stage
} from "@/services/api/competition_crud/competitionCrudTypes";
import { type StageEditorModel, useApiStage } from "@/services/api/stage_api_crud/stageApiCrud";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import "./styles.css";

const COUNTRY_OPTIONS = [
  { code: "pt", label: "Portugal" },
  { code: "es", label: "Spain" },
  { code: "fr", label: "France" },
  { code: "it", label: "Italy" },
  { code: "gb", label: "United Kingdom" },
];

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
            competition={competition()!}
            onDelete={() => {
              deleteCompetition(competition()!.id);
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
  competition: Competition;
  onDelete: () => void;
  onUpdate: (competition: PostCompetition) => void;
}) {
  const navigate = useNavigate();
  const {
    deleteApiStage,
    updateApiStage,
  } = useApiStage();
  const [isEditing, setIsEditing] = createSignal(false);
  const [title, setTitle] = createSignal(props.competition.name);
  const [country, setCountry] = createSignal(props.competition.country);
  const [description, setDescription] = createSignal(
    props.competition.description ?? "",
  );
  const [address, setAddress] = createSignal(
    props.competition.location?.address ?? "",
  );
  const [latitude, setLatitude] = createSignal(
    props.competition.location?.latitude?.toString() ?? "",
  );
  const [longitude, setLongitude] = createSignal(
    props.competition.location?.longitude?.toString() ?? "",
  );
  const [editingStageId, setEditingStageId] = createSignal<string | null>(null);
  const [stageDialogDraft, setStageDialogDraft] = createSignal<StageEditorModel | null>(
    null,
  );

  createEffect(() => {
    if (isEditing()) return;

    setTitle(props.competition.name);
    setCountry(props.competition.country);
    setDescription(props.competition.description ?? "");
    setAddress(props.competition.location?.address ?? "");
    setLatitude(props.competition.location?.latitude?.toString() ?? "");
    setLongitude(props.competition.location?.longitude?.toString() ?? "");
  });

  createEffect(() => {
    if (!isEditing()) return;

    const nextCompetition: PostCompetition = {
      country: country(),
      description: description(),
      id: props.competition.id,
      location: {
        address: toUndefinedIfBlank(address()),
        latitude: parseOptionalNumber(latitude()),
        longitude: parseOptionalNumber(longitude()),
      },
      name: title(),
    };
    const hasChanges =
      nextCompetition.name !== props.competition.name ||
      nextCompetition.country !== props.competition.country ||
      nextCompetition.description !== (props.competition.description ?? "") ||
      nextCompetition.location?.address !==
        (props.competition.location?.address ?? "") ||
      nextCompetition.location?.latitude !==
        props.competition.location?.latitude ||
      nextCompetition.location?.longitude !==
        props.competition.location?.longitude;

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

  const openStageEditor = (stage: Stage) => {
    setEditingStageId(stage.id);
    setStageDialogDraft(toApiStage(stage, props.competition.id));
  };

  const closeStageEditor = () => {
    setEditingStageId(null);
    setStageDialogDraft(null);
  };

  const saveStageEditor = () => {
    const draft = stageDialogDraft();

    if (!draft) return;

    updateApiStage(draft);
    closeStageEditor();
  };

  return (
    <div
      class="competition-detail__content"
      style={{
        display: "grid",
        gap: "1.25rem",
        "padding-bottom": "5rem",
        position: "relative",
      }}
    >
      <div class="competition-detail__content--header">
        <CountryFlag country={country()} alt={`${title()} flag`} />
        <Show
          when={isEditing()}
          fallback={
            <>
              <h1>{title()}</h1>
              <span>{props.competition.status}</span>
            </>
          }
        >
          <div
            style={{
              display: "grid",
              gap: "0.75rem",
              "max-width": "32rem",
            }}
          >
            <p>--Editing mode active.</p>
            <label for="competition-name">--Title</label>
            <input
              id="competition-name"
              name="name"
              type="text"
              value={title()}
              onInput={(event) => setTitle(event.currentTarget.value)}
            />
            <label for="competition-country">--Country</label>
            <select
              id="competition-country"
              name="country"
              value={country()}
              onChange={(event) => setCountry(event.currentTarget.value)}
            >
              <For each={COUNTRY_OPTIONS}>
                {(countryOption) => (
                  <option value={countryOption.code}>
                    {countryOption.label}
                  </option>
                )}
              </For>
            </select>
            <label for="competition-description">--Description</label>
            <textarea
              id="competition-description"
              name="description"
              value={description()}
              onInput={(event) => setDescription(event.currentTarget.value)}
            />
            <label for="competition-address">--Address</label>
            <input
              id="competition-address"
              name="address"
              type="text"
              value={address()}
              onInput={(event) => setAddress(event.currentTarget.value)}
            />
            <label for="competition-latitude">--Latitude</label>
            <input
              id="competition-latitude"
              name="latitude"
              type="number"
              inputMode="decimal"
              step="any"
              value={latitude()}
              onInput={(event) => setLatitude(event.currentTarget.value)}
            />
            <label for="competition-longitude">--Longitude</label>
            <input
              id="competition-longitude"
              name="longitude"
              type="number"
              inputMode="decimal"
              step="any"
              value={longitude()}
              onInput={(event) => setLongitude(event.currentTarget.value)}
            />
          </div>
        </Show>
      </div>
      <Show when={!isEditing() && description()}>
        <p>{description()}</p>
      </Show>
      <Show when={props.competition.location?.address}>
        <p>{props.competition.location?.address}</p>
      </Show>
      <Show
        when={
          props.competition.location?.latitude !== undefined ||
          props.competition.location?.longitude !== undefined
        }
      >
        <p>
          {`${props.competition.location?.latitude ?? "--"} / ${props.competition.location?.longitude ?? "--"}`}
        </p>
      </Show>
      <div
        style={{
          display: "flex",
          "justify-content": "space-between",
          "align-items": "center",
          gap: "1rem",
        }}
      >
        <h2>--Stages</h2>
        <Show when={isEditing()}>
          <button
            type="button"
            aria-label="--Add stage"
            onClick={() =>
              void navigate({
                params: { id: props.competition.id, stageId: "new" },
                to: "/my-competitions/$id/stages/$stageId",
              })
            }
            style={iconButtonStyle}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </button>
        </Show>
      </div>
      <div class="competition-detail__content--stages">
        <Index each={props.competition.stages ?? []}>
          {(stage) => (
            <Show
              when={isEditing()}
              fallback={
                <Show
                  when={stage().id}
                  fallback={
                    <div
                      class="competition-detail__content--stage"
                      style={stageCardStyle}
                    >
                      <strong>{stage().name}</strong>
                      <p>{formatStageDateRange(stage())}</p>
                    </div>
                  }
                >
                  {(stageId) => (
                    <Link
                      class="competition-detail__content--stage"
                      params={{ id: props.competition.id, stageId: stageId() }}
                      style={stageCardStyle}
                      to="/my-competitions/$id/stages/$stageId"
                    >
                      <strong>{stage().name}</strong>
                      <p>{formatStageDateRange(stage())}</p>
                    </Link>
                  )}
                </Show>
              }
            >
              <div
                class="competition-detail__content--stage"
                style={{
                  ...stageCardStyle,
                  display: "grid",
                  gap: "0.75rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    gap: "1rem",
                  }}
                >
                  <strong>--Stage</strong>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                    }}
                  >
                    <AtomDialog
                      closeButtonText="Close dialog"
                      content={
                        <Show when={stageDialogDraft()}>
                          {(draft) => (
                            <div
                              style={{
                                display: "grid",
                                gap: "0.75rem",
                              }}
                            >
                              <label for={`stage-dialog-name-${draft().id}`}>
                                --Stage title
                              </label>
                              <input
                                id={`stage-dialog-name-${draft().id}`}
                                type="text"
                                value={draft().name}
                                onInput={(event) =>
                                  setStageDialogDraft((current) =>
                                    current
                                      ? {
                                          ...current,
                                          name: event.currentTarget.value,
                                        }
                                      : current,
                                  )
                                }
                              />
                              <label for={`stage-dialog-date-from-${draft().id}`}>
                                --Date from
                              </label>
                              <input
                                id={`stage-dialog-date-from-${draft().id}`}
                                type="date"
                                value={toDateInputValue(draft().dateFrom)}
                                onInput={(event) =>
                                  setStageDialogDraft((current) =>
                                    current
                                      ? {
                                          ...current,
                                          dateFrom: parseDateInputValue(
                                            event.currentTarget.value,
                                            current.dateFrom,
                                          ),
                                        }
                                      : current,
                                  )
                                }
                              />
                              <label for={`stage-dialog-date-to-${draft().id}`}>
                                --Date to
                              </label>
                              <input
                                id={`stage-dialog-date-to-${draft().id}`}
                                type="date"
                                value={toDateInputValue(draft().dateTo)}
                                onInput={(event) =>
                                  setStageDialogDraft((current) =>
                                    current
                                      ? {
                                          ...current,
                                          dateTo: parseDateInputValue(
                                            event.currentTarget.value,
                                            current.dateTo,
                                          ),
                                        }
                                      : current,
                                  )
                                }
                              />
                              <div
                                style={{
                                  display: "flex",
                                  gap: "0.75rem",
                                  "justify-content": "flex-end",
                                }}
                              >
                                <AtomButton onClick={closeStageEditor}>
                                  --Cancel
                                </AtomButton>
                                <AtomButton onClick={saveStageEditor}>
                                  --Save
                                </AtomButton>
                              </div>
                            </div>
                          )}
                        </Show>
                      }
                      modal
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
                      title={`--Edit ${stage().name || "stage"}`}
                      trigger={
                        <span style={iconButtonStyle}>
                          <svg
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                          <span style={visuallyHiddenStyle}>
                            {`--Edit ${stage().name || "stage"}`}
                          </span>
                        </span>
                      }
                    />
                    <button
                      type="button"
                      aria-label={`--Delete ${stage().name}`}
                      onClick={() => {
                        if (editingStageId() === stage().id) {
                          closeStageEditor();
                        }

                        deleteApiStage(stage().id, props.competition.id);
                      }}
                      style={iconButtonStyle}
                    >
                      <svg
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M8 6V4h8v2" />
                        <path d="M19 6v14H5V6" />
                        <path d="M10 11v6" />
                        <path d="M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
                <strong>{stage().name || "--No name"}</strong>
                <p>{formatStageDateRange(stage())}</p>
              </div>
            </Show>
          )}
        </Index>
      </div>
      <Show when={isEditing()}>
        <button
          type="button"
          aria-label={isEditing() ? "--Close edit" : "--Edit competition"}
          onClick={() => setIsEditing((current) => !current)}
          style={{
            ...iconButtonStyle,
            bottom: "5.75rem",
            "box-shadow": "0 0.75rem 1.75rem rgba(0, 0, 0, 0.15)",
            height: "3.5rem",
            position: "fixed",
            right: "1.5rem",
            width: "3.5rem",
            "z-index": "10",
          }}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </Show>
      <Show when={!isEditing()}>
        <button
          type="button"
          aria-label="--Edit competition"
          onClick={() => setIsEditing(true)}
          style={{
            ...iconButtonStyle,
            bottom: "1.5rem",
            "box-shadow": "0 0.75rem 1.75rem rgba(0, 0, 0, 0.15)",
            height: "3.5rem",
            position: "fixed",
            right: "1.5rem",
            width: "3.5rem",
            "z-index": "10",
          }}
        >
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </Show>
      <Show when={isEditing()}>
        <AtomButton type="destructive" onClick={props.onDelete}>
          --Delete
        </AtomButton>
      </Show>
    </div>
  );
}

const stageCardStyle = {
  border: "1px solid rgba(0, 0, 0, 0.12)",
  "border-radius": "1rem",
  color: "inherit",
  padding: "1rem",
  "text-decoration": "none",
};

const iconButtonStyle = {
  "align-items": "center",
  background: "white",
  border: "1px solid rgba(0, 0, 0, 0.12)",
  "border-radius": "999px",
  cursor: "pointer",
  display: "inline-flex",
  "justify-content": "center",
  width: "2.5rem",
  height: "2.5rem",
};

const visuallyHiddenStyle = {
  border: "0",
  clip: "rect(0 0 0 0)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
};

function toApiStage(stage: Stage, competitionId: string): StageEditorModel {
  return {
    competitionId,
    dateFrom: stage.dateFrom,
    dateTo: stage.dateTo,
    events: stage.events,
    id: stage.id,
    name: stage.name,
  };
}

function formatStageDateRange(stage: Stage) {
  return `${new Date(stage.dateFrom).toDateString()} - ${new Date(stage.dateTo).toDateString()}`;
}

function toUndefinedIfBlank(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

function parseOptionalNumber(value: string) {
  const trimmedValue = value.trim();

  if (!trimmedValue) return undefined;

  const parsedValue = Number(trimmedValue);

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function toDateInputValue(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function parseDateInputValue(value: string, fallback: number) {
  if (!value) return fallback;
  return new Date(`${value}T00:00:00`).getTime();
}
