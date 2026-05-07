export interface ConfigurationExercise {
  id: string;
  name: string;
}

export interface Configuration {
  id: string;
  name: string;
  exercises?: ConfigurationExercise[];
}

export interface FederationConfiguration {
  id: string;
  name: string;
  country: string;
}

export const EMPTY_FEDERATION_CONFIGURATION: FederationConfiguration = {
  country: "",
  id: "",
  name: "",
};

export interface FederationConfigurations {
  info: FederationConfiguration;
  configurations: Configuration[];
}

export interface DisciplineFederationConfigurations {
  federations: FederationConfigurations[];
  disciplineId: string;
}
