export const ACCESS_TOKEN_KEY = "k9x_access_token";

export const SMOKE_STATE_PATH = ".auth/smoke-state.json";

export const SMOKE_CREDENTIALS_PATH =
  process.env.SMOKE_CREDENTIALS_FILE ?? ".auth/credentials.json";

export const SMOKE_API_URL =
  process.env.SMOKE_API_URL ?? "http://localhost:4000";

const pad = (value: number) => String(value).padStart(2, "0");

const readableRunId = () => {
  const now = new Date();
  return `${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

export const RUN_ID = process.env.SMOKE_RUN_ID ?? readableRunId();

const sequences = new Map<string, number>();
export const named = (label: string) => {
  const next = (sequences.get(label) ?? 0) + 1;
  sequences.set(label, next);
  return `${label} ${next} (${RUN_ID})`;
};

export const GOOGLE_LOGIN_TIMEOUT = 240_000;
