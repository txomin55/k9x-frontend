import { rawRequest } from "@/utils/http/client";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { queryClient } from "@/utils/http/query-client";
import type { DisciplineFederationConfigurations } from "./configurations.types";

export type {
  DisciplineFederationConfigurations,
  Configuration,
  Federation,
} from "./configurations.types";

const fetchConfigurations = () =>
  rawRequest<DisciplineFederationConfigurations[]>({
    path: "/api/disciplines/configurations",
  }).then((d) => {
    d[0].disciplineId = "fci_ob";

    return d;
  });

const configurationsQuery = defineQuery({
  fetcher: fetchConfigurations,
  queryKey: ["configurations"] as const,
});

export const getConfigurationsQueryKey = () =>
  configurationsQuery.options().queryKey;

const createConfigurationsQuery = (options?: TanstackCreateQuery) =>
  configurationsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  } as any);

export const useConfigurations = (options?: TanstackCreateQuery) =>
  createConfigurationsQuery(options);

export const prefetchConfigurations = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = configurationsQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};
