import { type CreateQueryResult } from "@tanstack/solid-query";
import {
  COMPETITIONS_SNAPSHOT_ID,
  type Competitions,
  CompetitionStage,
  type CompetitionStage as CompetitionListStage
} from "@/services/fetch_competitions/fetchCompetitions";
import {
  processPendingTasks,
} from "@/services/pending_tasks/pendingTasksRunner";
import {
  createPendingTaskId,
  enqueuePendingTask,
  type PendingTaskMethod,
} from "@/services/pending_tasks/pendingTasksStore";
import {
  getQuerySnapshot,
  saveQuerySnapshot,
} from "@/services/query_snapshots/querySnapshotsStore";
import { getCurrentLocale } from "@/stores/i18n";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery, type TanstackCreateQuery } from "@/utils/http/query-factory";

const DRAFT_COMPETITION_STATUS = "draft";

const getCompetitionDetailKey = (id: string) =>
  ["competition", id, getCurrentLocale()] as const;

const getCompetitionsListKey = () =>
  ["competitions", getCurrentLocale()] as const;

const refreshCompetitionSnapshot = async (id: string) => {
  const competition = await rawRequest<Competition>({
    path: `/api/competitions/${id}`,
  });

  queryClient.setQueryData(getCompetitionDetailKey(id), competition);

  const previousCompetitions =
    (await getQuerySnapshot<Competitions[]>(COMPETITIONS_SNAPSHOT_ID)) ?? [];
  const nextCompetition = toCompetitionListItem(
    competition,
    previousCompetitions.find((candidate) => candidate.id === competition.id),
  );
  const existingIndex = previousCompetitions.findIndex(
    (candidate) => candidate.id === competition.id,
  );
  const nextCompetitions =
    existingIndex === -1
      ? [nextCompetition, ...previousCompetitions]
      : previousCompetitions.map((candidate) =>
          candidate.id === competition.id ? nextCompetition : candidate,
        );

  await saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, nextCompetitions);
  queryClient.setQueryData(getCompetitionsListKey(), nextCompetitions);

  return competition;
};

const fetchCompetition = async (id: string) => {
  const competitionsSnapshot =
    await getQuerySnapshot<Competitions[]>(COMPETITIONS_SNAPSHOT_ID);
  const competitionSnapshot = competitionsSnapshot?.find(
    (competition) => competition.id === id,
  );

  if (competitionSnapshot) {
    if (globalThis.navigator.onLine) {
      void refreshCompetitionSnapshot(id).catch(() => undefined);
    }

    return competitionSnapshot as Competition;
  }

  return refreshCompetitionSnapshot(id);
};

const competitionQuery = defineQuery({
  fetcher: fetchCompetition,
  queryKey: (id: string) => ["competition", id] as const,
});

const toCompetitionStage = (
  stage: CompetitionStage,
  previousStage?: Stage,
): Stage => ({
  dateFrom: stage.dateFrom ?? previousStage?.dateFrom ?? 0,
  dateTo: stage.dateTo ?? previousStage?.dateTo ?? 0,
  events: previousStage?.events ?? [],
  id: stage.id ?? previousStage?.id ?? globalThis.crypto.randomUUID(),
  name: stage.name ?? previousStage?.name ?? "",
});

const toCompetitionLocation = (
  location?: CompetitionLocation,
  previousLocation?: CompetitionLocation,
): CompetitionLocation | undefined => {
  if (!location && !previousLocation) return undefined;

  return {
    address: location?.address ?? previousLocation?.address,
    latitude: location?.latitude ?? previousLocation?.latitude,
    longitude: location?.longitude ?? previousLocation?.longitude,
  };
};

