import { loginWithToken } from "@/utils/http/client";
import { defineMutation } from "@/utils/http/query-factory";
import type { LoginRequestDTO } from "@/services/secured/do-login/doLogin.types";

export type { LoginRequestDTO } from "@/services/secured/do-login/doLogin.types";

const doLogin = (data: LoginRequestDTO) => loginWithToken(data);

const loginMutation = defineMutation({
  mutate: doLogin,
});

export const useLogin = () => loginMutation.useMutation();
