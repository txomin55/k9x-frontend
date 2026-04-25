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

interface ScoresConfiguration {
  allowedValues: number[];
  description: string;
}

export interface CollectionRequest {
  competitors: CompetitorScores[];
  configuration: ScoresConfiguration;
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
  collectionScores: CollectionScore[];
}

export interface UpdateCollectionScoreRequest {
  dogId: string;
  exerciseId: string;
  judgeId: string;
  eventId: string;
  score: number;
}

export interface CollectionRollbackPayload {
  collectionId: string;
  previousCollection: CollectionRequest | null;
}
