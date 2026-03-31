import { loginWithToken } from "@/utils/http/client";
import { defineMutation } from "@/utils/http/query-factory";
import type { PostLoginWeb } from "@/services/api/do_login/doLogin.types";

export type { LoginRequest, PostLoginWeb } from "@/services/api/do_login/doLogin.types";

const doLogin = (data: PostLoginWeb) => loginWithToken(data);

const loginMutation = defineMutation({
  mutate: doLogin,
});

export const useLogin = () => loginMutation.useMutation();
