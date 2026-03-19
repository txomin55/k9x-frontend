import UserResponse from "@/services/fetch_user_data/UserResponse";
import {rawRequest} from "@/utils/http/client";
import {queryClient} from "@/utils/http/query-client";
import {defineQuery} from "@/utils/http/query-factory";

const USER_ENDPOINT_PATH = "/api/user";

export type UserDetails = {
  news?: string[];
  organizations?: string[];
  owner: string;
};

const fetchUserData = async () => {
  const rawUser = await rawRequest<UserDetails>({
    auth: true,
    path: USER_ENDPOINT_PATH,
  });
  return UserResponse(rawUser);
};

export const userQuery = defineQuery({
  fetcher: fetchUserData,
  queryKey: ["user"] as const,
});

export const fetchCachedUserData = () =>
  queryClient.fetchQuery(userQuery.options());

export const clearCachedUserData = () =>
  queryClient.removeQueries({ queryKey: userQuery.key });
