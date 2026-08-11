import {createFileRoute, useNavigate, useParams,} from "@tanstack/solid-router";
import {enrollStageEvent} from "@/services/fetch-stages/stageEnroll";
import {useStageById} from "@/services/fetch-stages/fetchStages";
import {useOwnedDogs} from "@/services/secured/dog-crud/dogCrud";
import {createMemo, createSignal, For, Index, Show, Suspense} from "solid-js";
import {formatDateLabel, formatDateTime, toDateInputValue} from "@/utils/date";
import AtomButton, {BUTTON_TYPES,} from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import EventRankingsLink from "@/components/routes/stages/event-rankings-link/EventRankingsLink";
import type {AtomSelectOption} from "@lib/components/atoms/select/AtomSelect";
import {useAuthUser} from "@/stores/auth/auth";
import {startGoogleInteractiveLogin} from "@/utils/google-auth/googleAuth";
import {AtomCombobox} from "@lib/components/atoms/combobox/AtomCombobox";
import {useI18n} from "@/stores/i18n/i18n";
import PageSeo from "@/components/common/page-seo/PageSeo";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import AwardBadges from "@/components/common/award-badges/AwardBadges";
import RankBadge from "@/components/common/rank-badge/RankBadge";
import RichText from "@/components/common/rich-text/RichText";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import {useSearchParam} from "@/utils/search-params/useSearchParam";
import "./styles.css";
import {isStageLive, STAGE_INFO_TAB_PARAM, STAGE_INFO_TABS} from "@/utils/stage";
import {canSeeClassification} from "@/utils/event";
import {isOffline} from "@/utils/local-first/localFirstPolicy";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import scoresIcon from "@/assets/miscelaneous/scores.svg";
import userPlusIcon from "@/assets/miscelaneous/user-plus.svg";

export const Route = createFileRoute("/stages/$id/info")({
  component: StageInfoRoute,
});

function StageInfoRoute() {
  return (
    <Suspense fallback={<StageInfoSkeleton />}>
      <StageInfoPage />
    </Suspense>
  );
}

function StageInfoSkeleton() {
  return (
    <div class="stage-info">
      <div class="stage-info__title">
        <div class="stage-info__title--name">
          <AtomSkeleton width="12rem" height="var(--text-body-md)" />
        </div>
        <AtomSkeleton width="9rem" height="var(--text-caption-sm)" />
      </div>
      <AtomSkeleton width="16rem" />
      <AtomSkeleton width="8rem" />

      <div style={{ display: "flex", gap: "var(--unit-1)" }}>
        <AtomSkeleton
          variant="rectangular"
          width="4rem"
          height="var(--unit-4)"
          radius="var(--radius-md)"
        />
        <AtomSkeleton
          variant="rectangular"
          width="6rem"
          height="var(--unit-4)"
          radius="var(--radius-md)"
        />
      </div>

      <div class="stage-info__events">
        <For each={Array.from({ length: 3 })}>
          {() => (
            <Card
              topLeft={
                <AtomSkeleton width="7rem" height="var(--text-heading-xs)" />
              }
              content={
                <div class="stage-info__event--item">
                  <div class="stage-info__event--header">
                    <div class="stage-info__event--header-info">
                      <AtomSkeleton
                        variant="rectangular"
                        width="var(--unit-5)"
                        height="var(--unit-5)"
                        radius="var(--radius-md)"
                      />
                      <AtomSkeleton width="10rem" />
                    </div>
                    <AtomSkeleton
                      variant="rectangular"
                      width="5rem"
                      height="var(--unit-5)"
                      radius="var(--radius-full)"
                    />
                  </div>
                  <AtomSkeleton width="12rem" />
                </div>
              }
            />
          )}
        </For>
      </div>
    </div>
  );
}

type EnrollDraft = {
  dogIdentification: string;
  bih: boolean;
  primer: string;
};

const createEmptyEnrollDraft = (): EnrollDraft => ({
  dogIdentification: "",
  bih: false,
  primer: "",
});

const TABS = STAGE_INFO_TABS;

