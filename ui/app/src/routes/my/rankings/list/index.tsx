import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomInput from "@lib/components/atoms/input/AtomInput";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import AtomTable, {
  type ColumnDef,
} from "@lib/components/atoms/table/AtomTable";
import Card from "@lib/components/molecules/card/Card";
import { createFileRoute } from "@tanstack/solid-router";
import { createMemo, createSignal, For, Show, Suspense } from "solid-js";
import eyeIcon from "@/assets/miscelaneous/eye.svg";
import pencilIcon from "@/assets/miscelaneous/pencil.svg";
import trashIcon from "@/assets/miscelaneous/trash.svg";
import CardListSkeleton from "@/components/common/card-list-skeleton/CardListSkeleton";
import ConfirmActionButton from "@/components/common/confirm-action-button/ConfirmActionButton";
import FloatingToggleCircle from "@/components/common/floating-toggle-circle/FloatingToggleCircle";
import NameFilter from "@/components/common/name-filter/NameFilter";
import Page from "@/components/common/page/Page";
import RankingConfigurator, {
  type RankingCompetitionOption,
  type RankingConfiguratorChange,
} from "@/components/routes/my/competitions/$id/rankings-section/RankingConfigurator";
import RankingResults from "@/components/routes/my/competitions/$id/rankings-section/RankingResults";
import { useSelectableCompetitions } from "@/services/secured/competition-crud/competitionCrud";
import {
  deleteRanking,
  getCachedRanking,
  prefetchRanking,
  saveRanking,
  useRankings,
  useRankingIncludeBys,
  useRankingGroupBys,
} from "@/services/secured/ranking-crud/rankingCrud";
import type {
  CreateRankingRequestDTO,
  RankingListItemResponseDTO,
} from "@/services/secured/ranking-crud/rankingCrud.types";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { useDeviceType } from "@/utils/media-query/useDeviceType";
import { buildNameMatcher } from "@/utils/filter/nameFilter";
import { generateEntityId } from "@/utils/id/generateEntityId";
import { useViewportFillHeight } from "@/utils/layout/useViewportFillHeight";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { createDefaultRanking } from "@/utils/ranking";
import { useSearchParam } from "@/utils/search-params/useSearchParam";
import {
  MIN_TEXT_LENGTH,
  validateRequiredText,
} from "@/utils/validation/textField";
import "./styles.css";

const VIEW = { LIST: "LIST", TABLE: "TABLE" } as const;

export const Route = createFileRoute("/my/rankings/list/")({
  component: MyRankingsRoute,
});

function MyRankingsRoute() {
  return (
    <Suspense
      fallback={
        <Page>
          <div class="rankings-list card-list">
            <CardListSkeleton count={6} />
          </div>
        </Page>
      }
    >
      <MyRankingsListPage />
    </Suspense>
  );
}

