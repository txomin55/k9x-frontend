import type { Judge } from "@/services/api/judge-crud/judgeCrud.types";

type JudgeCardProps = {
  judge: Judge;
  onEdit: () => void;
  onDelete: () => void;
};

export type { JudgeCardProps };
