import { loginWithToken } from "@/utils/http/client";
import { defineMutation } from "@/utils/http/query-factory";
import type { LoginRequest } from "@/services/api/do_login/doLogin.types";

export type { LoginRequest } from "@/services/api/do_login/doLogin.types";

const doLogin = (data: LoginRequest) => loginWithToken(data);

const loginMutation = defineMutation({
  mutate: doLogin,
});

export const useLogin = () => loginMutation.useMutation();
