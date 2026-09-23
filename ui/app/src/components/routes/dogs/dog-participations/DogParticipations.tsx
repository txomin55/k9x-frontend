import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { Link } from "@tanstack/solid-router";
import obdxLogo from "@/assets/disciplines/obdx.svg";
import { For, Show, Suspense } from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import PositionMedal from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/position-medal/PositionMedal";
import { usePublicDogParticipations } from "@/services/fetch-dogs/fetchDogs";
import type {
  DogParticipation,
  DogParticipationYear,
} from "@/services/fetch-dogs/fetchDogs.types";
import { useI18n } from "@/stores/i18n/i18n";
import { formatUtcDateOnly } from "@/utils/date";
import "./styles.css";

export type DogParticipationsProps = {
  identification: string;
};

/** How many year boxes the skeleton reserves: one per column on a laptop. */
const SKELETON_YEARS = 2;
const SKELETON_ROWS = 3;

/**
 * Years alternate between two independent columns (newest left, the next one right, and so on), so opening a
 * year only pushes down the years below it in its own column instead of leaving a hole beside it.
 */
const COLUMNS = [0, 1] as const;

const formatScore = (score: number) => Math.round(score * 100) / 100;

/** The podium places, which the classification draws as a rosette instead of a number. */
const medalOf = (position: number | null): 1 | 2 | 3 | undefined =>
  position === 1 || position === 2 || position === 3 ? position : undefined;

/**
 * The dog's events by year, newest first, one collapsible per year with the latest one open. The query is
 * created and read here, under its own `<Suspense>`, so waiting for it never holds back the rest of the page.
 */
export default function DogParticipations(props: DogParticipationsProps) {
  return (
    <Suspense fallback={<DogParticipationsSkeleton />}>
      <DogParticipationsContent identification={props.identification} />
    </Suspense>
  );
}

function DogParticipationsSkeleton() {
  return (
    <div class="dog-participations" aria-busy="true">
      <For each={Array.from({ length: SKELETON_YEARS })}>
        {() => (
          <div class="dog-participations__column">
            <AtomCollapsible
              open
              trigger={<AtomSkeleton width="4rem" />}
              content={
                <ul class="dog-participations__list">
                  <For each={Array.from({ length: SKELETON_ROWS })}>
                    {() => (
                      <li class="dog-participations__item">
                        <div class="dog-participations__link">
                          <AtomSkeleton
                            variant="circular"
                            width="var(--unit-4)"
                            height="var(--unit-4)"
                          />
                          <span class="dog-participations__main">
                            <AtomSkeleton width="70%" />
                            <AtomSkeleton width="40%" />
                          </span>
                          <AtomSkeleton width="3rem" />
                        </div>
                      </li>
                    )}
                  </For>
                </ul>
              }
            />
          </div>
        )}
      </For>
    </div>
  );
}

function DogParticipationsContent(props: DogParticipationsProps) {
  const i18n = useI18n();
  const query = usePublicDogParticipations(() => props.identification);
  const years = () => query.data ?? [];

  return (
    <Show
      when={years().length}
      fallback={
        <p class="dog-participations__empty text-body-sm">
          {i18n.t("DOGS.DETAIL.PARTICIPATIONS_EMPTY")}
        </p>
      }
    >
      <div class="dog-participations">
        <For each={COLUMNS}>
          {(column) => (
            <div class="dog-participations__column">
              <For each={years()}>
                {(year, index) => (
                  <Show when={index() % COLUMNS.length === column}>
                    <YearCollapsible
                      identification={props.identification}
                      year={year}
                      index={index()}
                    />
                  </Show>
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}

/**
 * `order` is only read on a phone, where the columns dissolve into one list: it puts the years back in
 * chronological order instead of left column first.
 */
function YearCollapsible(props: {
  identification: string;
  year: DogParticipationYear;
  index: number;
}) {
  return (
    <div class="dog-participations__year-box" style={{ order: props.index }}>
      <AtomCollapsible
        defaultOpen={props.index === 0}
        trigger={
          <span class="dog-participations__year">
            <span>{props.year.year}</span>
            <span class="text-caption-sm">
              ({props.year.participations.length})
            </span>
          </span>
        }
        content={
          <ul class="dog-participations__list">
            <For each={props.year.participations}>
              {(participation) => (
                <ParticipationRow
                  identification={props.identification}
                  participation={participation}
                />
              )}
            </For>
          </ul>
        }
      />
    </div>
  );
}

/** The whole row opens that event's classification with this dog pinned on top of the full list. */
function ParticipationRow(props: {
  identification: string;
  participation: DogParticipation;
}) {
  const i18n = useI18n();
  const position = () => props.participation.position;

  return (
    <li class="dog-participations__item">
      <Link
        class="dog-participations__link"
        to="/stages/$id/events/$eventId/classification"
        params={{
          id: props.participation.stageId,
          eventId: props.participation.event.id,
        }}
        search={{ pinned: props.identification }}
      >
        <span
          class="dog-participations__position text-heading-xs"
          title={i18n.t("DOGS.DETAIL.PARTICIPATIONS_POSITION")}
        >
          <Show
            when={medalOf(position())}
            fallback={position() == null ? "—" : `${position()}º`}
          >
            {(medal) => <PositionMedal position={medal()} />}
          </Show>
        </span>
        <span class="dog-participations__main">
          <span class="dog-participations__event text-body-sm">
            {props.participation.event.name}
          </span>
          <span class="dog-participations__meta text-caption-sm">
            <Show when={props.participation.country}>
              {(country) => (
                <CountryFlag country={country().id} alt={country().name} />
              )}
            </Show>
            <span>{formatUtcDateOnly(props.participation.date)}</span>
          </span>
        </span>
        <span class="dog-participations__scores">
          <Show
            when={!props.participation.restricted}
            fallback={
              <span class="text-caption-sm">
                {i18n.t("DOGS.DETAIL.PARTICIPATIONS_RESTRICTED")}
              </span>
            }
          >
            <Show
              when={props.participation.position != null}
              fallback={
                <span class="text-caption-sm">
                  {i18n.t("DOGS.DETAIL.PARTICIPATIONS_PENDING")}
                </span>
              }
            >
              <span class="text-body-sm">
                {props.participation.totalScore == null
                  ? "—"
                  : formatScore(props.participation.totalScore)}{" "}
                <span class="text-caption-sm">
                  {i18n.t("DOGS.DETAIL.PARTICIPATIONS_POINTS")}
                </span>
              </span>
              <span class="dog-participations__obdx text-caption-sm">
                {props.participation.obdxPoints == null
                  ? "—"
                  : formatScore(props.participation.obdxPoints)}
                <img
                  class="dog-participations__obdx-logo"
                  src={obdxLogo}
                  alt={i18n.t("DOGS.DETAIL.PARTICIPATIONS_OBDX_POINTS")}
                  title={i18n.t("DOGS.DETAIL.PARTICIPATIONS_OBDX_POINTS")}
                />
              </span>
            </Show>
          </Show>
        </span>
      </Link>
    </li>
  );
}
