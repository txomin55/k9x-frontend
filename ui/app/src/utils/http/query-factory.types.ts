import type {
  CreateMutationOptions,
  CreateQueryResult,
  MutationFunction,
  QueryKey,
} from "@tanstack/solid-query";

export type TanstackCreateQuery = {
  staleTime?: number;
  gcTime?: number;
  refetchOnMount?: boolean;
};

export type QueryFactoryOptions<TData, TKey extends QueryKey> = {
  fetcher: () => Promise<TData>;
  queryKey: TKey;
};

export type ParameterizedQueryFactoryOptions<
  TData,
  TArgs extends readonly unknown[],
  TKey extends QueryKey,
> = {
  fetcher: (...args: TArgs) => Promise<TData>;
  queryKey: (...args: TArgs) => TKey;
};

export type MutationFactoryOptions<TData, TVariables> = {
  mutate: MutationFunction<TData, TVariables>;
};

export type QueryDefinition<TData, TKey extends QueryKey> = {
  key: TKey;
  options: () => {
    queryFn: () => Promise<TData>;
    queryKey: readonly [...TKey, string];
  };
  useQuery: (
    override?: Record<string, unknown>,
  ) => CreateQueryResult<TData, Error>;
};

export type ParameterizedQueryDefinition<
  TData,
  TArgs extends readonly unknown[],
  TKey extends QueryKey,
> = {
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

export type MutationOverride<
  TData,
  TVariables,
  TOnMutateResult,
> = Partial<CreateMutationOptions<TData, Error, TVariables, TOnMutateResult>>;
