import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export type DogSex = "MALE" | "FEMALE";

export interface Dog {
  identification: string;
  name: string;
  image: string;
  breed: IdNameDTO;
  origin: string;
  license: string;
  owner: string;
  handler: string;
  team: string;
  country: IdNameDTO;
  sex: DogSex;
  withersCm: number;
  owned: boolean;
  threeFciGenerationsConfirmed: boolean;
}

/** One page of the dog list endpoint. `size` equals `total` when the whole list came in one page. */
export interface DogPageDTO {
  items: Dog[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface CreateDogRequestDTO {
  identification: string;
  name: string;
  image: string;
  breed: string;
  origin: string;
  license: string;
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
  origin: string;
  license: string;
  owner: string;
  handler: string;
  team: string;
  country: string;
  sex: DogSex;
  withersCm: number;
  threeFciGenerationsConfirmed: boolean;
}

export interface DogRollbackPayload {
  entityId: string;
  previousDog: Dog | null;
  previousDogs: Dog[] | null;
}
