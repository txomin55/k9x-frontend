export const ACCESS_TOKEN_KEY = "k9x_access_token";

export const SMOKE_STATE_PATH = ".auth/smoke-state.json";

export const SMOKE_API_URL =
  process.env.SMOKE_API_URL ?? "http://localhost:4000";

const rawRunId = process.env.SMOKE_RUN_ID ?? `${Date.now()}`;

export const RUN_ID = rawRunId;

let sequence = 0;
export const named = (label: string) => `${label} ${RUN_ID}-${++sequence}`;

export const GOOGLE_LOGIN_TIMEOUT = 240_000;
