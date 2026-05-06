import {createFileRoute, useNavigate, useParams,} from "@tanstack/solid-router";
import {enrollStageEvent} from "@/services/fetch-stages/stageEnroll";
import {useStageById} from "@/services/fetch-stages/fetchStages";
import {useDogs} from "@/services/secured/dog-crud/dogCrud";
import type {Dog} from "@/services/secured/dog-crud/dogCrud.types";
import {createMemo, createSignal, Index, Show} from "solid-js";
import {formatDateLabel, toDateInputValue} from "@/utils/date";
import AtomButton, {BUTTON_TYPES,} from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import type {AtomSelectOption} from "@lib/components/atoms/select/AtomSelect.types";
import {useAuthUser} from "@/stores/auth/auth";
import "./styles.css";
import {startGoogleInteractiveLogin} from "@/utils/google-auth/googleAuth";
import {AtomCombobox} from "@lib/components/atoms/combobox/AtomCombobox";
import {useI18n} from "@/stores/i18n/i18n";

export const Route = createFileRoute("/stages/$id/info")({
  component: StageInfoPage,
});

type EnrollDraft = {
  dogId: string;
  identifier: string;
  owner: string;
  country: string;
  team: string;
};

const createEmptyEnrollDraft = (): EnrollDraft => ({
  dogId: "",
  identifier: "",
  owner: "",
  country: "",
  team: "",
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
    filters: { owned: true },
    query: {
      refetchOnMount: false,
      gcTime: 5 * 60 * 1000,
    },
  });
  const dogOptions = createMemo<AtomSelectOption[]>(() =>
    (dogsQuery.data ?? []).map((dog) => ({
      label: dog.owner ? `${dog.name} (${dog.owner})` : dog.name,
      value: dog.id,
    })),
  );
  const dogsById = createMemo(() => {
    const map = new Map<string, Dog>();
    for (const dog of dogsQuery.data ?? []) {
      map.set(dog.id, dog);
    }
    return map;
  });
  const [dialogOpen, setDialogOpen] = createSignal(false);
  const [selectedEventId, setSelectedEventId] = createSignal("");
  const [enrollDraft, setEnrollDraft] = createSignal<EnrollDraft>(
    createEmptyEnrollDraft(),
  );

  const updateEnrollDraft = (updater: (current: EnrollDraft) => EnrollDraft) =>
    setEnrollDraft((current) => updater(current));

  const handleDogChange = (option: AtomSelectOption | null) => {
    const dog = option ? dogsById().get(option.value) : undefined;

    updateEnrollDraft((current) => ({
      ...current,
      dogId: option?.value ?? "",
      identifier: dog?.identifier ?? "",
      owner: dog?.owner ?? "",
      country: dog?.country ?? "",
      team: dog?.team ?? "",
    }));
  };

  const openEnrollDialog = (eventId: string) => {
    setSelectedEventId(eventId);
    setEnrollDraft(createEmptyEnrollDraft());
    setDialogOpen(true);
  };

  const closeEnrollDialog = () => {
    setDialogOpen(false);
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

  const stageTabsContents = createMemo(() => {
    const stage = stageInfo.data;
    if (!stage) {
      return [];
    }

    return [
      {
        value: TABS.EVENTS,
        content: (
          <Card
            topLeft={<span>{i18n.t("STAGES.INFO.EVENTS")}</span>}
            content={
              <div class="stage-info__events">
                <Index each={stage.events}>
                  {(event) => (
                    <div class="stage-info__events--item">
                      <div>
                        <span>{event().discipline}</span>
                        <span>
                          {event().name} ({event().competitors.length})
                        </span>
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
                        <AtomButton
                          onClick={() => openEnrollDialog(event().id)}
                        >
                          {i18n.t("STAGES.INFO.ENROLL")}
                        </AtomButton>
                      </Show>
                    </div>
                  )}
                </Index>
              </div>
            }
          />
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
            <h2>{stage().name}</h2>
            <p class="text-caption-sm">{`${formatDateLabel(toDateInputValue(stage().dateFrom))} - ${formatDateLabel(toDateInputValue(stage().dateTo))}`}</p>
            <p class="text-caption-md">{stage().organizer}</p>
            <p class="text-body-md">{stage().address}</p>

            <AtomTabs
              defaultValue={TABS.EVENTS}
              options={stageTabsTitles}
              contents={stageTabsContents()}
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

                  <AtomInput
                    label={i18n.t("STAGES.INFO.IDENTIFIER")}
                    value={enrollDraft().identifier}
                    onChange={(identifier) =>
                      updateEnrollDraft((current) => ({
                        ...current,
                        identifier,
                      }))
                    }
                  />
                  <AtomInput
                    label={i18n.t("STAGES.INFO.OWNER")}
                    value={enrollDraft().owner}
                    onChange={(owner) =>
                      updateEnrollDraft((current) => ({
                        ...current,
                        owner,
                      }))
                    }
                  />
                  <AtomInput
                    label={i18n.t("STAGES.INFO.COUNTRY")}
                    value={enrollDraft().country}
                    onChange={(country) =>
                      updateEnrollDraft((current) => ({
                        ...current,
                        country,
                      }))
                    }
                  />
                  <AtomInput
                    label={i18n.t("STAGES.INFO.TEAM")}
                    value={enrollDraft().team}
                    onChange={(team) =>
                      updateEnrollDraft((current) => ({
                        ...current,
                        team,
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
                  return;
                }

                setDialogOpen(true);
              }}
              open={dialogOpen()}
              title={`${i18n.t("STAGES.INFO.ENROLL_IN")} ${stage().name}`}
            />
          </>
        )}
      </Show>
    </div>
  );
}
