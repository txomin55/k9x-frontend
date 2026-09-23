import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import { createFileRoute } from "@tanstack/solid-router";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  Suspense,
  type JSX,
} from "solid-js";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import Page from "@/components/common/page/Page";
import PageSeo from "@/components/common/page-seo/PageSeo";
import SexIcon from "@/components/common/sex-icon/SexIcon";
import DogK9xIndex from "@/components/routes/dogs/dog-k9x-index/DogK9xIndex";
import DogParticipations from "@/components/routes/dogs/dog-participations/DogParticipations";
import {
  prefetchPublicDogIndex,
  prefetchPublicDogParticipations,
  usePublicDog,
} from "@/services/fetch-dogs/fetchDogs";
import type { PublicDogDetail } from "@/services/fetch-dogs/fetchDogs.types";
import { useI18n } from "@/stores/i18n/i18n";
import { formatDateTime } from "@/utils/date";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import "./styles.css";

export const Route = createFileRoute("/dogs/$identification/")({
  component: PublicDogDetailRoute,
});

type Fact = { label: string; value: JSX.Element };

const DOG_DETAIL_TAB_PARAM = "tab";

const DOG_DETAIL_TABS = {
  BIO: "BIO",
  PARTICIPATIONS: "PARTICIPATIONS",
  K9X: "K9X",
} as const;

const TAB_VALUES: string[] = Object.values(DOG_DETAIL_TABS);

/** How many fact rows the real page shows, so the skeleton reserves the same grid. */
const FACT_COUNT = 10;

/**
 * The route component reads no query of its own: reading `.data` is what suspends, and a read owned by
 * the route is captured by the `<Outlet>` boundary, which blanks the whole page instead of showing this
 * skeleton. So the query is created *and* read inside the child below, under this local `<Suspense>`.
 *
 * The participations and the K9X index are only prefetched here — nothing reads them — so they load alongside the dog without
 * holding up its page, and the tab that shows them reads them under a boundary of its own.
 */
function PublicDogDetailRoute() {
  const params = Route.useParams();
  createEffect(() => {
    prefetchPublicDogParticipations(params().identification);
    prefetchPublicDogIndex(params().identification);
  });

  return (
    <Suspense
      fallback={
        <Page>
          <PublicDogDetailSkeleton />
        </Page>
      }
    >
      <PublicDogDetailPage />
    </Suspense>
  );
}

/**
 * The sections are a segmented control rather than tabs so the switcher fits a phone as well as a laptop. The
 * selected one lives in the URL, so a shared link opens the same section.
 */
function DogDetailTabs(props: { bio: JSX.Element }) {
  const i18n = useI18n();
  const params = Route.useParams();
  const [tabParam, setTabParam] = useSearchParam(
    DOG_DETAIL_TAB_PARAM,
    DOG_DETAIL_TABS.BIO,
  );
  const selectedTab = () =>
    TAB_VALUES.includes(tabParam()) ? tabParam() : DOG_DETAIL_TABS.BIO;

  const controls = createMemo(() => [
    {
      value: DOG_DETAIL_TABS.BIO,
      text: i18n.t("DOGS.DETAIL.TAB_BIO"),
      content: () => props.bio,
    },
    {
      value: DOG_DETAIL_TABS.PARTICIPATIONS,
      text: i18n.t("DOGS.DETAIL.TAB_PARTICIPATIONS"),
      // Built as an element, not a thunk: the segmented control renders a thunk inside its Switch/Match, and
      // a query that suspends in there (even under its own <Suspense>) re-renders forever and freezes the tab.
      content: <DogParticipations identification={params().identification} />,
    },
    {
      value: DOG_DETAIL_TABS.K9X,
      text: i18n.t("DOGS.DETAIL.TAB_K9X"),
      // An element for the same reason as the participations.
      content: <DogK9xIndex identification={params().identification} />,
    },
  ]);

  return (
    <AtomSegmentedControl
      title={i18n.t("DOGS.DETAIL.SECTIONS")}
      control={selectedTab()}
      onControlChange={setTabParam}
      controls={controls()}
    />
  );
}

/**
 * Reuses the real page's boxes so swapping in the data shifts no layout. It carries no `Page` of its own,
 * so it serves both the route-level fallback and the in-page one, where the frame is already on screen.
 */
