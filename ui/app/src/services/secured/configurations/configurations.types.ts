import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface ConfigurationExerciseResponseDTO {
  id: string;
  name: string;
}

export interface ConfigurationResponseDTO {
  id: string;
  name: string;
  exercises?: ConfigurationExerciseResponseDTO[];
}

export interface FederationConfigurationResponseDTO {
  id: string;
  name: string;
  country: string;
}

export const EMPTY_FEDERATION_CONFIGURATION: FederationConfigurationResponseDTO = {
  country: "",
  id: "",
  name: "",
};

export interface FederationConfigurationsResponseDTO {
  info: FederationConfigurationResponseDTO;
  configurations: ConfigurationResponseDTO[];
}

export interface DisciplineFederationConfigurationResponseDTO {
  federations: FederationConfigurationsResponseDTO[];
  discipline: IdNameDTO;
}
