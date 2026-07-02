import { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

export interface RegisterRedCardRequestDTO {
  dogId: string;
  exerciseId: string;
  judgeId: string;
}

export interface RedCardResponseDTO {
  exercise: IdNameDTO;
  judge: IdNameDTO;
  timestamp: number;
}
