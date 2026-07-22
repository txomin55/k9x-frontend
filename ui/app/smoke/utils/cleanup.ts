import fs from "node:fs";
import { request } from "@playwright/test";
import { ACCESS_TOKEN_KEY, SMOKE_API_URL, SMOKE_STATE_PATH } from "./constants";

export type CreatedEntities = {
  competitionIds: string[];
  judgeIds: string[];
  dogIds: string[];
};

export const newRegistry = (): CreatedEntities => ({
  competitionIds: [],
  judgeIds: [],
  dogIds: [],
});

const storedToken = (): string | null => {
  if (!fs.existsSync(SMOKE_STATE_PATH)) return null;
  const state = JSON.parse(fs.readFileSync(SMOKE_STATE_PATH, "utf-8"));
  for (const origin of state.origins ?? []) {
    const entry = (origin.localStorage ?? []).find(
      (item: { name: string }) => item.name === ACCESS_TOKEN_KEY,
    );
    if (entry?.value) return entry.value;
  }
  return null;
};

export const cleanup = async (entities: CreatedEntities) => {
  const api = await request.newContext({
    baseURL: SMOKE_API_URL,
    storageState: SMOKE_STATE_PATH,
  });

  let token = storedToken();
  const refreshed = await api
    .post("/refresh")
    .then((response) => (response.ok() ? response.text() : null))
    .catch(() => null);
  if (refreshed) token = refreshed.trim();

  const remove = async (path: string) => {
    try {
      await api.delete(path, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      /* best-effort cleanup */
    }
  };

  // Deletes the created entities. A competition whose event has been scored is
  // STARTED, and the backend refuses to delete it (412 "no se puede eliminar en
  // su estado actual") — those from the scoring/visitor journeys are left
  // behind; everything else (judges, dogs, non-started competitions and their
  // cascade of stages/events) is removed.
  for (const id of entities.competitionIds) {
    await remove(`/secured/competitions/${id}`);
  }
  for (const id of entities.dogIds) {
    await remove(`/secured/dogs/${id}`);
  }
  for (const id of entities.judgeIds) {
    await remove(`/secured/judges/${id}`);
  }

  await api.dispose();
};
