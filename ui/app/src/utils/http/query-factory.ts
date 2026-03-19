import {
  createMutation,
  createQuery,
  type CreateMutationOptions,
  type MutationFunction,
  type QueryKey,
} from "@tanstack/solid-query";
import { locale } from "@/stores/i18n";

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
  const queryOptions = () => ({
    queryFn: options.fetcher,
    queryKey: [...options.queryKey, locale()] as const,
  });

  return {
    key: options.queryKey,
    options: queryOptions,
    useQuery: (override?: Record<string, unknown>) =>
      createQuery(() => ({
        ...queryOptions(),
        ...override,
      })),
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
