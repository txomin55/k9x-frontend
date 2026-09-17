export interface PushSubscriptionRequestDTO {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface NotificationsEnabledRequestDTO {
  enabled: boolean;
}