function MyRankingsListPage() {
  const i18n = useI18n();
  const user = useAuthUser();
  const rankingsQuery = useRankings({
    refetchOnMount: !isOffline(),
    gcTime: 2 * 60 * 1000,
    enabled: () => Boolean(user()),
  });
  const groupBysQuery = useRankingGroupBys({ refetchOnMount: false });
  const includeBysQuery = useRankingIncludeBys({ refetchOnMount: false });
  const selectableQuery = useSelectableCompetitions({ refetchOnMount: false });

  // Both dialogs live in the URL, so an editor or a viewer is deep-linkable and survives a reload.
  const [editorParam, setEditorParam] = useSearchParam("ranking", "", "push");
  const [viewerParam, setViewerParam] = useSearchParam("view", "", "push");
  const [nameFilter, setNameFilter] = createSignal("");
  const [view, setView] = createSignal<string>(VIEW.LIST);
  const [draft, setDraft] = createSignal<CreateRankingRequestDTO | null>(null);
  const tableFill = useViewportFillHeight();
  const device = useDeviceType();

  const competitions = createMemo<RankingCompetitionOption[]>(() =>
    (selectableQuery.data ?? []).map((competition) => ({
      id: competition.id,
      name: competition.name,
      stages: competition.stages.map((stage) => ({
        id: stage.id,
        name: stage.name,
        events: stage.events,
      })),
    })),
  );

  const knownEvents = createMemo(() =>
    competitions().flatMap((competition) =>
      competition.stages.flatMap((stage) => stage.events),
    ),
  );

  const filteredRankings = createMemo(() => {
    const matches = buildNameMatcher(nameFilter());
    return (rankingsQuery.data ?? []).filter((ranking) =>
      matches(ranking.name),
    );
  });

  const isEditorOpen = () => !!editorParam();

  const openCreate = () => {
    // The id is generated here, not derived from a competition: these rankings stand on their own.
    setDraft(
      createDefaultRanking(
        generateEntityId("ranking").replace(/^ranking_/, ""),
        i18n.t("MY.RANKINGS.LIST.DEFAULT_RANKING"),
      ),
    );
    setEditorParam("new");
  };

  const seedDraft = (ranking: RankingListItemResponseDTO, eventIds: string[]) =>
    setDraft({
      rankingId: ranking.rankingId,
      name: ranking.name,
      eventIds,
      groupBy: ranking.groupBy,
      includeBy: ranking.includeBy,
      includedCount: ranking.includedCount,
      includeReserves: ranking.includeReserves,
    });

  /**
   * There is no update endpoint: re-posting the same identifier replaces the ranking, so editing is the very
   * same POST. The row carries only a count, so the events come from the by-id read; the dialog opens with
   * whatever is cached and fills in when the request lands rather than blocking on it.
   */
  const openEdit = (ranking: RankingListItemResponseDTO) => {
    seedDraft(
      ranking,
      (getCachedRanking(ranking.rankingId)?.events ?? []).map(
        (event) => event.id,
      ),
    );
    setEditorParam(ranking.rankingId);

    void (async () => {
      const stored = await prefetchRanking(ranking.rankingId);
      setDraft((current) =>
        // Only fills a still-empty list, so a selection made while the request was in flight is not lost.
        current &&
        current.rankingId === ranking.rankingId &&
        current.eventIds.length === 0
          ? {
              ...current,
              eventIds: (stored?.events ?? []).map((event) => event.id),
            }
          : current,
      );
    })();
  };

  const closeEditor = () => {
    setDraft(null);
    setEditorParam("");
  };

  const nameError = () => validateRequiredText(draft()?.name);
  const canSave = () => !nameError() && (draft()?.eventIds.length ?? 0) > 0;

  const nameErrorMessage = () => {
    const error = nameError();
    if (error === "REQUIRED") return i18n.t("COMMON.VALIDATION.REQUIRED");
    if (error === "MIN_LENGTH")
      return i18n.t("COMMON.VALIDATION.MIN_LENGTH", { min: MIN_TEXT_LENGTH });
    return undefined;
  };

  const handleSave = () => {
    const payload = draft();

    if (!payload || !canSave()) return;

    saveRanking(payload, knownEvents());
    closeEditor();
  };

  const handleConfiguratorChange = (change: RankingConfiguratorChange) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            eventIds: change.eventIds,
            groupBy: change.groupBy,
            includeBy: change.includeBy,
            includedCount: change.includedCount,
            includeReserves: change.includeReserves,
          }
        : current,
    );
  };

  const selectedEvents = () =>
    (draft()?.eventIds ?? []).map(
      (eventId) =>
        knownEvents().find((event) => event.id === eventId) ??
        (getCachedRanking(editorParam())?.events ?? []).find(
          (event) => event.id === eventId,
        ) ?? {
          id: eventId,
          name: eventId,
        },
    );

  /** Cards get text buttons, with the affirmative action apart on the right. */
  const cardActions = (ranking: RankingListItemResponseDTO) => (
    <div class="rankings-list__actions">
      <ConfirmActionButton
        text={ranking.name}
        onConfirm={() => deleteRanking(ranking.rankingId)}
      >
        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
          {i18n.t("MY.RANKINGS.RANKING_CARD.DELETE")}
        </AtomButton>
      </ConfirmActionButton>
      <AtomButton type={BUTTON_TYPES.ACCENT} onClick={() => openEdit(ranking)}>
        {i18n.t("MY.RANKINGS.RANKING_CARD.EDIT")}
      </AtomButton>
      <AtomButton
        class="rankings-list__view"
        onClick={() => setViewerParam(ranking.rankingId)}
      >
        {i18n.t("MY.RANKINGS.RANKING_CARD.VIEW")}
      </AtomButton>
    </div>
  );

  /** The table uses icon buttons, like the judge and dog tables: the shared class shapes them. */
  const tableActions = (ranking: RankingListItemResponseDTO) => (
    <div class="list-table__actions">
      <ConfirmActionButton
        text={ranking.name}
        onConfirm={() => deleteRanking(ranking.rankingId)}
      >
        <AtomButton type={BUTTON_TYPES.DESTRUCTIVE}>
          <AtomSvgIcon
            src={trashIcon}
            alt={i18n.t("MY.RANKINGS.RANKING_CARD.DELETE")}
            tinted
          />
        </AtomButton>
      </ConfirmActionButton>
      <AtomButton type={BUTTON_TYPES.ACCENT} onClick={() => openEdit(ranking)}>
        <AtomSvgIcon
          src={pencilIcon}
          alt={i18n.t("MY.RANKINGS.RANKING_CARD.EDIT")}
          tinted
        />
      </AtomButton>
      <AtomButton onClick={() => setViewerParam(ranking.rankingId)}>
        <AtomSvgIcon
          src={eyeIcon}
          alt={i18n.t("MY.RANKINGS.RANKING_CARD.VIEW")}
          tinted
        />
      </AtomButton>
    </div>
  );

  const columns = createMemo<ColumnDef<RankingListItemResponseDTO, any>[]>(
    () => {
      const cols: ColumnDef<RankingListItemResponseDTO, any>[] = [
        {
          accessorKey: "name",
          header: i18n.t("MY.RANKINGS.LIST.NAME"),
          cell: (info) => (
            <div class="list-table__name">
              <span>{info.row.original.name}</span>
            </div>
          ),
        },
      ];

      // On mobile the row has no space for it, and the count is secondary to the actions.
      if (device() !== "mobile") {
        cols.push({
          accessorKey: "eventCount",
          header: i18n.t("MY.RANKINGS.LIST.EVENTS"),
        });
      }

      cols.push({
        id: "actions",
        header: () => null,
        enableSorting: false,
        cell: (info) => tableActions(info.row.original),
      });

      return cols;
    },
  );

  const listContent = () => (
    <div class="rankings-list card-list">
      <For each={filteredRankings()}>
        {(ranking) => (
          <Card
            topLeft={<span class="rankings-list__name">{ranking.name}</span>}
            topRight={
              <span class="rankings-list__events">
                {i18n.t("MY.RANKINGS.LIST.EVENTS")}: {ranking.eventCount}
              </span>
            }
            actions={cardActions(ranking)}
          />
        )}
      </For>
    </div>
  );

  const tableContent = () => (
    <div
      class="rankings-list__table"
      ref={tableFill.ref}
      style={{ height: `${tableFill.height()}px` }}
    >
      <AtomTable<RankingListItemResponseDTO>
        data={filteredRankings()}
        columns={columns()}
        getRowId={(row) => row.rankingId}
      />
    </div>
  );

  const controls = createMemo(() => [
    {
      value: VIEW.LIST,
      text: i18n.t("MY.RANKINGS.LIST.LIST"),
      content: listContent,
    },
    {
      value: VIEW.TABLE,
      text: i18n.t("MY.RANKINGS.LIST.TABLE"),
      content: tableContent,
    },
  ]);

  return (
    <Page>
      <AtomDialog
        size="wide"
        title={
          editorParam() === "new"
            ? i18n.t("MY.RANKINGS.LIST.NEW_RANKING")
            : i18n.t("MY.RANKINGS.LIST.EDIT_RANKING")
        }
        content={
          <Show when={draft()}>
            {(current) => (
              <div class="rankings-list__editor">
                <AtomInput
                  label={i18n.t("MY.RANKINGS.RANKING_FORM.NAME")}
                  value={current().name}
                  onChange={(name) =>
                    setDraft((entry) => (entry ? { ...entry, name } : entry))
                  }
                  validationState={nameError() ? "invalid" : undefined}
                  errorMessage={nameErrorMessage()}
                />
                <RankingConfigurator
                  competitions={competitions()}
                  events={selectedEvents()}
                  groupBy={current().groupBy}
                  includeBy={current().includeBy}
                  includedCount={current().includedCount}
                  includeReserves={current().includeReserves}
                  groupByOptions={groupBysQuery.data ?? []}
                  includeByOptions={includeBysQuery.data ?? []}
                  onChange={handleConfiguratorChange}
                  // Nothing is stored yet, so emptying the list is just an empty list.
                  onRemoveLastEvent={() =>
                    setDraft((entry) =>
                      entry ? { ...entry, eventIds: [] } : entry,
                    )
                  }
                />
                <div class="rankings-list__editor-actions">
                  <AtomButton type={BUTTON_TYPES.ACCENT} onClick={closeEditor}>
                    {i18n.t("MY.RANKINGS.RANKING_FORM.CANCEL")}
                  </AtomButton>
                  <AtomButton onClick={handleSave} disabled={!canSave()}>
                    {i18n.t("MY.RANKINGS.RANKING_FORM.SAVE")}
                  </AtomButton>
                </div>
              </div>
            )}
          </Show>
        }
        open={isEditorOpen()}
        onOpenChange={(isOpen) => {
          if (!isOpen) closeEditor();
        }}
        trigger={<span aria-hidden />}
      />

      {/* Mounted only while open, so opening it always reads the results again. */}
      <AtomDialog
        size="wide"
        title={i18n.t("MY.RANKINGS.LIST.VIEW_RANKING")}
        content={
          <Show when={viewerParam()}>
            {(rankingId) => <RankingResults rankingId={rankingId()} />}
          </Show>
        }
        open={!!viewerParam()}
        onOpenChange={(isOpen) => {
          if (!isOpen) setViewerParam("");
        }}
        trigger={<span aria-hidden />}
      />

      <Show
        when={
          rankingsQuery.data?.length ||
          (!rankingsQuery.isPending && !rankingsQuery.isFetching)
        }
        fallback={
          <div class="rankings-list card-list">
            <CardListSkeleton count={6} />
          </div>
        }
      >
        <Show
          when={rankingsQuery.data?.length}
          fallback={
            <p>{i18n.t("MY.RANKINGS.LIST.NO_RANKINGS_AVAILABLE_YET")}</p>
          }
        >
          <NameFilter
            label={i18n.t("MY.RANKINGS.LIST.NAME_FILTER")}
            value={nameFilter()}
            onChange={setNameFilter}
          />
          <Show
            when={filteredRankings().length}
            fallback={<p>{i18n.t("COMMON.NAME_FILTER.NO_MATCHES")}</p>}
          >
            <AtomSegmentedControl
              title={i18n.t("MY.RANKINGS.LIST.VIEW_BY")}
              control={view()}
              onControlChange={setView}
              controls={controls()}
            />
          </Show>
        </Show>
      </Show>

      <FloatingToggleCircle onClick={openCreate} nonToggledText="+" />
    </Page>
  );
}
