import { createQuery } from "@tanstack/solid-query";
import { resolveAppPath } from "@/utils/paths/app-paths";
import type { K9xMethodology, ObdxMethodology } from "./types";

const fetchMethodology = async <TData>(name: string): Promise<TData> => {
  const response = await fetch(resolveAppPath(`/methodology/${name}.json`));

  if (!response.ok) {
    throw new Error(`Unable to load the ${name} methodology data`);
  }

  return (await response.json()) as TData;
};

const staticDocumentQuery = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: Number.POSITIVE_INFINITY,
  retry: 1,
};

export const useObdxMethodology = () =>
  createQuery(() => ({
    queryKey: ["methodology", "obdx"],
    queryFn: () => fetchMethodology<ObdxMethodology>("obdx"),
    ...staticDocumentQuery,
  }));

export const useK9xMethodology = () =>
  createQuery(() => ({
    queryKey: ["methodology", "k9x"],
    queryFn: () => fetchMethodology<K9xMethodology>("k9x"),
    ...staticDocumentQuery,
  }));
