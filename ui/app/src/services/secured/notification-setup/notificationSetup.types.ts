export interface PushSubscriptionRequestDTO {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushUnsubscribeRequestDTO {
  endpoint: string;
}
