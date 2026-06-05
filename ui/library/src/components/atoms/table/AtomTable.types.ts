import type {
  ColumnDef,
  OnChangeFn,
  Row,
  SortingState,
} from "@tanstack/solid-table";
import type { JSX } from "solid-js";

export type { ColumnDef, Row } from "@tanstack/solid-table";

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
  getRowCanExpand?: (row: Row<TData>) => boolean;
  renderSubComponent?: (row: Row<TData>) => JSX.Element;
};
