import { createMemo, createSignal, Index, Match, Show, Switch } from "solid-js";
import AtomDialog from "library/src/components/atoms/dialog/AtomDialog";
import Card from "library/src/components/molecules/card/Card";
import CircleButton from "library/src/components/molecules/circle-button/CircleButton";
import CompetitorEditorForm from "./CompetitorEditorForm";
import AtomButton, {
  BUTTON_TYPES,
} from "library/src/components/atoms/button/AtomButton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import BihIndicator from "@/components/common/bih-indicator/BihIndicator";
import ReserveIndicator from "@/components/common/reserve-indicator/ReserveIndicator";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import SexIcon from "@/components/common/sex-icon/SexIcon";
import NotCompetingIndicator from "@/components/common/not-competing-indicator/NotCompetingIndicator";
import { useAllDogs } from "@/services/secured/dog-crud/dogCrud";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import type { AtomSelectOption } from "library/src/components/atoms/select/AtomSelect.types";
import { EventCompetitorDetail } from "@/services/secured/event-crud/eventCrud.types";
import { useNavigate, useParams } from "@tanstack/solid-router";
import { useI18n } from "@/stores/i18n/i18n";
import {
  canAcceptCompetitorEnroll,
  canSeeCompetitorScores,
  EVENT_STATUS,
} from "@/utils/event";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import "./styles.css";

type EventCompetitorsSectionProps = {
  competitorDialogDraft: EventCompetitorDetail | null;
  competitors: EventCompetitorDetail[];
  eventStatus: string;
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
  onAcceptCompetitor: (dogId: string) => void;
  onMarkCompetitorNotCompeting: (dogId: string) => void;
};

export default function EventCompetitorsSection(
  props: EventCompetitorsSectionProps,
) {
  const i18n = useI18n();
  const params = useParams({
    from: "/my/competitions/$id/stages/$stageId/events/$eventId/",
  });

  const dogsQuery = useAllDogs({
    refetchOnMount: !isOffline(),
    gcTime: 5 * 60 * 1000,
  });
  const dogOptions = createMemo<AtomSelectOption[]>(() => {
    const addedDogIds = new Set(
      props.competitors
        .filter((competitor) => competitor.dogId !== props.editingCompetitorId)
        .map((competitor) => competitor.dogId),
    );

    return (dogsQuery.data ?? [])
      .filter((dog) => !addedDogIds.has(dog.id))
      .map((dog) => ({
        label: dog.handler ? `${dog.name} (${dog.handler})` : dog.name,
        value: dog.id,
      }));
  });
  const dogsById = createMemo(() => {
    const map = new Map<string, Dog>();
    for (const dog of dogsQuery.data ?? []) {
      map.set(dog.id, dog);
    }
    return map;
  });
  const getCompetitorDetails = (competitor: EventCompetitorDetail) => {
    const dog = dogsById().get(competitor.dogId);

    return {
      name: dog?.name ?? competitor.name,
      breed: dog?.breed.name ?? competitor.breed,
      handler: dog?.handler ?? competitor.handler,
      identity: dog?.identity ?? competitor.identity,
      team: dog?.team ?? competitor.team,
      country: dog?.country.id ?? competitor.country,
      sex: dog?.sex,
    };
  };

  const getOrderValue = (competitor: EventCompetitorDetail) =>
    competitor.position;

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
            {(competitor) => {
              const details = () => getCompetitorDetails(competitor());

              return (
                <Card
                  topLeft={details().handler}
                  content={
                    <div class="event-competitors-section__competitors--competitor">
                      <div class="event-competitors-section__competitors--badges">
                        <SexIcon sex={details().sex} />
                        <Show when={competitor().notCompeting}>
                          <NotCompetingIndicator />
                        </Show>
                        <Show when={competitor().bih}>
                          <BihIndicator />
                        </Show>
                        <Show when={competitor().reserve}>
                          <ReserveIndicator />
                        </Show>
                      </div>
                      <span class="text-body-sm">
                        {`${i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.DOG")}: ${details().name}`}
                      </span>
                      <span class="text-body-sm">{`${i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.IDENTITY")}: ${details().identity}`}</span>
                      <span class="text-body-sm">
                        {`${i18n.t("MY.COMPETITIONS.EVENT_COMPETITORS.TEAM")}: ${details().team}`}{" "}
                        <CountryFlag country={details().country} />
                      </span>
                    </div>
                  }
                  actions={
                    competitor().notCompeting ? null : props.isEditing ? (
                      <div class="event-competitors-section__competitors--actions">
                        <Switch>
                          <Match
                            when={props.eventStatus === EVENT_STATUS.STARTED}
                          >
                            <ConfirmActionButton
                              text={details().handler}
                              onConfirm={() =>
                                props.onMarkCompetitorNotCompeting(
                                  competitor().dogId,
                                )
                              }
                            >
                              <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                                {i18n.t(
                                  "MY.COMPETITIONS.EVENT_COMPETITORS.NOT_PRESENTED",
                                )}
                              </AtomButton>
                            </ConfirmActionButton>
                          </Match>
                          <Match
                            when={props.eventStatus === EVENT_STATUS.CREATED}
                          >
                            <ConfirmActionButton
                              text={details().handler}
                              onConfirm={() =>
                                props.onDeleteCompetitor(competitor().dogId)
                              }
                            >
                              <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
                                {i18n.t(
                                  "MY.COMPETITIONS.EVENT_COMPETITORS.DELETE",
                                )}
                              </AtomButton>
                            </ConfirmActionButton>
                          </Match>
                        </Switch>
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
                        <Show when={canSeeCompetitorScores(props.eventStatus)}>
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
                        </Show>
                        <Show
                          when={canAcceptCompetitorEnroll(competitor().status)}
                        >
                          <AtomButton
                            onClick={() =>
                              props.onAcceptCompetitor(competitor().dogId)
                            }
                          >
                            {i18n.t(
                              "MY.COMPETITIONS.EVENT_COMPETITORS.ACCEPT_ENROLL",
                            )}
                          </AtomButton>
                        </Show>
                      </>
                    )
                  }
                />
              );
            }}
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
