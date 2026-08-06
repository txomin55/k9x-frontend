import type {
  HttpRequestError,
  NetworkRequestError,
} from "@/utils/http/client";
import type { SerializableRequest } from "@/utils/http/client.types";

export type PendingTaskStatus = "pending" | "processing" | "failed";
export type PendingTaskMethod = "POST" | "PUT" | "PATCH" | "DELETE";

export interface PendingTask {
  attemptCount: number;
  entityId: string;
  entityType: string;
  id: string;
  method: PendingTaskMethod;
  payload: unknown;
  request?: SerializableRequest;
  rollbackPayload?: unknown;
  /**
   * DELETEs identify their target through the path, so their payload is not sent as a body by default.
   * Set this for the rare endpoint whose target only fits in a body (e.g. a push endpoint URL).
   */
  sendsBody?: boolean;
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
