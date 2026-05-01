import { getCompetitionsQueryKey } from "@/services/secured/competition-crud/competitionCrud";
import { getUserQueryKey } from "@/services/secured/fetch-user-data/fetchUserData";
import { getStagesQueryKey } from "@/services/fetch-stages/fetchStages";
import { queryClient } from "@/utils/http/query-client";

export const clearLocalFirstQueryCache = () => {
  for (const queryKey of [
    getUserQueryKey(),
    getStagesQueryKey(),
    getCompetitionsQueryKey(),
  ]) {
    queryClient.removeQueries({ exact: true, queryKey });
  }
};
