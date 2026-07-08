import {
  EMPTY_FEDERATION_CONFIGURATION,
  FederationConfigurationResponseDTO
} from "@/services/secured/configurations/configurations.types";
import { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
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
  awards?: string[];
}

export interface EventCompetitorResponseDTO {
  dog: IdNameDTO;
  position: number;
  team: string;
  identity: string;
  owner: string;
  handler: string;
  country: string;
  status: string;
  breed: string;
  bih?: boolean;
  reserve?: boolean;
  notCompeting?: boolean;
  scoresAllowed?: boolean;
}

export interface EventCompetitorRequestDTO {
  dogId: string;
  position: number;
  accepted: boolean;
  bih: boolean;
  reserve: boolean;
}

export interface UpdateEventNotCompetingRequestDTO {
  dogId: string;
  notCompeting: boolean;
}

export interface EventCompetitorDetail {
  dogId: string;
  identity: string;
  name: string;
  owner: string;
  handler: string;
  team: string;
  country: string;
  breed: string;
  position: number;
  accepted: boolean;
  status: string;
  notCompeting: boolean;
  bih: boolean;
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
  awards: IdNameDTO[];
}

export interface EventDetailResponseDTO extends ObdxEventDetailResponseDTO {
  obdx: ObdxEventDetailResponseDTO;
}

/**
 * Raw server payload: competitors arrive as {@link EventCompetitorResponseDTO}
 * (nested `dog`, no flat `dogId`). {@link normalizeEventDetailResponse}
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

export interface EventExerciseDetailResponseDTO
  extends Omit<EventExerciseRequestDTO, "judgesIds"> {
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
  name: string;
}

export interface EventJudgeDetailRequestDTO {
  collectorEmail: string;
  id: string;
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
  dogId: competitor.dog.id,
  name: competitor.dog.name,
  owner: competitor.owner ?? "",
  handler: competitor.handler ?? "",
  identity: competitor.identity ?? "",
  team: competitor.team ?? "",
  country: competitor.country ?? "",
  breed: competitor.breed ?? "",
  position: competitor.position ?? 0,
  accepted: competitor.status === COMPETITOR_STATUS.ENROLLED,
  status: competitor.status ?? "",
  notCompeting: competitor.notCompeting ?? false,
  bih: competitor.bih ?? false,
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