function PublicDogDetailSkeleton() {
  const i18n = useI18n();

  return (
    <div class="dog-detail">
      <div class="dog-detail__heading">
        <AtomSkeleton width="60%" height="var(--text-heading-sm)" />
      </div>
      <DogDetailTabs
        bio={
          <AtomCollapsible
            open
            trigger={<span>{i18n.t("DOGS.DETAIL.INFO")}</span>}
            content={
              <dl class="dog-detail__facts">
                <For each={Array.from({ length: FACT_COUNT })}>
                  {() => (
                    <div class="dog-detail__fact">
                      <dt class="text-caption-sm">
                        <AtomSkeleton width="50%" />
                      </dt>
                      <dd class="text-body-sm">
                        <AtomSkeleton width="80%" />
                      </dd>
                    </div>
                  )}
                </For>
              </dl>
            }
          />
        }
      />
    </div>
  );
}

function PublicDogDetailPage() {
  const i18n = useI18n();
  const params = Route.useParams();
  const dogQuery = usePublicDog(() => params().identification);
  const dog = () => dogQuery.data;
  const [isInfoOpen, setInfoOpen] = createSignal(true);

  /**
   * "No such dog" is only true once the request is done: a query that is still pending — or errored, which
   * does not suspend — would otherwise flash the not-found message over a dog that does exist.
   */
  const isResolved = () => !dogQuery.isPending && !dogQuery.isFetching;

  /** A field nobody filled in is shown as a dash, so every dog reads as the same shape. */
  const orDash = (value: string | null | undefined) =>
    value?.trim() ? value : "—";

  const facts = (detail: PublicDogDetail): Fact[] => [
    {
      label: i18n.t("DOGS.DETAIL.IDENTIFICATION"),
      value: detail.identification,
    },
    {
      label: i18n.t("DOGS.DETAIL.BREED"),
      value: orDash(detail.breed?.name),
    },
    {
      label: i18n.t("DOGS.DETAIL.COUNTRY"),
      value: (
        <span class="dog-detail__country">
          <CountryFlag
            country={detail.country?.id}
            alt={detail.country?.name}
          />
          <span>{orDash(detail.country?.name)}</span>
        </span>
      ),
    },
    { label: i18n.t("DOGS.DETAIL.HANDLER"), value: orDash(detail.handler) },
    { label: i18n.t("DOGS.DETAIL.TEAM"), value: orDash(detail.team) },
    { label: i18n.t("DOGS.DETAIL.ORIGIN"), value: orDash(detail.origin) },
    { label: i18n.t("DOGS.DETAIL.LICENSE"), value: orDash(detail.license) },
    {
      label: i18n.t("DOGS.DETAIL.HEIGHT"),
      value: detail.withersCm == null ? "—" : `${detail.withersCm} cm`,
    },
    {
      label: i18n.t("DOGS.DETAIL.THREE_FCI_GENERATIONS"),
      value: i18n.t(
        detail.threeFciGenerationsConfirmed
          ? "DOGS.DETAIL.YES"
          : "DOGS.DETAIL.NO",
      ),
    },
    {
      label: i18n.t("DOGS.DETAIL.LAST_UPDATE"),
      value: formatDateTime(detail.lastUpdate),
    },
  ];

  return (
    <Page>
      <Show when={dog() || isResolved()} fallback={<PublicDogDetailSkeleton />}>
        <Show
          when={dog()}
          fallback={
            <p class="dog-detail__empty">{i18n.t("DOGS.DETAIL.NOT_FOUND")}</p>
          }
        >
          {(detail) => (
            <div class="dog-detail">
              <PageSeo
                title={i18n.t("DOGS.DETAIL.META_TITLE", {
                  name: detail().name,
                })}
                description={i18n.t("DOGS.DETAIL.META_DESCRIPTION", {
                  name: detail().name,
                })}
              />
              <div class="dog-detail__heading">
                <span class="dog-detail__name">{detail().name}</span>
                <Show when={detail().sex}>
                  <SexIcon sex={detail().sex ?? undefined} />
                </Show>
                <Show when={detail().image}>
                  <img
                    class="dog-detail__image"
                    src={detail().image}
                    alt={detail().name}
                    loading="lazy"
                    decoding="async"
                  />
                </Show>
              </div>
              <DogDetailTabs
                bio={
                  <AtomCollapsible
                    open={isInfoOpen()}
                    onOpenChange={setInfoOpen}
                    trigger={<span>{i18n.t("DOGS.DETAIL.INFO")}</span>}
                    content={
                      <dl class="dog-detail__facts">
                        <For each={facts(detail())}>
                          {(fact) => (
                            <div class="dog-detail__fact">
                              <dt class="text-caption-sm">{fact.label}</dt>
                              <dd class="text-body-sm">{fact.value}</dd>
                            </div>
                          )}
                        </For>
                      </dl>
                    }
                  />
                }
              />
            </div>
          )}
        </Show>
      </Show>
    </Page>
  );
}
