type RequestShape<THeaders, TMethod> = {
  headers?: THeaders;
  method?: TMethod;
};

export type SerializableRequest = Required<
  RequestShape<Record<string, string>, string>
> & {
  body?: string;
  url: string;
};

export type RequestOptions = RequestShape<HeadersInit, string> & {
  auth?: boolean;
  body?: unknown;
  path: string;
  retryOnUnauthorized?: boolean;
};
