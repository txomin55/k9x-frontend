import { createFileRoute, useParams } from "@tanstack/solid-router";
import { enrollStageEvent } from "@/services/fetch-stages/stageEnroll";
import { useStageById } from "@/services/fetch-stages/fetchStages";
import { useDogs } from "@/services/api/dog-crud/dogCrud";
import type { Dog } from "@/services/api/dog-crud/dogCrud.types";
import { createMemo, createSignal, Index, Show } from "solid-js";
import { formatDateLabel, toDateInputValue } from "@/utils/date";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import "./styles.css";

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

function StageInfoPage() {
  const TABS = {
    EVENTS: "EVENTS",
    NOTIFICATIONS: "NOTIFICATIONS",
  };

  const params = useParams({ from: "/stages/$id/info" });

  const stageInfo = useStageById(params().id);
  const dogsQuery = useDogs({
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
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
  const [selectedEventName, setSelectedEventName] = createSignal("");
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

  const openEnrollDialog = (eventId: string, eventName: string) => {
    setSelectedEventId(eventId);
    setSelectedEventName(eventName);
    setEnrollDraft(createEmptyEnrollDraft());
    setDialogOpen(true);
  };

  const closeEnrollDialog = () => {
    setDialogOpen(false);
    setSelectedEventId("");
    setSelectedEventName("");
    setEnrollDraft(createEmptyEnrollDraft());
  };

  const handleEnroll = async () => {
    if (!selectedEventId()) {
      return;
    }

    await enrollStageEvent({
      ...enrollDraft(),
      eventId: selectedEventId(),
      stageId: params().id,
    });

    closeEnrollDialog();
  };

  const stageTabsTitles = [
    { value: TABS.EVENTS, content: <span>--Events</span> },
    {
      value: TABS.NOTIFICATIONS,
      content: <span>--Notifications</span>,
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
            topLeft={<span>--Events</span>}
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
                      <AtomButton
                        onClick={() =>
                          openEnrollDialog(event().id, event().name)
                        }
                      >
                        --Enroll
                      </AtomButton>
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
        content: <div>--Notifications</div>,
      },
    ];
  });
  return (
    <div class="stage-info">
      <Show when={stageInfo.data} fallback={<span>--Loading stage data</span>}>
        {(stage) => (
          <>
            <h2>{stage().name}</h2>
            <p class="text-caption-sm">{`${formatDateLabel(toDateInputValue(stage().dateFrom))} - ${formatDateLabel(toDateInputValue(stage().dateTo))}`}</p>
            <p class="text-body-md">{stage().address}</p>

            <AtomTabs
              defaultValue={TABS.EVENTS}
              options={stageTabsTitles}
              contents={stageTabsContents()}
            />
            <AtomDialog
              closeButtonText="--Close dialog"
              content={
                <div class="stage-info__enroll-form">
                  <AtomSelect
                    label="--Dog"
                    onChange={handleDogChange}
                    options={dogOptions()}
                    placeholder="--Select a dog"
                    value={
                      dogOptions().find(
                        (option) => option.value === enrollDraft().dogId,
                      ) ?? null
                    }
                  />
                  <AtomInput
                    label="--Identifier"
                    value={enrollDraft().identifier}
                    onChange={(identifier) =>
                      updateEnrollDraft((current) => ({
                        ...current,
                        identifier,
                      }))
                    }
                  />
                  <AtomInput
                    label="--Owner"
                    value={enrollDraft().owner}
                    onChange={(owner) =>
                      updateEnrollDraft((current) => ({
                        ...current,
                        owner,
                      }))
                    }
                  />
                  <AtomInput
                    label="--Country"
                    value={enrollDraft().country}
                    onChange={(country) =>
                      updateEnrollDraft((current) => ({
                        ...current,
                        country,
                      }))
                    }
                  />
                  <AtomInput
                    label="--Team"
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
                      --Cancel
                    </AtomButton>
                    <AtomButton
                      onClick={() => {
                        void handleEnroll().catch((error) => {
                          console.error("Failed to enroll competitor", error);
                        });
                      }}
                    >
                      --Enroll
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
              title={`--Enroll in ${stage().name}`}
            />
          </>
        )}
      </Show>
    </div>
  );
}
