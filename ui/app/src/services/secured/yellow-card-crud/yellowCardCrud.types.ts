import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface RegisterYellowCardRequestDTO {
  dogId: string;
  exerciseId: string;
  judgeId: string;
}

export interface YellowCardResponseDTO {
  exercise: IdNameDTO;
  judge: IdNameDTO;
  timestamp: number;
}
