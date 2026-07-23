import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface ConfigurationResponseDTO {
  id: string;
  name: string;
  exercises: IdNameDTO[];
}

export interface FederationConfigurationResponseDTO {
  id: string;
  name: string;
}

export const EMPTY_FEDERATION_CONFIGURATION: FederationConfigurationResponseDTO =
  {
    id: "",
    name: "",
  };

export interface FederationConfigurationsResponseDTO {
  info: FederationConfigurationResponseDTO;
  configurations: ConfigurationResponseDTO[];
}

export interface ObdxFederationConfigurationResponseDTO {
  federations: FederationConfigurationsResponseDTO[];
}

export interface DisciplineFederationConfigurationResponseDTO {
  obdx: ObdxFederationConfigurationResponseDTO;
}