const mergeCompetitionWithPayload = (
  payload: PostCompetition,
  previousCompetition?: Competition,
): Competition => {
  const previousStagesById = new Map(
    (previousCompetition?.stages ?? []).map((stage) => [stage.id, stage]),
  );

  return {
    country: payload.country ?? previousCompetition?.country ?? "",
    description: payload.description ?? previousCompetition?.description,
    id: payload.id ?? previousCompetition?.id ?? globalThis.crypto.randomUUID(),
    location: toCompetitionLocation(
      payload.location,
      previousCompetition?.location,
    ),
    name: payload.name ?? previousCompetition?.name ?? "",
    notifications: previousCompetition?.notifications,
    stages:
      payload.stages?.map((stage) =>
        toCompetitionStage(
          stage,
          stage.id ? previousStagesById.get(stage.id) : undefined,
        ),
      ) ?? previousCompetition?.stages,
    status: previousCompetition?.status ?? DRAFT_COMPETITION_STATUS,
  };
};

const toCompetitionListItem = (
  competition: Competition,
  previousCompetition?: Competitions,
): Competitions => ({
  country: competition.country,
  description:
    competition.description ?? previousCompetition?.description ?? "",
  id: competition.id,
  location: competition.location
    ? ({
        address: competition.location.address,
        latitude: competition.location.latitude,
        longitude: competition.location.longitude,
      } satisfies CompetitionLocation)
    : previousCompetition?.location,
  name: competition.name,
  stages:
    competition.stages?.map(
      (stage): CompetitionListStage => ({
        dateFrom: stage.dateFrom,
        dateTo: stage.dateTo,
        id: stage.id,
        name: stage.name,
      }),
    ) ??
    previousCompetition?.stages ??
    [],
  status:
    competition.status ??
    previousCompetition?.status ??
    DRAFT_COMPETITION_STATUS,
});

const upsertCompetitionInListCache = (competition: Competition) => {
  const listKey = getCompetitionsListKey();

  queryClient.setQueryData<Competitions[] | undefined>(
    listKey,
    (previousCompetitions) => {
      if (!previousCompetitions) return previousCompetitions;

      const nextCompetition = toCompetitionListItem(
        competition,
        previousCompetitions.find(({ id }) => id === competition.id),
      );
      const existingIndex = previousCompetitions.findIndex(
        ({ id }) => id === competition.id,
      );

      if (existingIndex === -1) {
        return [nextCompetition, ...previousCompetitions];
      }

      return previousCompetitions.map((previousCompetition) =>
        previousCompetition.id === competition.id
          ? nextCompetition
          : previousCompetition,
      );
    },
  );
};

const removeCompetitionFromListCache = (id: string) => {
  const listKey = getCompetitionsListKey();

  queryClient.setQueryData<Competitions[] | undefined>(
    listKey,
    (previousCompetitions) => {
      if (!previousCompetitions) return previousCompetitions;
      return previousCompetitions.filter(
        (competition) => competition.id !== id,
      );
    },
  );
};

const persistCompetitionSnapshot = async (competition: Competition) => {
  const previousCompetitions =
    (await getQuerySnapshot<Competitions[]>(COMPETITIONS_SNAPSHOT_ID)) ?? [];
  const nextCompetition = toCompetitionListItem(
    competition,
    previousCompetitions.find(({ id }) => id === competition.id),
  );
  const existingIndex = previousCompetitions.findIndex(
    ({ id }) => id === competition.id,
  );

  const nextCompetitions =
    existingIndex === -1
      ? [nextCompetition, ...previousCompetitions]
      : previousCompetitions.map((previousCompetition) =>
          previousCompetition.id === competition.id
            ? nextCompetition
            : previousCompetition,
        );

  await saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, nextCompetitions);
};

const removeCompetitionSnapshot = async (id: string) => {
  const previousCompetitions =
    (await getQuerySnapshot<Competitions[]>(COMPETITIONS_SNAPSHOT_ID)) ?? [];
  const nextCompetitions = previousCompetitions.filter(
    (competition) => competition.id !== id,
  );

  await saveQuerySnapshot(COMPETITIONS_SNAPSHOT_ID, nextCompetitions);
};

