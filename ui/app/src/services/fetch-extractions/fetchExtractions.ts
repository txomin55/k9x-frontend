import { defineQuery } from "@/utils/http/query-factory";
import { rawRequest } from "@/utils/http/client";
import type { ExtractionLogDayResponseDTO } from "@/services/fetch-extractions/fetchExtractions.types";

const fetchExtractionLog = () =>
  rawRequest<ExtractionLogDayResponseDTO[]>({ path: "/extractions" });

const extractionLogQuery = defineQuery({
  fetcher: fetchExtractionLog,
  queryKey: ["extraction-log"] as const,
});

/** Newest import day first, as the backend sends it. */
export const useExtractionLog = () =>
  extractionLogQuery.useQuery({ staleTime: 5 * 60 * 1000 });
