import {
  createFileRoute,
  Link,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  Show,
  Suspense,
} from "solid-js";
import CountryFlag from "@/components/common/CountryFlag";
import {
  createDefaultCompetition,
  useCompetition,
} from "@/services/competition_crud/competitionCrud";
import type { Competition } from "@/services/competition_crud/competitionCrudTypes";
import { useCompetitions } from "@/services/fetch_competitions/fetchCompetitions";
import AtomButton from "@lib/components/atoms/button/AtomButton";

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
  const competitionCrud = useCompetition();
  let hasCreatedDraftCompetition = false;

  createEffect(() => {
    if (params().id !== "new" || hasCreatedDraftCompetition) return;

    hasCreatedDraftCompetition = true;
    const draftCompetition = createDefaultCompetition();

    competitionCrud.createCompetition(draftCompetition);
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
  const { deleteCompetition, updateCompetition } = useCompetition();
  const fetchedCompetitions = useCompetitions({
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    staleTime: 30 * 1000,
  });
  const competition = createMemo(() =>
    fetchedCompetitions.data?.find((entry) => entry.id === props.id),
  );

  return (
    <div class="competition-detail">
      <Suspense fallback={<span>--Loading competition</span>}>
        <Show when={competition()} fallback={<p>--Competition not found.</p>}>
          {(competition) => (
            <CompetitionDetailBody
              competition={competition()}
              onDelete={() => {
                deleteCompetition(competition().id);
                void navigate({
                  to: "/my-competitions/list",
                });
              }}
              onUpdate={updateCompetition}
            />
          )}
        </Show>
      </Suspense>
    </div>
  );
}

function CompetitionDetailBody(props: {
  competition: Competition;
  onDelete: () => void;
  onUpdate: (competition: Competition) => void;
}) {
  const [isEditing, setIsEditing] = createSignal(false);
  const [title, setTitle] = createSignal(props.competition.name);
  const [country, setCountry] = createSignal(props.competition.country);
  const [description, setDescription] = createSignal(
    props.competition.description ?? "",
  );

  createEffect(() => {
    setTitle(props.competition.name);
    setCountry(props.competition.country);
    setDescription(props.competition.description ?? "");
  });

  createEffect(() => {
    if (!isEditing()) return;

    const nextCompetition = {
      ...props.competition,
      country: country(),
      description: description(),
      name: title(),
    };
    const hasChanges =
      nextCompetition.name !== props.competition.name ||
      nextCompetition.country !== props.competition.country ||
      nextCompetition.description !== (props.competition.description ?? "");

    if (!hasChanges) return;

    const timeoutId = globalThis.setTimeout(() => {
      props.onUpdate(nextCompetition);
    }, EDIT_DEBOUNCE_MS);

    onCleanup(() => globalThis.clearTimeout(timeoutId));
  });

  return (
    <div class="competition-detail__content">
      <div class="competition-detail__content--header">
        <button
          type="button"
          aria-label="--Edit competition"
          onClick={() => setIsEditing((current) => !current)}
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
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
          <div>
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
          </div>
        </Show>
      </div>
      <Show when={!isEditing() && description()}>
        <p>{description()}</p>
      </Show>
      <Show when={props.competition.location?.address}>
        <p>{props.competition.location?.address}</p>
      </Show>
      <div class="competition-detail__content--stages">
        <For each={props.competition.stages ?? []}>
          {(stage) => (
            <Show
              when={stage.id}
              fallback={
                <div class="competition-detail__content--stage">
                  <strong>{stage.name}</strong>
                  <p>
                    {`${new Date(stage.dateFrom).toDateString()} - ${new Date(stage.dateTo).toDateString()}`}
                  </p>
                </div>
              }
            >
              {(stageId) => (
                <Link
                  class="competition-detail__content--stage"
                  params={{ id: props.competition.id, stageId: stageId() }}
                  to="/my-competitions/$id/stages/$stageId"
                >
                  <strong>{stage.name}</strong>
                  <p>
                    {`${new Date(stage.dateFrom).toDateString()} - ${new Date(stage.dateTo).toDateString()}`}
                  </p>
                </Link>
              )}
            </Show>
          )}
        </For>
      </div>
      <AtomButton type="destructive" onClick={props.onDelete}>
        --Delete
      </AtomButton>
    </div>
  );
}
