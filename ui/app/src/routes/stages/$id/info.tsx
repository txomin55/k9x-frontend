import { createFileRoute, useNavigate, useParams } from "@tanstack/solid-router";
import { enrollStageEvent } from "@/services/fetch-stages/stageEnroll";
import { useStageById } from "@/services/fetch-stages/fetchStages";
import { useDogs } from "@/services/secured/dog-crud/dogCrud";
import { createMemo, createSignal, For, Index, Show } from "solid-js";
import { formatDateLabel, toDateInputValue } from "@/utils/date";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { useAuthUser } from "@/stores/auth/auth";
import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";
import { AtomCombobox } from "@lib/components/atoms/combobox/AtomCombobox";
import { useI18n } from "@/stores/i18n/i18n";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import AwardBadges from "@/components/common/award-badges/AwardBadges";
import RankBadge from "@/components/common/rank-badge/RankBadge";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import "./styles.css";
import { isStageLive } from "@/utils/stage";
import { canSeeClassification } from "@/utils/event";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import DisciplineIcon from "@/components/common/discipline-icon/DisciplineIcon";

export const Route = createFileRoute("/stages/$id/info")({
  component: StageInfoPage,
});

type EnrollDraft = {
  dogId: string;
  bih: boolean;
};

const createEmptyEnrollDraft = (): EnrollDraft => ({
  dogId: "",
  bih: false,
});

const TABS = {
  EVENTS: "EVENTS",
  NOTIFICATIONS: "NOTIFICATIONS",
};

function StageInfoPage() {
  const i18n = useI18n();
  const navigate = useNavigate();
  const user = useAuthUser();
  const params = useParams({ from: "/stages/$id/info" });

  const stageInfo = useStageById(params().id);
  const dogsQuery = useDogs({
    refetchOnMount: !isOffline(),
    gcTime: 5 * 60 * 1000,
  });
  const dogOptions = createMemo<AtomSelectOption[]>(() =>
    (dogsQuery.data ?? []).map((dog) => ({
      label: dog.handler ? `${dog.name} (${dog.handler})` : dog.name,
      value: dog.id,
    })),
  );
  const [selectedEventId, setSelectedEventId] = useSearchParam(
    "enroll",
    "",
    "push",
  );
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
      dogId: option?.value ?? "",
    }));
  };

  const selectedDog = (dogId: string) =>
    (dogsQuery.data ?? []).find((dog) => dog.id === dogId);

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
      disabled: true,
    },
  ];

  const eventsTabsContents = createMemo(() => {
    const stage = stageInfo.data;
    if (!stage) {
      return [];
    }

    return [
      {
        value: TABS.EVENTS,
        content: (
          <div class="stage-info__events">
            <Index each={stage.events}>
              {(event) => (
                <Card
                  content={
                    <div class="stage-info__event--item">
                      <DisciplineIcon disciplineId={event().discipline.id} />
                      <div class="stage-info__event--header">
                        <div class="stage-info__event--header-info">
                          <span>{event().configuration.name}</span>
                          <RankBadge rank={event().rank} />
                          <AwardBadges awards={event().awards} />
                        </div>
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
                          <Show when={event().enrollmentOpened}>
                            <div class="stage-info__event--enrollment">
                              <AtomButton
                                onClick={() => openEnrollDialog(event().id)}
                              >
                                {i18n.t("STAGES.INFO.ENROLL")}
                              </AtomButton>
                              <span class="text-caption-sm">
                                {i18n.t("STAGES.INFO.UNTIL")}{" "}
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
                              {i18n.t("STAGES.INFO.SEE_CLASSIFICATION")}
                            </AtomButton>
                          </div>
                        </Show>
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
                              <span>
                                {i18n.t("STAGES.INFO.NO_COMPETITORS")}
                              </span>
                            }
                          >
                            <ul class="stage-info__competitors">
                              <For each={event().competitors}>
                                {(competitor) => (
                                  <li class="stage-info__competitor">
                                    <CountryFlag country={competitor.country} />
                                    <div class="stage-info__competitor--info">
                                      <span class="text-caption-lg">
                                        <b>{competitor.dog.name} (</b>
                                        {competitor.breed})
                                      </span>
                                      <span class="text-caption-md">
                                        {competitor.handler} ({competitor.team})
                                      </span>
                                    </div>
                                  </li>
                                )}
                              </For>
                            </ul>
                          </Show>
                        }
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
        content: <div>{i18n.t("STAGES.INFO.NOTIFICATIONS")}</div>,
      },
    ];
  });

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
      <Show
        when={stageInfo.data}
        fallback={<span>{i18n.t("STAGES.INFO.LOADING_STAGE_DATA")}</span>}
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
              options={stageTabsTitles}
              contents={eventsTabsContents()}
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
                        (option) => option.value === enrollDraft().dogId,
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
                      selectedDog(enrollDraft().dogId) &&
                      selectedDog(enrollDraft().dogId)?.sex !== "MALE"
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
