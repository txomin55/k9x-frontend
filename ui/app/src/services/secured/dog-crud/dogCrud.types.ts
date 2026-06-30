export interface Dog {
  id: string;
  name: string;
  image: string;
  breed: string;
  identifier: string;
  owner: string;
  handler: string;
  team: string;
  country: string;
  owned: boolean;
}

export interface CreateDogRequestDTO {
  id: string;
  name: string;
  image: string;
  breed: string;
  identifier: string;
  owner: string;
  handler: string;
  team: string;
  country: string;
}

export interface UpdateDogRequestDTO {
  name: string;
  image: string;
  breed: string;
  identifier?: string;
  owner?: string;
  handler?: string;
  team?: string;
  country?: string;
}

export interface DogRollbackPayload {
  entityId: string;
  previousDog: Dog | null;
  previousDogs: Dog[] | null;
}
