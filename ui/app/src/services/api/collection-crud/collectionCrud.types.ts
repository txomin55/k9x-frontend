import { Judge } from "@/services/api/judge-crud/judgeCrud.types";

export interface CollectionsRequest {
  competitionName: string;
  stageName: string;
  eventName: string;
  eventId: string;
  status: string;
  judges: Judge[];
}
