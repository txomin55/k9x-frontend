import { expect, type BrowserContext, type Page } from "@playwright/test";

const LOCAL_FIRST_DB = "k9x-local-first";
const PENDING_TASKS_STORE = "pending_tasks";
const OFFLINE_INDICATOR_TEXT = "Offline";

export interface PendingTaskRecord {
  entityType: string;
  method: string;
  url: string;
  status: string;
}

/** Reads the offline mutation queue persisted in IndexedDB. */
export const readPendingTasks = (page: Page) =>
  page.evaluate(
    ({ db, store }) =>
      new Promise<PendingTaskRecord[]>((resolve, reject) => {
        const request = indexedDB.open(db);
        request.onsuccess = () => {
          const database = request.result;
          if (!database.objectStoreNames.contains(store)) {
            resolve([]);
            return;
          }
          const all = database
            .transaction(store, "readonly")
            .objectStore(store)
            .getAll();
          all.onsuccess = () => resolve(all.result as PendingTaskRecord[]);
          all.onerror = () => reject(all.error);
        };
        request.onerror = () => reject(request.error);
      }),
    { db: LOCAL_FIRST_DB, store: PENDING_TASKS_STORE },
  );

/** Records the URLs of requests matching a method + url substring as they fire. */
export const trackRequests = (
  page: Page,
  match: { method: string; urlIncludes: string },
) => {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() === match.method &&
      request.url().includes(match.urlIncludes)
    ) {
      urls.push(request.url());
    }
  });
  return urls;
};

export const goOffline = async (page: Page, context: BrowserContext) => {
  await context.setOffline(true);
  await expect(page.getByText(OFFLINE_INDICATOR_TEXT)).toBeVisible();
};

export const goOnline = (context: BrowserContext) => context.setOffline(false);

export interface LocalFirstWriteOptions {
  /** Identifies the mutation request to assert it is queued, not sent, while offline. */
  mutation: { method: string; urlIncludes: string };
  /** `entityType` of the queued PendingTask (e.g. "stage-enroll"). */
  entityType: string;
  /** Triggers the write (click buttons, fill forms, confirm). */
  performMutation: () => Promise<void>;
  /** Asserts the optimistic result is visible (with no server round-trip yet). */
  assertOptimistic: () => Promise<void>;
  /** Asserts the result after a reload. Defaults to `assertOptimistic`. */
  assertRehydrated?: () => Promise<void>;
}

/**
 * Drives and validates a local-first write end to end:
 * 1. optimistic UI updates offline with no network call,
 * 2. the mutation accumulates as a pending task,
 * 3. it flushes to the server on reconnect,
 * 4. the result survives a reload (rehydration).
 *
 * The caller must have already navigated to the page under test and set up any
 * stateful server mocks so the post-flush reload reflects the write.
 */
export const verifyLocalFirstWrite = async (
  page: Page,
  context: BrowserContext,
  options: LocalFirstWriteOptions,
) => {
  const mutationRequests = trackRequests(page, options.mutation);

  await goOffline(page, context);
  await options.performMutation();

  await options.assertOptimistic();
  expect(mutationRequests).toHaveLength(0);

  const pending = await readPendingTasks(page);
  expect(
    pending.filter((task) => task.entityType === options.entityType),
  ).not.toHaveLength(0);

  await goOnline(context);
  await expect.poll(() => mutationRequests.length).toBeGreaterThan(0);

  await page.reload();
  await (options.assertRehydrated ?? options.assertOptimistic)();
};
