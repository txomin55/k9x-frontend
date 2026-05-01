import type { Judge } from "@/services/secured/judge-crud/judgeCrud.types";

type JudgeCardProps = {
  judge: Judge;
  onEdit: () => void;
  onDelete: () => void;
};

export type { JudgeCardProps };
