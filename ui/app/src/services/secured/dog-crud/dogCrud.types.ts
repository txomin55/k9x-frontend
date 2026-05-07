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

export interface CreateDogRequest {
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

export interface UpdateDogRequest {
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
