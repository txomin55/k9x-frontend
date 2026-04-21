import { Judge } from "@/services/api/judge-crud/judgeCrud.types";
import { EventCompetitor } from "@/services/api/event-crud/eventCrud.types";

export interface CollectionsRequest {
  competitionName: string;
  stageName: string;
  eventName: string;
  eventId: string;
  status: string;
  judges: Judge[];
}

export interface CompetitorScores {
  exercises: ExerciseScores[];
  competitor: EventCompetitor;
}

export interface Exercise {
  id: string;
  name: string;
  order: number;
}

export interface CollectionScore {
  judge: Judge;
  score: number;
}

export interface ExerciseScores {
  exercise: Exercise;
  scores: CollectionScore[];
}
