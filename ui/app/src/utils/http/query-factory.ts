import {
  createMutation,
  type CreateMutationOptions,
  createQuery,
  type CreateQueryResult,
  type MutationFunction,
  type QueryKey,
} from "@tanstack/solid-query";
import { getCurrentLocale, useI18n } from "@/stores/i18n";

export type TanstackCreateQuery = {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
};

type QueryFactoryOptions<TData, TKey extends QueryKey> = {
  fetcher: () => Promise<TData>;
  queryKey: TKey;
};

type ParameterizedQueryFactoryOptions<
  TData,
  TArgs extends readonly unknown[],
  TKey extends QueryKey,
> = {
  fetcher: (...args: TArgs) => Promise<TData>;
  queryKey: (...args: TArgs) => TKey;
};

type MutationFactoryOptions<TData, TVariables> = {
  mutate: MutationFunction<TData, TVariables>;
};

export function defineQuery<TData, const TKey extends QueryKey>(
  options: QueryFactoryOptions<TData, TKey>,
): {
  key: TKey;
  options: () => {
    queryFn: () => Promise<TData>;
    queryKey: readonly [...TKey, string];
  };
  useQuery: (override?: Record<string, unknown>) => CreateQueryResult<TData, Error>;
};
export function defineQuery<
  TData,
  const TArgs extends readonly unknown[],
  const TKey extends QueryKey,
>(
  options: ParameterizedQueryFactoryOptions<TData, TArgs, TKey>,
): {
  key: (...args: TArgs) => TKey;
  options: (...args: TArgs) => {
    queryFn: () => Promise<TData>;
    queryKey: readonly [...TKey, string];
  };
  useQuery: (
    args: TArgs,
    override?: Record<string, unknown>,
  ) => CreateQueryResult<TData, Error>;
};
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
    useQuery: (args: readonly unknown[], override?: Record<string, unknown>) => {
      const i18n = useI18n();
      return createQuery(() => ({
        ...createOptions(args, i18n.locale()),
        ...override,
      }));
    },
  };
}

export const defineMutation = <TData, TVariables = void>(
  options: MutationFactoryOptions<TData, TVariables>,
) => ({
  useMutation: (
    override?: Partial<CreateMutationOptions<TData, Error, TVariables>>,
  ) =>
    createMutation(() => ({
      mutationFn: options.mutate,
      ...override,
    })),
});
