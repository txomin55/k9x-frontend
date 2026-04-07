import { getCurrentLocale } from "@/stores/i18n";
import { defineQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import type { Stage } from "@/services/fetch-stages/fetchStages.types";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";

export type {
  Stage,
  StageEvent,
} from "@/services/fetch-stages/fetchStages.types";

const STAGES_SNAPSHOT_ID = "stages";

export const getStagesQueryKey = () => ["stages", getCurrentLocale()] as const;

const fetchStages = () =>
  fetchWithOfflineSnapshot(STAGES_SNAPSHOT_ID, () =>
    rawRequest<Stage[]>({
      path: "/stages",
    }),
  );

const stagesQuery = defineQuery({
  fetcher: fetchStages,
  queryKey: ["stages"] as const,
});

export const useStages = (options?: TanstackCreateQuery) =>
  stagesQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
  });
