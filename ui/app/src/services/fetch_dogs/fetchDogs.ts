import { defineQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";

const DOGS_ENDPOINT_PATH = "/dogs";

export type Dog = {
  id?: string;
  image?: string;
  name?: string;
};

type UseDogsOptions = {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
};

const fetchDogs = () =>
  rawRequest<Dog[]>({
    path: DOGS_ENDPOINT_PATH,
  });

const dogsQuery = defineQuery({
  fetcher: fetchDogs,
  queryKey: ["dogs"] as const,
});

export const useDogs = (options?: UseDogsOptions) =>
  dogsQuery.useQuery({
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
  });
