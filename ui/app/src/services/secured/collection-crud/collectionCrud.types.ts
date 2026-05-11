import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { EventCompetitorResponseDTO } from "@/services/secured/event-crud/eventCrud.types";

export interface CollectionsResponseDTO {
  competitionName: string;
  stageName: string;
  eventName: string;
  eventId: string;
  status: string;
  judges: IdNameDTO[];
}

interface ScoresConfigurationResponseDTO {
  allowedValues: number[];
  description: string;
}

interface ObdxCompetitorsScoresResponseDTO {
  competitors: CompetitorScoresResponseDTO[];
}

export interface CollectionResponseDTO {
  obdx: ObdxCompetitorsScoresResponseDTO;
  configuration: ScoresConfigurationResponseDTO;
  discipline: IdNameDTO;
}

export interface CompetitorScoresResponseDTO {
  exercises: ExerciseScoresResponseDTO[];
  competitor: EventCompetitorResponseDTO;
}

export interface ExerciseResponseDTO {
  id: string;
  name: string;
  order: number;
}

export interface CollectionScoreResponseDTO {
  judge: IdNameDTO;
  score: number;
}

export interface ExerciseScoresResponseDTO {
  exercise: ExerciseResponseDTO;
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
