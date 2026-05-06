import { createMemo, createSignal, Index, Show } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import Card from "@lib/components/molecules/card/Card";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import CompetitorEditorForm from "./CompetitorEditorForm";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import { useDogs } from "@/services/secured/dog-crud/dogCrud";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import type { AtomSelectOption } from "@lib/components/atoms/select/AtomSelect.types";
import { EventCompetitorDetail } from "@/services/secured/event-crud/eventCrud.types";
import { useNavigate, useParams } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

type EventCompetitorsSectionProps = {
  competitorDialogDraft: EventCompetitorDetail | null;
  competitors: EventCompetitorDetail[];
  editingCompetitorId: string | null;
  isCreatingCompetitor: boolean;
  isEditing: boolean;
  onAddCompetitor: () => void;
  onCommitCompetitor: () => void;
  onCompetitorDraftChange: (
    updater: (
      current: EventCompetitorDetail | null,
    ) => EventCompetitorDetail | null,
  ) => void;
  onDeleteCompetitor: (competitorId: string) => void;
  onOpenCompetitorEditor: (competitor: EventCompetitorDetail) => void;
  onCreateCompetitor: () => void;
};

export default function EventCompetitorsSection(
  props: EventCompetitorsSectionProps,
) {
  const i18n = useI18n();
  const params = useParams({
    from: "/my/competitions/$id/stages/$stageId/events/$eventId/",
  });

  const dogsQuery = useDogs({
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
  const getDogName = (dogId: string) => dogsById().get(dogId)?.name;

  const getOrderValue = (competitor: EventCompetitorDetail) => competitor.order;

  const sortedCompetitors = createMemo(() =>
    [...props.competitors].toSorted(
      (a, b) => getOrderValue(a) - getOrderValue(b),
    ),
  );
  const competitorOrderBounds = () => ({
    minValue: 1,
    maxValue: Math.max(
      1,
      props.competitors.length + (props.isCreatingCompetitor ? 1 : 0),
    ),
  });

  const [dialogOpen, setDialogOpen] = createSignal(false);

  const viewDialogTitle = () => {
    if (props.isCreatingCompetitor) {
      return i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.NEW_COMPETITOR");
    }

    return i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.EDIT_COMPETITOR");
  };

  const navigate = useNavigate();
  const openCompetitorCollection = (eventId: string, competitorId: string) =>
    void navigate({
      params: { id: eventId },
      to: "/my/collections/$id",
      search: {
        competitorId,
        judgesIds: [],
      },
    });

  const acceptCompetitor = () => {
    props.onCompetitorDraftChange((current) =>
      current
        ? {
            ...current,
            status: "accepted",
          }
        : current,
    );
  };
  return (
    <section class="event-competitors-section">
      <div class="event-competitors-section__header">
        <Show when={props.isEditing}>
          <CircleButton
            onClick={() => {
              props.onAddCompetitor();
              setDialogOpen(true);
            }}
          >
            +
          </CircleButton>
        </Show>
      </div>
      <Show
        when={props.competitors.length > 0}
        fallback={
          <p>{i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.NO_COMPETITORS")}</p>
        }
      >
        <div class="event-competitors-section__competitors">
          <Index each={sortedCompetitors()}>
            {(competitor) => (
              <Card
                topLeft={competitor().owner}
                content={
                  <div class="event-competitors-section__competitors--competitor">
                    <p>{`${i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.DOG")}: ${getDogName(competitor().dogId)}`}</p>
                    <p>{`${i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.IDENTITY")}: ${competitor().identity}`}</p>
                    <p>{`${i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.TEAM")}: ${competitor().team}`}</p>
                    <p>{`${i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.COUNTRY")}: ${competitor().country}`}</p>
                  </div>
                }
                actions={
                  props.isEditing ? (
                    <div class="event-competitors-section__competitors--actions">
                      <ConfirmActionButton
                        text={competitor().owner}
                        onConfirm={() =>
                          props.onDeleteCompetitor(competitor().dogId)
                        }
                      >
                        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                          {i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.DELETE")}
                        </AtomButton>
                      </ConfirmActionButton>
                      <AtomButton
                        type={BUTTON_TYPES.ACCENT}
                        onClick={() => {
                          props.onOpenCompetitorEditor(competitor());
                          setDialogOpen(true);
                        }}
                      >
                        {i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.EDIT")}
                      </AtomButton>
                    </div>
                  ) : (
                    <>
                      <AtomButton
                        type={BUTTON_TYPES.ACCENT}
                        onClick={() => {
                          openCompetitorCollection(
                            params().eventId,
                            competitor().dogId,
                          );
                        }}
                      >
                        {i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.SCORES")}
                      </AtomButton>
                      <Show when={competitor().status === "requested"}>
                        <AtomButton onClick={acceptCompetitor}>
                          --Accept enroll
                        </AtomButton>
                      </Show>
                    </>
                  )
                }
              />
            )}
          </Index>
        </div>
      </Show>
      <AtomDialog
        closeButtonText={i18n.t(
          "MY.COMPETITIONS.EVENT_COMPETITORS.CLOSE_DIALOG",
        )}
        content={
          <CompetitorEditorForm
            competitorDialogDraft={props.competitorDialogDraft}
            onCloseCompetitorEditor={() => {
              setDialogOpen(false);
            }}
            onCommitCompetitor={props.onCommitCompetitor}
            onCompetitorDraftChange={props.onCompetitorDraftChange}
            onCreateCompetitor={() => {
              props.onCreateCompetitor();
              setDialogOpen(false);
            }}
            orderBounds={competitorOrderBounds()}
            dogOptions={dogOptions()}
            dogsById={dogsById()}
            displaySave={props.isCreatingCompetitor}
          />
        }
        onOpenChange={setDialogOpen}
        open={dialogOpen()}
        title={viewDialogTitle()}
      />
    </section>
  );
}
