import { getCompetitionsQueryKey } from "@/services/api/competition_crud/competitionCrud";
import { getUserQueryKey } from "@/services/api/fetch_user_data/fetchUserData";
import { getStagesQueryKey } from "@/services/fetch_stages/fetchStages";
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