function StageInfoPage() {
  const i18n = useI18n();
  const navigate = useNavigate();
  const user = useAuthUser();
  const params = useParams({ from: "/stages/$id/info" });

  const stageInfo = useStageById(params().id);
  const metaTitle = createMemo(() => {
    const name = stageInfo.data?.competitionName;
    return name
      ? i18n.t("STAGES.INFO.META_TITLE", { name })
      : i18n.t("STAGES.INDEX.META_TITLE");
  });
  const metaDescription = createMemo(() => {
    const name = stageInfo.data?.competitionName;
    return name
      ? i18n.t("STAGES.INFO.META_DESCRIPTION", { name })
      : undefined;
  });
  const dogsQuery = useOwnedDogs({
    refetchOnMount: !isOffline(),
    gcTime: 5 * 60 * 1000,
    enabled: () => Boolean(user()),
  });
  const ownedDogs = () => (user() ? (dogsQuery.data ?? []) : []);
  const notifications = createMemo(() => stageInfo.data?.notifications ?? []);
  // The API identifies the affected events by id only, so names are resolved from the stage's own events.
  const eventNameById = createMemo(
    () =>
      new Map(
        (stageInfo.data?.events ?? []).map((event) => [event.id, event.name]),
      ),
  );
  const affectedEventNames = (eventIds: string[]) =>
    eventIds.map((eventId) => eventNameById().get(eventId) ?? eventId);
  const dogOptions = createMemo<AtomSelectOption[]>(() =>
    ownedDogs().map((dog) => ({
      label: dog.handler ? `${dog.name} (${dog.handler})` : dog.name,
      value: dog.identification,
    })),
  );
  const [selectedEventId, setSelectedEventId] = useSearchParam(
    "enroll",
    "",
    "push",
  );
  const [tabParam, setTabParam] = useSearchParam(
    STAGE_INFO_TAB_PARAM,
    TABS.EVENTS,
  );
  // An unknown value in the URL falls back to the events tab instead of leaving every tab unselected.
  const selectedTab = () =>
    tabParam() === TABS.NOTIFICATIONS ? TABS.NOTIFICATIONS : TABS.EVENTS;
  const dialogOpen = () => !!selectedEventId();
  const selectedEventName = createMemo(
    () =>
      (stageInfo.data?.events ?? []).find(
        (event) => String(event.id) === String(selectedEventId()),
      )?.name ?? "",
  );
  const [enrollDraft, setEnrollDraft] = createSignal<EnrollDraft>(
    createEmptyEnrollDraft(),
  );

  const updateEnrollDraft = (updater: (current: EnrollDraft) => EnrollDraft) =>
    setEnrollDraft((current) => updater(current));

  const handleDogChange = (option: AtomSelectOption | null) => {
    updateEnrollDraft((current) => ({
      ...current,
      dogIdentification: option?.value ?? "",
    }));
  };

  const selectedDog = (dogIdentification: string) =>
    ownedDogs().find((dog) => dog.identification === dogIdentification);

  const openEnrollDialog = (eventId: string) => {
    setEnrollDraft(createEmptyEnrollDraft());
    setSelectedEventId(eventId);
  };

  const closeEnrollDialog = () => {
    setSelectedEventId("");
    setEnrollDraft(createEmptyEnrollDraft());
  };

  const handleEnroll = async () => {
    if (!selectedEventId()) {
      return;
    }

    await enrollStageEvent(params().id, {
      ...enrollDraft(),
      eventId: selectedEventId(),
    });

    closeEnrollDialog();
  };

  const stageTabsTitles = [
    {
      value: TABS.EVENTS,
      content: <span>{i18n.t("STAGES.INFO.EVENTS")}</span>,
    },
    {
      value: TABS.NOTIFICATIONS,
      content: <span>{i18n.t("STAGES.INFO.NOTIFICATIONS")}</span>,
    },
  ];

  const eventsTabsContents = [
    {
      value: TABS.EVENTS,
      content: (
        <div class="stage-info__events">
          <Index each={stageInfo.data?.events ?? []}>
            {(event) => (
              <Card
                content={
                  <div class="stage-info__event--item">
                    <DisciplineIcon disciplineId={event().discipline.id} />
                    <div class="stage-info__event--header">
                      <div class="stage-info__event--header-info">
                        <span class="text-heading-xs">
                          {event().configuration.name}
                        </span>
                        <RankBadge rank={event().rank} />
                        <AwardBadges awards={event().awards} />
                      </div>
                      <div class="stage-info__event--actions">
                        <Show when={event().enrollmentOpened}>
                          <Show
                            when={user()}
                            fallback={
                              <AtomButton
                                type={BUTTON_TYPES.GHOST}
                                onClick={startGoogleInteractiveLogin}
                              >
                                {i18n.t("STAGES.INFO.LOGIN_TO_ENROLL")}
                              </AtomButton>
                            }
                          >
                            <div class="stage-info__event--enrollment">
                              <AtomButton
                                onClick={() => openEnrollDialog(event().id)}
                              >
                                <span class="stage-info__enroll-btn-icon">
                                  <AtomSvgIcon
                                    src={userPlusIcon}
                                    alt=""
                                    tinted
                                  />
                                </span>
                                <span class="stage-info__enroll-btn-label">
                                  {i18n.t("STAGES.INFO.ENROLL")}
                                </span>
                              </AtomButton>
                              <span class="text-caption-sm">
                                {formatDateLabel(
                                  toDateInputValue(
                                    event().enrollmentDeadline ?? 0,
                                  ),
                                )}
                              </span>
                            </div>
                          </Show>
                        </Show>
                        <Show when={canSeeClassification(event().status)}>
                          <div class="stage-info__event--classification">
                            <AtomButton
                              type={BUTTON_TYPES.PRIMARY}
                              onClick={() =>
                                navigateToClassification(event().id)
                              }
                            >
                              <span class="stage-info__classification-btn-icon">
                                <AtomSvgIcon src={scoresIcon} alt="" tinted />
                              </span>
                              <span class="stage-info__classification-btn-label">
                                {i18n.t("STAGES.INFO.SEE_CLASSIFICATION")}
                              </span>
                            </AtomButton>
                          </div>
                        </Show>
                      </div>
                    </div>
                    <AtomCollapsible
                      trigger={
                        <span>
                          {i18n.t("STAGES.INFO.COMPETITORS_ENROLLED")} (
                          {event().competitors.length})
                        </span>
                      }
                      content={
                        <Show
                          when={event().competitors.length > 0}
                          fallback={
                            <span>{i18n.t("STAGES.INFO.NO_COMPETITORS")}</span>
                          }
                        >
                          <ul class="stage-info__competitors">
                            <For each={event().competitors}>
                              {(competitor) => (
                                <li
                                  class="stage-info__competitor"
                                  classList={{
                                    "stage-info__competitor--unverified":
                                      !competitor.verified,
                                  }}
                                >
                                  <CountryFlag country={competitor.country} />
                                  <div class="stage-info__competitor--info">
                                    <span class="text-caption-lg">
                                      <b>{competitor.dog.name} (</b>
                                      {competitor.breed.name})
                                    </span>
                                    <span class="text-caption-md">
                                      {competitor.handler} ({competitor.team})
                                    </span>
                                    <Show when={!competitor.verified}>
                                      <span class="text-caption-sm stage-info__competitor--tag">
                                        {i18n.t("STAGES.INFO.UNVERIFIED")}
                                      </span>
                                    </Show>
                                  </div>
                                </li>
                              )}
                            </For>
                          </ul>
                        </Show>
                      }
                    />
                    <EventRankingsLink
                      stageId={params().id}
                      eventId={event().id}
                    />
                  </div>
                }
                topLeft={<span class="text-heading-xs">{event().name}</span>}
              />
            )}
          </Index>
        </div>
      ),
    },
    {
      value: TABS.NOTIFICATIONS,
      content: (
        <div class="stage-info__notifications">
          <Show
            when={notifications().length > 0}
            fallback={
              <span class="text-caption-md">
                {i18n.t("STAGES.INFO.NO_NOTIFICATIONS")}
              </span>
            }
          >
            <Index each={notifications()}>
              {(notification) => (
                <Card
                  topLeft={
                    <span class="text-caption-md">
                      {formatDateTime(notification().timestamp)}
                    </span>
                  }
                  description={<RichText content={notification().content} />}
                  content={
                    <Show when={notification().eventIds.length > 0}>
                      <div class="stage-info__notification--events">
                        <span class="text-caption-sm">
                          {i18n.t("STAGES.INFO.NOTIFICATION_AFFECTS")}
                        </span>
                        <div class="stage-info__notification--event-list">
                          <For each={affectedEventNames(notification().eventIds)}>
                            {(eventName) => (
                              <span class="stage-info__notification--event text-caption-sm">
                                {eventName}
                              </span>
                            )}
                          </For>
                        </div>
                      </div>
                    </Show>
                  }
                />
              )}
            </Index>
          </Show>
        </div>
      ),
    },
  ];

  const handleGoToDogs = () =>
    navigate({
      to: "/my/dogs",
    });

  const navigateToClassification = (eventId: string) =>
    void navigate({
      params: { id: params().id, eventId },
      to: "/stages/$id/events/$eventId/classification",
    });
  return (
    <div class="stage-info">
      <PageSeo title={metaTitle()} description={metaDescription()} />
      <Show
        when={stageInfo.data}
        fallback={<StageInfoSkeleton />}
      >
        {(stage) => (
          <>
            <div class="stage-info__title">
              <div class="stage-info__title--name">
                <span class="text-body-md">{stage().competitionName}</span>
                <Show when={stage().status && isStageLive(stage().status!)}>
                  <div class="stage-info__title--status">
                    <StatusBadge status={stage().status!} dotMode />
                  </div>
                </Show>
              </div>
              <span class="text-caption-sm">{`${formatDateLabel(toDateInputValue(stage().dateFrom ?? 0))} - ${formatDateLabel(toDateInputValue(stage().dateTo ?? 0))}`}</span>
            </div>
            <span class="text-caption-lg">{stage().address}</span>
            <span class="text-caption-md">{stage().organizer}</span>

            <AtomTabs
              defaultValue={TABS.EVENTS}
              value={selectedTab()}
              onChange={setTabParam}
              options={stageTabsTitles}
              contents={eventsTabsContents}
            />
            <AtomDialog
              closeButtonText={i18n.t("STAGES.INFO.CLOSE_DIALOG")}
              content={
                <div class="stage-info__enroll-form">
                  <AtomCombobox
                    label={i18n.t("STAGES.INFO.DOG")}
                    onChange={handleDogChange}
                    options={dogOptions()}
                    placeholder={i18n.t("STAGES.INFO.SELECT_A_DOG")}
                    value={
                      dogOptions().find(
                        (option) => option.value === enrollDraft().dogIdentification,
                      ) ?? null
                    }
                  >
                    <Show when={dogOptions().length === 0}>
                      <AtomButton
                        type={BUTTON_TYPES.GHOST}
                        onClick={handleGoToDogs}
                      >
                        {i18n.t("STAGES.INFO.CREATE_DOG")}
                      </AtomButton>
                    </Show>
                  </AtomCombobox>

                  <Show
                    when={
                      selectedDog(enrollDraft().dogIdentification) &&
                      selectedDog(enrollDraft().dogIdentification)?.sex !== "MALE"
                    }
                  >
                    <AtomCheckbox
                      label={i18n.t("STAGES.INFO.BIH")}
                      checked={enrollDraft().bih}
                      setChecked={(value) =>
                        updateEnrollDraft((current) => ({
                          ...current,
                          bih: value,
                        }))
                      }
                    />
                  </Show>

                  <AtomInput
                    label={i18n.t("STAGES.INFO.PRIMER")}
                    value={enrollDraft().primer}
                    onChange={(value) =>
                      updateEnrollDraft((current) => ({
                        ...current,
                        primer: value,
                      }))
                    }
                  />

                  <div class="stage-info__enroll-form-actions">
                    <AtomButton
                      type={BUTTON_TYPES.ACCENT}
                      onClick={closeEnrollDialog}
                    >
                      {i18n.t("STAGES.INFO.CANCEL")}
                    </AtomButton>
                    <AtomButton onClick={handleEnroll}>
                      {i18n.t("STAGES.INFO.ENROLL")}
                    </AtomButton>
                  </div>
                </div>
              }
              onOpenChange={(open) => {
                if (!open) {
                  closeEnrollDialog();
                }
              }}
              open={dialogOpen()}
              title={`${i18n.t("STAGES.INFO.ENROLL_IN")} ${selectedEventName()}`}
            />
          </>
        )}
      </Show>
    </div>
  );
}
