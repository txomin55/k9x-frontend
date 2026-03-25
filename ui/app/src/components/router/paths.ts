export enum AppRoutePath {
  HOME = "/",
  AUTH_CALLBACK = "/auth/callback",
  MY_COMPETITIONS = "/my-competitions",
  COMPETITION_DETAIL = "/my-competitions/$id",
  NOT_FOUND = "/404.html",
}

export const trimLeadingSlash = (path: AppRoutePath) => path.slice(1);
