export interface UserProfile {
  email: string;
  image: string;
  name: string;
  organizer: boolean;
  news: [];
}

export type UserModel = UserProfile;
