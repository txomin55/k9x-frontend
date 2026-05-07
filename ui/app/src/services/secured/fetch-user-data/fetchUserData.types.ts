export interface UserProfile {
  email: string;
  image?: string;
  name: string;
  organizer: boolean;
}

export type UserModel = UserProfile;
