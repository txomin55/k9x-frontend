import { Judge } from "@/services/api/judge-crud/judgeCrud.types";

export interface CollectionsRequest {
  competitionName: string;
  stageName: string;
  eventName: string;
  eventId: string;
  status: string;
  judges: Judge[];
}

export interface GetCollectionResponse {
  competitors: ExerciseScores[];
}

export interface ExerciseScores {
  exercise: Exercise;
  scores: Score[];
}

export interface Exercise {
  id: string;
  name: string;
  order: number;
}

export interface Score {
  judge: Judge;
  score: number;
}
