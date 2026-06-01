import { useNavigate } from "@tanstack/solid-router";
import {
  type Accessor,
  createEffect,
  createSignal,
  type JSX,
  Show,
  Suspense,
} from "solid-js";
import { useI18n } from "@/stores/i18n/i18n";
import type {
  EventDetailResponseDTO,
  UpdateEventRequestDTO,
} from "@/services/secured/event-crud/eventCrud.types";

type ObdxCompetitionEventDetailBodyProps = {
  competitionId: string;
  event: Accessor<EventDetailResponseDTO | undefined>;
  eventId: string;
  onDeleteEvent: (eventId: string) => void;
  onUpdate: (eventId: string, event: UpdateEventRequestDTO) => void;
  stageId: string;
  children: (props: {
    event: Accessor<EventDetailResponseDTO>;
    onDelete: () => void;
    onUpdate: (eventId: string, event: UpdateEventRequestDTO) => void;
  }) => JSX.Element;
};

export default function ObdxCompetitionEventDetailBodyWrapper(
  props: ObdxCompetitionEventDetailBodyProps,
) {
  const i18n = useI18n();
  const navigate = useNavigate();
  const [resolvedEvent, setResolvedEvent] = createSignal<
    EventDetailResponseDTO | undefined
  >(props.event());

  createEffect(() => {
    const currentEvent = props.event();

    if (!currentEvent) return;

    setResolvedEvent(currentEvent);
  });

  const eventAccessor = () => resolvedEvent()!;

  const handleDelete = () => {
    props.onDeleteEvent(props.eventId);
    void navigate({
      params: { id: props.competitionId, stageId: props.stageId },
      to: "/my/competitions/$id/stages/$stageId",
    });
  };

  return (
    <div class="competition-event-detail">
      <Suspense
        fallback={
          <span>
            {i18n.t("MY.COMPETITIONS.EVENT_DETAIL.LOADING_EVENT_DETAIL")}
          </span>
        }
      >
        <Show
          when={resolvedEvent()}
          fallback={
            <p>{i18n.t("MY.COMPETITIONS.EVENT_DETAIL.EVENT_NOT_FOUND")}</p>
          }
        >
          {props.children({
            event: eventAccessor,
            onDelete: handleDelete,
            onUpdate: props.onUpdate,
          })}
        </Show>
      </Suspense>
    </div>
  );
}
