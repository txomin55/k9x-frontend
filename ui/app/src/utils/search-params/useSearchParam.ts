import { useNavigate, useSearch } from "@tanstack/solid-router";

type SearchValue = string | number | string[] | undefined;

type SearchRecord = Record<string, SearchValue>;

type SearchParamMode = "replace" | "push";

export function useSearchParam(
  key: string,
  defaultValue = "",
  mode: SearchParamMode = "replace",
) {
  const search = useSearch({
    strict: false,
    select: (current) => (current as SearchRecord)[key],
  });
  const navigate = useNavigate();

  const value = (): string => {
    const current = search();
    if (typeof current === "string") return current;
    if (typeof current === "number") return String(current);
    return defaultValue;
  };

  const setValue = (next: string) => {
    const nextValue = String(next);
    if (value() === nextValue) return;
    queueMicrotask(() =>
      void navigate({
        to: ".",
        search: (prev: SearchRecord) => ({
          ...prev,
          [key]: nextValue === defaultValue ? undefined : nextValue,
        }),
        replace: mode === "replace",
      }),
    );
  };

  return [value, setValue] as const;
}

export function useSearchParamList(
  key: string,
  mode: SearchParamMode = "replace",
) {
  const search = useSearch({
    strict: false,
    select: (current) => (current as SearchRecord)[key],
  });
  const navigate = useNavigate();

  const value = (): string[] => {
    const current = search();
    if (Array.isArray(current)) {
      return current;
    }
    if (typeof current === "number") {
      return [String(current)];
    }
    if (typeof current === "string" && current.length) {
      return current.split(",");
    }
    return [];
  };

  const setValue = (next: string[]) => {
    const nextValue = next.map(String).join(",");
    if (value().join(",") === nextValue) return;
    queueMicrotask(() =>
      void navigate({
        to: ".",
        search: (prev: SearchRecord) => ({
          ...prev,
          [key]: next.length ? nextValue : undefined,
        }),
        replace: mode === "replace",
      }),
    );
  };

  return [value, setValue] as const;
}
