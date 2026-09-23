import { createQuery } from "@tanstack/solid-query";
import { rawRequest } from "@/utils/http/client";
import type { K9xMethodology, ObdxMethodology } from "./types";

/**
 * The backend assembles both documents from the rules that compute the rank, so they only change with a deploy;
 * it serves them with `Cache-Control: public, max-age=86400`, and the query keeps them fresh for as long.
 */
const METHODOLOGY_STALE_TIME = 24 * 60 * 60 * 1000;

const methodologyQuery = {
  staleTime: METHODOLOGY_STALE_TIME,
  retry: 1,
};

export const useObdxMethodology = () =>
  createQuery(() => ({
    queryKey: ["methodology", "obdx"],
    queryFn: () => rawRequest<ObdxMethodology>({ path: "/obdx/methodology" }),
    ...methodologyQuery,
  }));

export const useK9xMethodology = () =>
  createQuery(() => ({
    queryKey: ["methodology", "k9x"],
    queryFn: () => rawRequest<K9xMethodology>({ path: "/k9x/methodology" }),
    ...methodologyQuery,
  }));
