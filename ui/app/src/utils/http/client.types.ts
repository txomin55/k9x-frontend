export type RequestOptions = {
  auth?: boolean;
  body?: unknown;
  headers?: HeadersInit;
  method?: string;
  path: string;
  retryOnUnauthorized?: boolean;
};
