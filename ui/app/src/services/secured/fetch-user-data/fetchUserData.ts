import { getCurrentLocale } from "@/stores/i18n/i18n";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery } from "@/utils/http/query-factory";
import { fetchWithOfflineSnapshot } from "@/utils/local-first/query_snapshots/querySnapshotFetch";
import type { UserProfileResponseDTO } from "@/services/secured/fetch-user-data/fetchUserData.types";

export type {
  UserProfileResponseDTO,
  UserModel,
} from "@/services/secured/fetch-user-data/fetchUserData.types";

const USER_SNAPSHOT_ID = "user";

export const getUserQueryKey = () => ["user", getCurrentLocale()] as const;

const fetchUserData = async () =>
  await fetchWithOfflineSnapshot(USER_SNAPSHOT_ID, async () => {
    return await rawRequest<UserProfileResponseDTO>({
      auth: true,
      path: "/secured/user",
    });
  });

export const userQuery = defineQuery({
  fetcher: fetchUserData,
  queryKey: ["user"] as const,
});

export const fetchCachedUserData = () =>
  queryClient.fetchQuery(userQuery.options());

export const clearCachedUserData = () =>
  queryClient.removeQueries({ exact: true, queryKey: getUserQueryKey() });
