export interface Configuration {
  id: string;
  name: string;
}

export interface Federation {
  id: string;
  name: string;
  country: string;
}

export interface FederationConfigurations {
  info: Federation;
  configurations: Configuration[];
}

export interface DisciplineFederationConfigurations {
  federations: FederationConfigurations[];
  disciplineId: string;
}
