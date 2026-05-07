import { JudgeResponseDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { EventCompetitor } from "@/services/secured/event-crud/eventCrud.types";

export interface CollectionsResponseDTO {
  competitionName: string;
  stageName: string;
  eventName: string;
  eventId: string;
  status: string;
  judges: JudgeResponseDTO[];
}

interface ScoresConfigurationResponseDTO {
  allowedValues: number[];
  description: string;
}

export interface CollectionResponseDTO {
  competitors: CompetitorScoresResponseDTO[];
  configuration?: ScoresConfigurationResponseDTO;
}

export interface CompetitorScoresResponseDTO {
  exercises: ExerciseScoresResponseDTO[];
  competitor: EventCompetitor;
}

export interface Exercise {
  id: string;
  name: string;
  order: number;
}

export interface CollectionScoreResponseDTO {
  judge: JudgeResponseDTO;
  score: number;
}

export interface ExerciseScoresResponseDTO {
  exercise: Exercise;
  collectionScores: CollectionScoreResponseDTO[];
}

export interface UpdateCollectionScoreRequestDTO {
  dogId: string;
  exerciseId: string;
  judgeId: string;
  eventId: string;
  score: number;
}

export interface CollectionRollbackPayload {
  collectionId: string;
  previousCollection: CollectionResponseDTO | null;
}