const enqueueCompetitionTask = async ({
  entityId,
  method,
  payload,
  url,
}: {
  entityId: string;
  method: PendingTaskMethod;
  payload?: unknown;
  url: string;
}) => {
  const timestamp = Date.now();

  await enqueuePendingTask({
    attemptCount: 0,
    entityId,
    entityType: "competition",
    id: createPendingTaskId({
      entityId,
      entityType: "competition",
      method,
      timestamp,
    }),
    method,
    payload,
    status: "pending",
    timestamp,
    updatedAt: timestamp,
    url,
  });
};

export const createDefaultCompetition = (): PostCompetition => ({
  country: "pt",
  id: globalThis.crypto.randomUUID(),
  name: "--Default competition",
});

export const useCompetition = () => {
  const getCompetition = (
    id: string,
    options?: TanstackCreateQuery,
  ): CreateQueryResult<Competition, Error> =>
    competitionQuery.useQuery([id], {
      gcTime: options?.gcTime,
      refetchOnMount: options?.refetchOnMount,
      staleTime: options?.staleTime,
    });

  const createCompetition = (payload: PostCompetition) => {
    const detailKey = getCompetitionDetailKey(payload.id ?? "");
    const draftCompetition = mergeCompetitionWithPayload(payload);

    queryClient.setQueryData(detailKey, draftCompetition);
    upsertCompetitionInListCache(draftCompetition);
    void persistCompetitionSnapshot(draftCompetition);

    void enqueueCompetitionTask({
      entityId: draftCompetition.id,
      method: "POST",
      payload,
      url: "/api/competitions",
    }).then(() => processPendingTasks());
  };

  const updateCompetition = (payload: PostCompetition) => {
    if (!payload.id) {
      throw new Error("updateCompetition requires an id");
    }

    const detailKey = getCompetitionDetailKey(payload.id);
    const previousCompetition =
      queryClient.getQueryData<Competition>(detailKey);
    const nextCompetition = mergeCompetitionWithPayload(
      payload,
      previousCompetition,
    );

    queryClient.setQueryData(detailKey, nextCompetition);
    upsertCompetitionInListCache(nextCompetition);
    void persistCompetitionSnapshot(nextCompetition);

    void enqueueCompetitionTask({
      entityId: payload.id,
      method: "PUT",
      payload,
      url: `/api/competitions/${payload.id}`,
    }).then(() => processPendingTasks());
  };

  const deleteCompetition = (id: string) => {
    const detailKey = getCompetitionDetailKey(id);

    queryClient.removeQueries({ queryKey: detailKey, exact: true });
    removeCompetitionFromListCache(id);
    void removeCompetitionSnapshot(id);

    void enqueueCompetitionTask({
      entityId: id,
      method: "DELETE",
      url: `/api/competitions/${id}`,
    }).then(() => processPendingTasks());
  };

  return {
    createCompetition,
    deleteCompetition,
    getCompetition,
    updateCompetition,
  };
};

export interface Competition {
  country: string;
  description?: string;
  id: string;
  location?: CompetitionLocation;
  name: string;
  notifications?: Notification[];
  stages?: Stage[];
  status: string;
}

export interface PostCompetition {
  country?: string;
  description?: string;
  id?: string;
  location?: CompetitionLocation;
  name?: string;
  stages?: CompetitionStage[];
}

export interface CompetitionLocation {
  address?: string;
  latitude?: number;
  longitude?: number;
}

interface Notification {
  date: number;
  id: string;
  text: string;
}

interface Stage {
  dateFrom: number;
  dateTo: number;
  events: Event[];
  id: string;
  name: string;
}

interface Event {
  competitors?: Competitor[];
  configuration?: EventConfiguration;
  discipline: string;
  exercises: Exercise[];
  id: string;
  judges?: Judge[];
  name: string;
  status: string;
}

interface Competitor {
  finalScore: number;
  id: string;
  identity: string;
  name: string;
  owner: string;
  scores: EventScore[];
}

interface EventScore {
  exerciseId: string;
  id: string;
  score: number;
}

interface EventConfiguration {
  federation: string;
  id: string;
  name: string;
  version: number;
}

interface Exercise {
  id: string;
  order: number;
  text: string;
}

interface Judge {
  collectorEmail: string;
  name?: string;
}
