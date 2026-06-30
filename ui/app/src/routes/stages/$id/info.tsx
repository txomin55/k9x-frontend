import {
  createFileRoute,
  useNavigate,
  useParams,
} from "@tanstack/solid-router";
import { enrollStageEvent } from "@/services/fetch-stages/stageEnroll";
import { useStageById } from "@/services/fetch-stages/fetchStages";
import { useDogs } from "@/services/secured/dog-crud/dogCrud";
import { createMemo, createSignal, For, Index, Show } from "solid-js";
import { formatDateLabel, toDateInputValue } from "@/utils/date";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { useAuthUser } from "@/stores/auth/auth";
import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";
import { AtomCombobox } from "@lib/components/atoms/combobox/AtomCombobox";
import { useI18n } from "@/stores/i18n/i18n";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import "./styles.css";

export const Route = createFileRoute("/stages/$id/info")({
  component: StageInfoPage,
});

type EnrollDraft = {
  dogId: string;
};

const createEmptyEnrollDraft = (): EnrollDraft => ({
  dogId: "",
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
    refetchOnMount: false,
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
                  topLeft={
                    <span>
                      {event().configuration.name} ({event().discipline.name})
                    </span>
                  }
                  content={
                    <div class="stage-info__event--item">
                      <div class="stage-info__event--header">
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
                              <span class="text-caption-sm">
                                {i18n.t("STAGES.INFO.UNTIL")}{" "}
                                {formatDateLabel(
                                  toDateInputValue(
                                    event().enrollmentDeadline ?? 0,
                                  ),
                                )}
                              </span>
                              <AtomButton
                                onClick={() => openEnrollDialog(event().id)}
                              >
                                {i18n.t("STAGES.INFO.ENROLL")}
                              </AtomButton>
                            </div>
                          </Show>
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
                                    <span>
                                      <b>
                                        {competitor.dog.name} (
                                        {competitor.breed})
                                      </b>
                                    </span>
                                    <span>
                                      {competitor.handler} ({competitor.team})
                                    </span>
                                  </li>
                                )}
                              </For>
                            </ul>
                          </Show>
                        }
                      />
                    </div>
                  }
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
  return (
    <div class="stage-info">
      <Show
        when={stageInfo.data}
        fallback={<span>{i18n.t("STAGES.INFO.LOADING_STAGE_DATA")}</span>}
      >
        {(stage) => (
          <>
            <div class="stage-info__title">
              <span>{stage().name}</span>
              <span class="text-caption-sm">{`${formatDateLabel(toDateInputValue(stage().dateFrom ?? 0))} - ${formatDateLabel(toDateInputValue(stage().dateTo ?? 0))}`}</span>
            </div>
            <span class="text-caption-md">{stage().organizer}</span>
            <span class="text-body-md">{stage().address}</span>

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
