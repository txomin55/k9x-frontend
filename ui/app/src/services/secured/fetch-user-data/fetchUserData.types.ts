export interface UserSubscriptionsResponseDTO {
  eventIds: string[];
}

export interface UserProfileResponseDTO {
  email: string;
  image: string;
  name: string;
  organizer: boolean;
  subscriptions: UserSubscriptionsResponseDTO;
  /** Account-wide: applies to every device the user has registered, not to this browser. */
  notificationsEnabled: boolean;
}

export type UserModel = UserProfileResponseDTO;
