export type ApiMock = {
  contentType?: string;
  headers?: Record<string, string>;
  method: string;
  payload:
    | unknown
    | ((pathnameMatch?: RegExpMatchArray) => unknown | Promise<unknown>);
  pathname:
    | string
    | {
        pattern: RegExp;
      };
  status?: number;
};
