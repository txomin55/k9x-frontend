import type {
  ColumnDef,
  OnChangeFn,
  SortingState,
} from "@tanstack/solid-table";

export type AtomTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  onSortingChange?: OnChangeFn<SortingState>;
  emptyMessage?: string;
  loadingMoreMessage?: string;
  class?: string;
};
