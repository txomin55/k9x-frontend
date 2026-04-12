export interface Configuration {
  id: string;
  name: string;
}

export interface Federation {
  id: string;
  name: string;
  country: string;
}

export interface FederationDiscipline {
  configurations?: Configuration[];
  federation: Federation[];
  disciplineId: string;
}
