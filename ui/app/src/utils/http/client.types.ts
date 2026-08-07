type RequestShape<THeaders, TMethod> = {
  headers?: THeaders;
  method?: TMethod;
};

export type SerializableRequest = Required<
  RequestShape<Record<string, string>, string>
> & {
  body?: string;
  credentials?: RequestCredentials;
  url: string;
};

export type RequestOptions = RequestShape<HeadersInit, string> & {
  auth?: boolean;
  body?: unknown;
  credentials?: RequestCredentials;
  path: string;
  responseType?: "auto" | "blob";
  retryOnUnauthorized?: boolean;
};

/** What a `responseType: "blob"` request resolves to: the payload plus the server-suggested file name. */
export type BlobResponse = {
  blob: Blob;
  fileName?: string;
};
