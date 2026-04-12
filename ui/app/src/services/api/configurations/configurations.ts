import { rawRequest } from "@/utils/http/client";
import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { queryClient } from "@/utils/http/query-client";
import type { FederationDiscipline } from "./configurations.types";

export type {
  FederationDiscipline,
  Configuration,
  Federation,
} from "./configurations.types";

const fetchConfigurations = () =>
  rawRequest<FederationDiscipline[]>({
    path: "/api/disciplines/configurations",
  });

const configurationsQuery = defineQuery({
  fetcher: fetchConfigurations,
  queryKey: ["configurations"] as const,
});

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
