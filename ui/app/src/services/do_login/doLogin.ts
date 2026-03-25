import { loginWithToken } from "@/utils/http/client";
import { defineMutation } from "@/utils/http/query-factory";

const doLogin = (data: LoginRequest) => loginWithToken(data);

const loginMutation = defineMutation({
  mutate: doLogin,
});

export const useLogin = () => loginMutation.useMutation();

export type LoginRequest = {
  idToken: string;
};
