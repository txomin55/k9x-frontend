import { getCurrentLocale } from "@/stores/i18n";
import UserResponse from "@/services/api/fetch_user_data/UserResponse";
import { rawRequest } from "@/utils/http/client";
import { queryClient } from "@/utils/http/query-client";
import { defineQuery } from "@/utils/http/query-factory";
import { fetchWithOfflineSnapshot } from "@/utils/local_first/query_snapshots/querySnapshotFetch";
import type { PublicUserProfile } from "@/services/api/fetch_user_data/fetchUserData.types";

export type { PublicUserProfile, UserModel } from "@/services/api/fetch_user_data/fetchUserData.types";

const USER_SNAPSHOT_ID = "user";

export const getUserQueryKey = () => ["user", getCurrentLocale()] as const;

const fetchUserData = async () =>
  await fetchWithOfflineSnapshot(USER_SNAPSHOT_ID, async () => {
    const rawUser = await rawRequest<PublicUserProfile>({
      auth: true,
      path: "/api/user",
    });

    return UserResponse(rawUser);
  });

export const userQuery = defineQuery({
  fetcher: fetchUserData,
  queryKey: ["user"] as const,
});

export const fetchCachedUserData = () =>
  queryClient.fetchQuery(userQuery.options());

export const clearCachedUserData = () =>
  queryClient.removeQueries({ exact: true, queryKey: getUserQueryKey() });
