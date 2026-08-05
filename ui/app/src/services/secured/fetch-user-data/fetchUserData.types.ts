export interface UserSubscriptionsResponseDTO {
  eventIds: string[];
}

export interface UserProfileResponseDTO {
  email: string;
  image: string;
  name: string;
  organizer: boolean;
  subscriptions: UserSubscriptionsResponseDTO;
}

export type UserModel = UserProfileResponseDTO;
