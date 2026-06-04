export interface UserProfileResponseDTO {
  email: string;
  image: string;
  name: string;
  organizer: boolean;
}

export type UserModel = UserProfileResponseDTO;
