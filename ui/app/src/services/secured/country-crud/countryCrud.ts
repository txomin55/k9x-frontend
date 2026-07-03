import { defineQuery } from "@/utils/http/query-factory";
import type { TanstackCreateQuery } from "@/utils/http/query-factory.types";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import { saveQuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshotsStore";
import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { COUNTRIES_SNAPSHOT_ID, getCountriesQueryKey } from "./countryCrudConstants";

const refreshCountriesSnapshot = async () => {
  const countries = await rawRequest<IdNameDTO[]>({
    path: "/secured/countries",
  });

  await saveQuerySnapshot(COUNTRIES_SNAPSHOT_ID, countries);
  queryClient.setQueryData(getCountriesQueryKey(), countries);

  return countries;
};

const fetchCountries = () =>
  fetchWithOfflineSnapshot(COUNTRIES_SNAPSHOT_ID, refreshCountriesSnapshot);

const countriesQuery = defineQuery({
  fetcher: fetchCountries,
  queryKey: ["countries"] as const,
});

export const prefetchCountries = (options?: TanstackCreateQuery) => {
  const { queryFn, queryKey } = countriesQuery.options();

  return queryClient.fetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
  });
};

export const useCountries = (options?: TanstackCreateQuery) =>
  countriesQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    networkMode: "always",
    refetchOnMount: options?.refetchOnMount,
  });

export const getCachedCountries = () =>
  queryClient.getQueryData<IdNameDTO[]>(getCountriesQueryKey());
