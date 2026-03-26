export interface ApiStage {
  dateFrom: number;
  dateTo: number;
  events: ApiStageEvent[];
  id: string;
  name: string;
}

export interface ApiStageEvent {
  competitors: ApiStageCompetitor[];
  configuration: ApiStageEventConfiguration;
  discipline: string;
  exercises: ApiStageExercise[];
  id: string;
  judges: ApiStageJudge[];
  name: string;
  status: string;
}

export interface ApiStageCompetitor {
  finalScore: number;
  id: string;
  identity: string;
  name: string;
  owner: string;
  scores: ApiStageEventScore[];
}

export interface ApiStageEventScore {
  exerciseId: string;
  id: string;
  score: number;
}

export interface ApiStageExercise {
  id: string;
  order: number;
  text: string;
}

export interface ApiStageEventConfiguration {
  federation: string;
  id: string;
  name: string;
  version: number;
}

export interface ApiStageJudge {
  collectorEmail: string;
  name: string;
}
