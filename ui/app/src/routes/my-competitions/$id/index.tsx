import { createFileRoute, useNavigate, useParams } from "@tanstack/solid-router";
import { createEffect, createMemo, For, Show, Suspense } from "solid-js";
import { createDefaultCompetition, useCompetition } from "@/services/competition_crud/competitionCrud";

const COUNTRY_OPTIONS = [
  { code: "pt", label: "Portugal" },
  { code: "es", label: "Spain" },
  { code: "fr", label: "France" },
  { code: "it", label: "Italy" },
  { code: "gb", label: "United Kingdom" },
];

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
  const { deleteCompetition, getCompetition, updateCompetition } = useCompetition();
  const fetchedCompetition = getCompetition(props.id, {
    gcTime: 5 * 60 * 1000,
    refetchOnMount: false,
    staleTime: 30 * 1000,
  });
  const competition = createMemo(() => fetchedCompetition.data);

  const normalizedCountry = (country) => country?.trim().toLowerCase();

  return (
    <div class="competition-detail">
      <Suspense fallback={<span>--Loading competition</span>}>
        <Show when={competition()} fallback={<p>--Competition not found.</p>}>
          {(competition) => (
            <div class="competition-detail__content">
              <div class="competition-detail__content--header">
                <Suspense fallback={<span>--N/A</span>}>
                  <span
                    class={`fi fi-${normalizedCountry(competition().country)}`}
                  />
                </Suspense>
                <h1>{competition().name}</h1>
                <span>{competition().status}</span>
              </div>
              <form>
                <div>
                  <label for="competition-name">Name</label>
                  <input
                    id="competition-name"
                    name="name"
                    type="text"
                    value={competition().name}
                    onChange={(event) =>
                      updateCompetition({
                        ...competition(),
                        name: event.currentTarget.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label for="competition-country">Country</label>
                  <select
                    id="competition-country"
                    name="country"
                    value={competition().country}
                    onChange={(event) =>
                      updateCompetition({
                        ...competition(),
                        country: event.currentTarget.value,
                      })
                    }
                  >
                    <For each={COUNTRY_OPTIONS}>
                      {(country) => (
                        <option value={country.code}>{country.label}</option>
                      )}
                    </For>
                  </select>
                </div>
                <div>
                  <label for="competition-description">Description</label>
                  <textarea
                    id="competition-description"
                    name="description"
                    value={competition().description ?? ""}
                    onChange={(event) =>
                      updateCompetition({
                        ...competition(),
                        description: event.currentTarget.value,
                      })
                    }
                  />
                </div>
              </form>
              <p>{competition().description}</p>
              <Show when={competition().location?.address}>
                <p>{competition().location?.address}</p>
              </Show>
              <button
                type="button"
                onClick={() => {
                  deleteCompetition(competition().id);
                  void navigate({
                    to: "/my-competitions/list",
                  });
                }}
              >
                --Delete
              </button>
              <div class="competition-detail__content--stages">
                <For each={competition().stages ?? []}>
                  {(stage) => (
                    <div class="competition-detail__content--stage">
                      <strong>{stage.name}</strong>
                      <p>
                        {`${new Date(stage.dateFrom).toDateString()} - ${new Date(stage.dateTo).toDateString()}`}
                      </p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </Show>
      </Suspense>
    </div>
  );
}
