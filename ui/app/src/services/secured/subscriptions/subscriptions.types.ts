/**
 * Kinds of resource a user can subscribe to. Mirrors the backend's `SubscriptionKind`, so the endpoint
 * stays generic: the payload states *what* is being subscribed plus its ids.
 */
export const SUBSCRIPTION_KINDS = {
  EVENT: "EVENT",
} as const;

export type SubscriptionKind =
  (typeof SUBSCRIPTION_KINDS)[keyof typeof SUBSCRIPTION_KINDS];

export interface UpdateSubscriptionRequestDTO {
  kind: SubscriptionKind;
  ids: string[];
  subscribe: boolean;
}
