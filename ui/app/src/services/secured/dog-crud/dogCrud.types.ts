export type DogSex = "MALE" | "FEMALE";

export interface Dog {
  id: string;
  name: string;
  image: string;
  breed: string;
  identity: string;
  owner: string;
  handler: string;
  team: string;
  country: string;
  sex: DogSex;
  withersCm: number;
  owned: boolean;
  threeFciGenerationsConfirmed: boolean;
}

export interface CreateDogRequestDTO {
  id: string;
  name: string;
  image: string;
  breed: string;
  identity: string;
  owner: string;
  handler: string;
  team: string;
  country: string;
  sex: DogSex;
  withersCm: number;
  threeFciGenerationsConfirmed: boolean;
}

export interface UpdateDogRequestDTO {
  name: string;
  image: string;
  breed: string;
  identity?: string;
  owner?: string;
  handler?: string;
  team?: string;
  country?: string;
  sex?: DogSex;
  withersCm?: number;
  threeFciGenerationsConfirmed?: boolean;
}

export interface DogRollbackPayload {
  entityId: string;
  previousDog: Dog | null;
  previousDogs: Dog[] | null;
}
