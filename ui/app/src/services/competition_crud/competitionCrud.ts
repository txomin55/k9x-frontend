import { type CreateQueryResult } from "@tanstack/solid-query";
import {
  type Competitions,
  CompetitionStage,
  type CompetitionStage as CompetitionListStage
} from "@/services/fetch_competitions/fetchCompetitions";
import { getCurrentLocale } from "@/stores/i18n";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery, type TanstackCreateQuery } from "@/utils/http/query-factory";

const DRAFT_COMPETITION_STATUS = "draft";

const fetchCompetition = (id: string) =>
  rawRequest<Competition>({
    path: `/api/competitions/${id}`,
  });

const postCompetition = (payload: PostCompetition) =>
  rawRequest<string>({
    body: payload,
    method: "POST",
    path: "/api/competitions",
  });

const putCompetition = (payload: PostCompetition) =>
  rawRequest<void>({
    body: payload,
    method: "PUT",
    path: `/api/competitions/${payload.id}`,
  });

const deleteCompetitionRequest = (id: string) =>
  rawRequest<void>({
    method: "DELETE",
    path: `/api/competitions/${id}`,
  });

const competitionQuery = defineQuery({
  fetcher: fetchCompetition,
  queryKey: (id: string) => ["competition", id] as const,
});

const getCompetitionDetailKey = (id: string) =>
  [...competitionQuery.key(id), getCurrentLocale()] as const;

const getCompetitionsListKey = () =>
  ["competitions", getCurrentLocale()] as const;

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

    void postCompetition(payload);
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

    void putCompetition(payload);
  };

  const deleteCompetition = (id: string) => {
    const detailKey = getCompetitionDetailKey(id);

    queryClient.removeQueries({ queryKey: detailKey, exact: true });
    removeCompetitionFromListCache(id);

    void deleteCompetitionRequest(id);
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
