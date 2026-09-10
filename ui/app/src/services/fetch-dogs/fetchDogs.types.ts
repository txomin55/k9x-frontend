import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import type { DogSex } from "@/services/secured/dog-crud/dogCrud.types";

/**
 * What the API answers instead of a score for a dog that has never competed. The index is only recorded
 * once a dog has results, so this is an absence, not a low score, and the views say so rather than
 * showing a 0 that would read as the worst possible competitor.
 */
export const NO_K9X_INDEX = "NO_K9X_INDEX_GENERATED";

/**
 * A dog as the public directory shows it: presentation fields only — no ownership, no license, no
 * origin — plus its K9X index.
 */
export interface PublicDog {
  identification: string;
  name: string;
  handler: string;
  country: IdNameDTO;
  sex: DogSex | null;
  breed: IdNameDTO;
  /** The K9X index on the 0-1000 scale, or {@link NO_K9X_INDEX}. */
  rank: string;
}

/** One page of the public dog directory. `size` equals `total` when the whole list came in one page. */
export interface PublicDogPageDTO {
  items: PublicDog[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

/** What the caller is narrowing the directory down to. Every filter travels in the same request. */
export type PublicDogSearch = {
  name?: string;
  handler?: string;
  country?: string;
};
