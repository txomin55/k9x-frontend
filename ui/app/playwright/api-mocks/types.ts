import type { Request } from "@playwright/test";

export type ApiMock = {
  contentType?: string;
  headers?: Record<string, string>;
  method: string;
  payload:
    | unknown
    | ((
        pathnameMatch: RegExpMatchArray | undefined,
        request: Request,
      ) => unknown | Promise<unknown>);
  pathname: string;
  status?: number;
};
