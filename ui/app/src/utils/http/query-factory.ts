import {
  createMutation,
  createQuery,
  type CreateMutationOptions,
  type MutationFunction,
  type QueryKey,
} from "@tanstack/solid-query";
import { getCurrentLocale, useI18n } from "@/stores/i18n";

type QueryFactoryOptions<TData, TKey extends QueryKey> = {
  fetcher: () => Promise<TData>;
  queryKey: TKey;
};

type MutationFactoryOptions<TData, TVariables> = {
  mutate: MutationFunction<TData, TVariables>;
};

export const defineQuery = <TData, const TKey extends QueryKey>(
  options: QueryFactoryOptions<TData, TKey>,
) => {
  return {
    key: options.queryKey,
    options: () => ({
      queryFn: options.fetcher,
      queryKey: [...options.queryKey, getCurrentLocale()] as const,
    }),
    useQuery: (override?: Record<string, unknown>) => {
      const i18n = useI18n();
      return createQuery(() => ({
        queryFn: options.fetcher,
        queryKey: [...options.queryKey, i18n.locale()] as const,
        ...override,
      }));
    },
  };
};

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
