export interface QuerySnapshot<TData = unknown> {
  data: TData;
  id: string;
  lastReadAt: number;
  prefix?: string;
  updatedAt: number;
}
