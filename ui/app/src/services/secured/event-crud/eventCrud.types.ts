import {
  EMPTY_FEDERATION_CONFIGURATION,
  FederationConfigurationResponseDTO,
} from "@/services/secured/configurations/configurations.types";
import { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import type { ExtractionResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import { COMPETITOR_STATUS } from "@/utils/event";

export interface CreateEventRequestDTO {
  id: string;
  name: string;
  stageId: string;
  disciplineId: string;
}

export const SCORE_CALCULATION = {
  AVG: "AVG",
  MID_AVG: "MID_AVG",
} as const;

export interface UpdateEventRequestDTO {
  competitors: EventCompetitorRequestDTO[];
  configurationId: string;
  exercises: EventExerciseRequestDTO[];
  judges: EventJudgeDetailRequestDTO[];
  name: string;
  enrollmentDeadline: number;
  scoreCalculation: string;
  commissioner?: string;
  category?: string;
  awards?: string[];
}

export interface EventCompetitorResponseDTO {
  dog: IdNameDTO;
  position: number;
  competitorNumber: number;
  team: string;
  origin: string;
  owner: string;
  handler: string;
  country: string;
  status: string;
  breed: IdNameDTO;
  bih?: boolean;
  primer?: string;
  reserve?: boolean;
  notCompeting?: boolean;
  scoresAllowed?: boolean;
}

export interface EventCompetitorRequestDTO {
  dogIdentification: string;
  position: number;
  competitorNumber: number;
  accepted: boolean;
  bih: boolean;
  primer: string;
  reserve: boolean;
}

export interface UpdateEventNotCompetingRequestDTO {
  dogIdentification: string;
  notCompeting: boolean;
}

export interface EventCompetitorDetail {
  dogIdentification: string;
  origin: string;
  name: string;
  owner: string;
  handler: string;
  team: string;
  country: string;
  breed: string;
  position: number;
  competitorNumber: number;
  accepted: boolean;
  status: string;
  notCompeting: boolean;
  bih: boolean;
  primer: string;
  reserve: boolean;
}

export interface EventConfigurationDetailResponseDTO {
  federation: FederationConfigurationResponseDTO;
  id: string;
  name: string;
}

export interface Discipline {
  id: string;
  name: string;
}

export interface ObdxEventDetailResponseDTO {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetailResponseDTO;
  discipline: Discipline;
  enrollmentDeadline: number;
  exercises: EventExerciseDetailResponseDTO[];
  id: string;
  stage: IdNameDTO;
  judges: EventJudgeDetailResponseDTO[];
  name: string;
  status: string;
  scoreCalculation: string;
  commissioner?: string;
  category?: string;
  awards: IdNameDTO[];
  rank?: string;
  extraction?: ExtractionResponseDTO;
}

export interface EventDetailResponseDTO extends ObdxEventDetailResponseDTO {
  obdx: ObdxEventDetailResponseDTO;
}

/**
 * Raw server payload: competitors arrive as {@link EventCompetitorResponseDTO}
 * (nested `dog`, no flat `dogIdentification`). {@link normalizeEventDetailResponse}
 * flattens them into the internal {@link EventCompetitorDetail} shape.
 */
export interface ObdxEventDetailRawResponseDTO extends Omit<
  ObdxEventDetailResponseDTO,
  "competitors" | "configuration"
> {
  competitors: EventCompetitorResponseDTO[];
  configuration: EventConfigurationDetailResponseDTO | null;
}

export const EMPTY_EVENT_CONFIGURATION: EventConfigurationDetailResponseDTO = {
  federation: EMPTY_FEDERATION_CONFIGURATION,
  id: "",
  name: "",
};

export interface EventDetailRawResponseDTO {
  obdx: ObdxEventDetailRawResponseDTO;
}

export interface EventExerciseDetailResponseDTO extends Omit<
  EventExerciseRequestDTO,
  "judgesIds"
> {
  name: string;
  judges: IdNameDTO[];
}

export interface EventExerciseRequestDTO {
  id: string;
  name: string;
  position: number;
  tags: string[];
  judgesIds: string[];
}

export interface EventJudgeDetailResponseDTO {
  collectorEmail: string;
  id: string;
  mainJudge: boolean;
  name: string;
}

export interface EventJudgeDetailRequestDTO {
  collectorEmail: string;
  id: string;
  mainJudge: boolean;
}

export interface EventEditorDraft {
  competitors: EventCompetitorDetail[];
  configuration: EventConfigurationDetailResponseDTO;
  discipline: Discipline;
  enrollmentDeadline: number;
  exercises: EventExerciseDetailResponseDTO[];
  id: string;
  judges: EventJudgeDetailResponseDTO[];
  name: string;
  stageId: string;
  status: string;
  scoreCalculation: string;
  commissioner?: string;
  category?: string;
  awards: IdNameDTO[];
}

export interface ApiEventRollbackPayload {
  competitionId: string;
  entityId: string;
  previousCompetition: CompetitionResponseDTO | null;
  previousCompetitions: CompetitionResponseDTO[] | null;
  previousEvent: EventDetailResponseDTO | null;
  stageId: string;
}

const normalizeCompetitor = (
  competitor: EventCompetitorResponseDTO,
): EventCompetitorDetail => ({
  dogIdentification: competitor.dog.id,
  name: competitor.dog.name,
  owner: competitor.owner ?? "",
  handler: competitor.handler ?? "",
  origin: competitor.origin ?? "",
  team: competitor.team ?? "",
  country: competitor.country ?? "",
  breed: competitor.breed?.name ?? "",
  position: competitor.position ?? 0,
  competitorNumber: competitor.competitorNumber ?? 0,
  accepted: [
    COMPETITOR_STATUS.NOT_COMPETING,
    COMPETITOR_STATUS.ENROLLED,
  ].includes(competitor.status),
  status: competitor.status ?? "",
  notCompeting: competitor.notCompeting ?? false,
  bih: competitor.bih ?? false,
  primer: competitor.primer ?? "",
  reserve: competitor.reserve ?? false,
});

export const toEventExerciseRequest = (
  exercise: EventExerciseDetailResponseDTO,
): EventExerciseRequestDTO => ({
  id: exercise.id,
  name: exercise.name,
  position: exercise.position,
  tags: exercise.tags,
  judgesIds: exercise.judges.map((judge) => judge.id),
});

export const normalizeEventDetailResponse = (
  event: EventDetailRawResponseDTO | ObdxEventDetailRawResponseDTO,
): EventDetailResponseDTO => {
  const rawObdx =
    "obdx" in event ? event.obdx : (event as ObdxEventDetailRawResponseDTO);
  const obdx: ObdxEventDetailResponseDTO = {
    ...rawObdx,
    competitors: rawObdx.competitors.map(normalizeCompetitor),
    configuration: rawObdx.configuration ?? EMPTY_EVENT_CONFIGURATION,
  };

  return {
    ...obdx,
    obdx,
  };
};
