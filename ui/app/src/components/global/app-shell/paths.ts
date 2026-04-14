export enum AppRoutePath {
  HOME = "/",
  AUTH_CALLBACK = "/auth/callback",
  MY_COMPETITIONS = "/my/competitions",
  MY_JUDGES = "/my/judges",
  MY_DOGS = "/my/dogs",
  COMPETITION_DETAIL = "/my/competitions/$id",
  COMPETITION_STAGE_DETAIL = "/my/competitions/$id/stages/$stageId",
  COMPETITION_EVENT_DETAIL = "/my/competitions/$id/stages/$stageId/events/$eventId",
  NOT_FOUND = "/404.html",
  MY_COLLECTIONS = "/my/collections",
  COLLECTION_DETAIL = "/my/collections/$id",
}
