export interface QuerySnapshot<TData = unknown> {
  data: TData;
  id: string;
  updatedAt: number;
}
