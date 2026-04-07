import type {
  HttpRequestError,
  NetworkRequestError,
} from "@/utils/http/client";

export type PendingTaskStatus = "pending" | "processing" | "failed";
export type PendingTaskMethod = "POST" | "PUT" | "DELETE";

export interface PendingTask {
  attemptCount: number;
  entityId: string;
  entityType: string;
  id: string;
  method: PendingTaskMethod;
  payload: unknown;
  rollbackPayload?: unknown;
  status: PendingTaskStatus;
  timestamp: number;
  updatedAt: number;
  url: string;
}

export interface PendingTaskHandler {
  onSuccess?: (task: PendingTask) => Promise<void> | void;
  onHttpError?: (
    task: PendingTask,
    error: HttpRequestError,
  ) => Promise<void> | void;
  onNetworkError?: (
    task: PendingTask,
    error: NetworkRequestError,
  ) => Promise<void> | void;
}
