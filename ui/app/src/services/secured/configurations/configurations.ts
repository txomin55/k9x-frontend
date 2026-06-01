import { rawRequest } from "@/utils/http/client";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { queryClient } from "@/utils/http/query-client";
import type { DisciplineFederationConfigurationResponseDTO } from "./configurations.types";

export { EMPTY_FEDERATION_CONFIGURATION } from "./configurations.types";

const fetchConfigurations = (disciplineId: string) =>
  rawRequest<DisciplineFederationConfigurationResponseDTO>({
    path: `/secured/disciplines/${disciplineId}/configurations`,
  });

const configurationsQuery = defineQuery({
  fetcher: fetchConfigurations,
  queryKey: (disciplineId: string) => ["configurations", disciplineId] as const,
});

export const getConfigurationsQueryKey = (disciplineId: string) =>
  configurationsQuery.options(disciplineId).queryKey;

export const useConfigurations = (
  disciplineId: string,
  options?: TanstackCreateQuery,
) =>
  configurationsQuery.useQuery([disciplineId], {
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
    enabled: !!disciplineId,
  });

export const getConfigurationsFromCache = (disciplineId: string) =>
  queryClient.getQueryData<DisciplineFederationConfigurationResponseDTO>(
    getConfigurationsQueryKey(disciplineId),
  );
