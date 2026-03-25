import { defineQuery, TanstackCreateQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";

const fetchCompetition = (id: string) =>
  rawRequest<Competition>({
    path: `/api/competitions/${id}`,
  });

const competitionQuery = defineQuery({
  fetcher: fetchCompetition,
  queryKey: (id: string) => ["competition", id] as const,
});

export const useCompetition = (id: string, options?: TanstackCreateQuery) =>
  competitionQuery.useQuery([id], {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
  });

export interface Competition {
  country: string;
  description?: string;
  id: string;
  location?: Location;
  name: string;
  notifications?: Notification[];
  stages?: Stage[];
  status: string;
}

interface Location {
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
