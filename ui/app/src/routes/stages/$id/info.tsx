import { createFileRoute, useParams } from "@tanstack/solid-router";
import { useStageById } from "@/services/fetch-stages/fetchStages";
import { createMemo, Index, Show } from "solid-js";
import { formatDateLabel, toDateInputValue } from "@/utils/date";
import "./styles.css";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";

export const Route = createFileRoute("/stages/$id/info")({
  component: StageInfoPage,
});

function StageInfoPage() {
  const TABS = {
    EVENTS: "EVENTS",
    NOTIFICATIONS: "NOTIFICATIONS",
  };

  const params = useParams({ from: "/stages/$id/info" });

  const stageInfo = useStageById(params().id);

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
                      <AtomButton>--Enroll</AtomButton>
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
          </>
        )}
      </Show>
    </div>
  );
}
