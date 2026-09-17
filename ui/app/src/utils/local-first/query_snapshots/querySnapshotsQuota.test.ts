import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuerySnapshot } from "@/utils/local-first/query_snapshots/querySnapshots.types";

const rows = vi.hoisted(() => new Map<string, QuerySnapshot>());

const fakeTable = vi.hoisted(() => {
  const sortedBy = (key: "lastReadAt" | "updatedAt") =>
    [...rows.values()].sort((one, other) => one[key] - other[key]);

  const collection = (matches: () => QuerySnapshot[]) => ({
    count: () => Promise.resolve(matches().length),
    delete: () => {
      const doomed = matches();
      for (const row of doomed) rows.delete(row.id);
      return Promise.resolve(doomed.length);
    },
    limit: (max: number) =>
      collection(() => matches().slice(0, max)) as ReturnType<
        typeof collection
      >,
    primaryKeys: () => Promise.resolve(matches().map((row) => row.id)),
  });

  return {
    get: (id: string) => Promise.resolve(rows.get(id)),
    put: (row: QuerySnapshot) => {
      rows.set(row.id, row);
      return Promise.resolve(row.id);
    },
    update: (id: string, changes: Partial<QuerySnapshot>) => {
      const row = rows.get(id);
      if (row) rows.set(id, { ...row, ...changes });
      return Promise.resolve(row ? 1 : 0);
    },
    delete: (id: string) => {
      rows.delete(id);
      return Promise.resolve();
    },
    bulkDelete: (ids: string[]) => {
      for (const id of ids) rows.delete(id);
      return Promise.resolve();
    },
    orderBy: (index: "prefix") => ({
      uniqueKeys: () =>
        Promise.resolve([
          ...new Set(
            [...rows.values()]
              .map((row) => row[index])
              .filter((key): key is string => key !== undefined),
          ),
        ]),
    }),
    where: (_index: string) => ({
      below: (cutoff: number) =>
        collection(() =>
          sortedBy("updatedAt").filter((row) => row.updatedAt < cutoff),
        ),
      between: ([prefix]: [string, number], _end: [string, number]) =>
        collection(() =>
          sortedBy("lastReadAt").filter((row) => row.prefix === prefix),
        ),
      startsWith: (prefix: string) =>
        collection(() =>
          sortedBy("lastReadAt").filter((row) => row.id.startsWith(prefix)),
        ),
    }),
  };
});

vi.mock("@/utils/local-first/storage/localFirstDatabase", () => ({
  LOCAL_FIRST_STORE_NAMES: { querySnapshots: "query_snapshots" },
  getLocalFirstTable: () => Promise.resolve(fakeTable),
}));

vi.mock("@/utils/local-first/localFirstPolicy", () => ({
  shouldPersistLocalFirstData: () => true,
  shouldReadFromIndexedDb: () => true,
}));

import {
  QUERY_SNAPSHOTS_PER_PREFIX,
  QUERY_SNAPSHOT_LIST_WINDOW,
  enforceQuerySnapshotQuotas,
  getQuerySnapshot,
  saveQuerySnapshot,
  saveWholeQuerySnapshot,
} from "@/utils/local-first/query_snapshots/querySnapshotsStore";

const idsWithPrefix = (prefix: string) =>
  [...rows.keys()].filter((id) => id.startsWith(prefix));

const fillFamily = async (prefix: string, count: number) => {
  for (let index = 0; index < count; index += 1) {
    vi.setSystemTime(new Date(2026, 0, 1, 0, 0, index));
    await saveQuerySnapshot(`${prefix}${index}`, { index });
  }
};

describe("query snapshot quotas", () => {
  beforeEach(() => {
    rows.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1));
  });

  it("keeps a family within its budget, dropping the least recently read", async () => {
    await fillFamily("stage:", QUERY_SNAPSHOTS_PER_PREFIX + 3);

    expect(idsWithPrefix("stage:")).toHaveLength(QUERY_SNAPSHOTS_PER_PREFIX);
    expect(rows.has("stage:0")).toBe(false);
    expect(rows.has("stage:2")).toBe(false);
    expect(rows.has("stage:3")).toBe(true);
  });

  it("spares a snapshot that was read recently", async () => {
    await fillFamily("stage:", QUERY_SNAPSHOTS_PER_PREFIX);

    vi.setSystemTime(new Date(2026, 0, 2));
    await getQuerySnapshot("stage:0");

    vi.setSystemTime(new Date(2026, 0, 3));
    await saveQuerySnapshot("stage:extra", { index: -1 });

    expect(rows.has("stage:0")).toBe(true);
    expect(rows.has("stage:1")).toBe(false);
  });

  it("gives each family its own budget", async () => {
    await fillFamily("stage:", QUERY_SNAPSHOTS_PER_PREFIX + 5);
    await fillFamily("ranking:", 3);

    expect(idsWithPrefix("ranking:")).toHaveLength(3);
  });

  it("never evicts a snapshot that is not part of a family", async () => {
    await saveQuerySnapshot("dogs", []);
    await fillFamily("stage:", QUERY_SNAPSHOTS_PER_PREFIX + 5);

    expect(rows.has("dogs")).toBe(true);
    expect(rows.get("dogs")?.prefix).toBeUndefined();
  });

  it("brings families written before the budget back within it", async () => {
    const now = Date.now();

    for (let index = 0; index < QUERY_SNAPSHOTS_PER_PREFIX + 4; index += 1) {
      rows.set(`stage:${index}`, {
        data: { index },
        id: `stage:${index}`,
        lastReadAt: now + index,
        prefix: "stage:",
        updatedAt: now + index,
      });
    }

    const evicted = await enforceQuerySnapshotQuotas();

    expect(evicted).toBe(4);
    expect(idsWithPrefix("stage:")).toHaveLength(QUERY_SNAPSHOTS_PER_PREFIX);
  });
});

describe("query snapshot list window", () => {
  const listOf = (size: number) =>
    Array.from({ length: size }, (_item, index) => ({ index }));

  beforeEach(() => {
    rows.clear();
  });

  it("keeps a list snapshot within the window", async () => {
    await saveQuerySnapshot("stages", listOf(QUERY_SNAPSHOT_LIST_WINDOW + 40));

    expect(rows.get("stages")?.data).toHaveLength(QUERY_SNAPSHOT_LIST_WINDOW);
  });

  it("keeps the head, where an entity created offline is prepended", async () => {
    const created = { index: -1 };

    await saveQuerySnapshot("competitions", [
      created,
      ...listOf(QUERY_SNAPSHOT_LIST_WINDOW + 10),
    ]);

    const stored = rows.get("competitions")?.data as
      | { index: number }[]
      | undefined;

    expect(stored?.[0]).toEqual(created);
  });

  it("leaves a list shorter than the window alone", async () => {
    await saveQuerySnapshot("stages", listOf(7));

    expect(rows.get("stages")?.data).toHaveLength(7);
  });

  it("leaves a snapshot that is not a list alone", async () => {
    await saveQuerySnapshot("user", { name: "someone" });

    expect(rows.get("user")?.data).toEqual({ name: "someone" });
  });

  it("stores a lookup catalogue whole, so offline name resolution still works", async () => {
    await saveWholeQuerySnapshot(
      "breeds",
      listOf(QUERY_SNAPSHOT_LIST_WINDOW + 40),
    );

    expect(rows.get("breeds")?.data).toHaveLength(
      QUERY_SNAPSHOT_LIST_WINDOW + 40,
    );
  });
});
