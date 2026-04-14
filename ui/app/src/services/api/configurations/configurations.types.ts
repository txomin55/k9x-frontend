export interface Configuration {
  id: string;
  name: string;
}

export interface FederationConfiguration {
  id: string;
  name: string;
  country: string;
}

export interface FederationConfigurations {
  info: FederationConfiguration;
  configurations: Configuration[];
}

export interface DisciplineFederationConfigurations {
  federations: FederationConfigurations[];
  disciplineId: string;
}
