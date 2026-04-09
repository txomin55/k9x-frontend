export enum AppRoutePath {
  HOME = "/",
  AUTH_CALLBACK = "/auth/callback",
  MY_COMPETITIONS = "/my/competitions",
  COMPETITION_DETAIL = "/my/competitions/$id",
  COMPETITION_STAGE_DETAIL = "/my/competitions/$id/stages/$stageId",
  COMPETITION_EVENT_DETAIL = "/my/competitions/$id/stages/$stageId/events/$eventId",
  NOT_FOUND = "/404.html",
}

export const trimLeadingSlash = (path: AppRoutePath) => path.slice(1);
