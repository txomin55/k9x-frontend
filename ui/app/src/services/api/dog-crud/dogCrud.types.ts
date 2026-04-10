export interface Dog {
  id: string;
  name: string;
  image: string;
  breed: string;
  identifier?: string;
  owner?: string;
  team?: string;
  country?: string;
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
}

export interface UpdateDogRequest {
  id: string;
  name: string;
  image: string;
  breed: string;
  identifier?: string;
  owner?: string;
  team?: string;
  country?: string;
}

export interface DogRollbackPayload {
  entityId: string;
  previousDog: Dog | null;
  previousDogs: Dog[] | null;
}
