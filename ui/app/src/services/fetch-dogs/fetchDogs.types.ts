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

/**
 * Everything the public directory knows about one dog. Who owns it, who created the record and when it
 * was created are deliberately absent: the API does not expose them.
 */
export interface PublicDogDetail {
  identification: string;
  name: string;
  image: string;
  breed: IdNameDTO;
  origin: string;
  license: string;
  country: IdNameDTO;
  team: string;
  handler: string;
  sex: DogSex | null;
  withersCm: number | null;
  threeFciGenerationsConfirmed: boolean | null;
  /** Epoch millis of the last change to the dog. */
  lastUpdate: number;
}

/**
 * One event the dog was entered in. Position, score and OBDX points come from the snapshot taken the morning
 * after the stage ends, so they are null for an event still running; score and points are also null when the
 * competition's source forbids republishing its results (`restricted`).
 */
export interface DogParticipation {
  event: IdNameDTO;
  stageId: string;
  /** Epoch millis of the stage start. */
  date: number;
  /** Country of the competition the event belongs to. */
  country: IdNameDTO | null;
  position: number | null;
  totalScore: number | null;
  obdxPoints: number | null;
  restricted: boolean;
}

/** A dog's participations in one UTC year. The API sends the years newest first. */
export interface DogParticipationYear {
  year: number;
  participations: DogParticipation[];
}

/**
 * One result feeding the dog's K9X index. `eventScore` is the result on the 0-1000 index scale; it and
 * `totalScore` are null when the competition's source forbids republishing its results (`restricted`).
 */
export interface DogIndexEvent {
  event: IdNameDTO;
  stageId: string;
  discipline: IdNameDTO | null;
  country: IdNameDTO | null;
  /** Epoch millis the result applies to in the index (end of the stage). */
  date: number;
  eventScore: number | null;
  totalScore: number | null;
  position: number | null;
  /** The dog's index right after this result. */
  index: number;
  restricted: boolean;
}

/** One sample of the index curve. At each event two samples share the timestamp: just before and after. */
export interface DogIndexPoint {
  timestamp: number;
  index: number;
}

/** Everything the dog's K9X index chart needs; both lists are empty for a dog that never competed. */
export interface DogIndexTimeline {
  events: DogIndexEvent[];
  curve: DogIndexPoint[];
  /** Epoch millis the whole index starts fading if the dog does not compete again. */
  freshnessDegradationFrom: number | null;
}
