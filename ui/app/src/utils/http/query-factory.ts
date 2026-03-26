import {
  createMutation,
  createQuery,
  type QueryKey,
} from "@tanstack/solid-query";
import { getCurrentLocale, useI18n } from "@/stores/i18n";
import type {
  MutationFactoryOptions,
  MutationOverride,
  ParameterizedQueryDefinition,
  ParameterizedQueryFactoryOptions,
  QueryDefinition,
  QueryFactoryOptions,
} from "@/utils/http/query-factory.types";

export type { TanstackCreateQuery } from "@/utils/http/query-factory.types";

export function defineQuery<TData, const TKey extends QueryKey>(
  options: QueryFactoryOptions<TData, TKey>,
): QueryDefinition<TData, TKey>;
export function defineQuery<
  TData,
  const TArgs extends readonly unknown[],
  const TKey extends QueryKey,
>(
  options: ParameterizedQueryFactoryOptions<TData, TArgs, TKey>,
): ParameterizedQueryDefinition<TData, TArgs, TKey>;
export function defineQuery(options: any) {
  const createLocalizedKey = (queryKey: QueryKey, locale: string) =>
    [...queryKey, locale] as const;

  const createOptions = (args: readonly unknown[], locale: string) => {
    const queryKey = options.queryKey(...args);

    const queryFn = () => options.fetcher(...args);

    return {
      queryFn,
      queryKey: createLocalizedKey(queryKey, locale),
    };
  };

  if (typeof options.queryKey !== "function") {
    const queryFn = () => options.fetcher();

    return {
      key: options.queryKey,
      options: () => ({
        queryFn,
        queryKey: createLocalizedKey(options.queryKey, getCurrentLocale()),
      }),
      useQuery: (override?: Record<string, unknown>) => {
        const i18n = useI18n();
        return createQuery(() => ({
          queryFn,
          queryKey: createLocalizedKey(options.queryKey, i18n.locale()),
          ...override,
        }));
      },
    };
  }

  return {
    key: (...args: readonly unknown[]) => options.queryKey(...args),
    options: (...args: readonly unknown[]) =>
      createOptions(args, getCurrentLocale()),
    useQuery: (
      args: readonly unknown[],
      override?: Record<string, unknown>,
    ) => {
      const i18n = useI18n();
      return createQuery(() => ({
        ...createOptions(args, i18n.locale()),
        ...override,
      }));
    },
  };
}

export const defineMutation = <
  TData,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: MutationFactoryOptions<TData, TVariables>,
) => ({
  useMutation: (
    override?: MutationOverride<TData, TVariables, TOnMutateResult>,
  ) =>
    createMutation(() => ({
      mutationFn: options.mutate,
      ...override,
    })),
});
