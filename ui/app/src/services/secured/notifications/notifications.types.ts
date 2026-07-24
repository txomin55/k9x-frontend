export interface NotificationResponseDTO {
  id: string;
  timestamp: number;
  text: string;
  seen: boolean;
}

export interface MarkNotificationsSeenRequestDTO {
  markSeen: string[];
}
