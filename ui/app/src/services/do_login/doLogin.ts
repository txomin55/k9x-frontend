import { loginWithToken } from "@/utils/http/client";
import { defineMutation } from "@/utils/http/query-factory";

export type LoginRequest = {
  idToken: string;
};

const doLogin = (data: LoginRequest) => loginWithToken(data);

const loginMutation = defineMutation({
  mutate: doLogin,
});

export const useLogin = () => loginMutation.useMutation();
