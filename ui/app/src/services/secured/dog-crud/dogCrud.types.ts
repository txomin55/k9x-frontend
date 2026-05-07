export interface Dog {
  id: string;
  name: string;
  image: string;
  breed: string;
  identifier?: string;
  owner?: string;
  team?: string;
  country?: string;
  owned: boolean;
  creator: string;
}

export interface CreateDogRequestDTO {
  id: string;
  name: string;
  image: string;
  breed: string;
  identifier?: string;
  owner?: string;
  team?: string;
  country?: string;
  owned: boolean;
}

export interface UpdateDogRequestDTO {
  name: string;
  image: string;
  breed: string;
  identifier?: string;
  owner?: string;
  team?: string;
  country?: string;
  owned: boolean;
}

export interface DogRollbackPayload {
  entityId: string;
  previousDog: Dog | null;
  previousDogs: Dog[] | null;
}
