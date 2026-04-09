import type { Judge } from "@/services/api/judge-crud/judgeCrudTypes";

type JudgeCardProps = {
  judge: Judge;
  onEdit: () => void;
  onDelete: () => void;
};

export type { JudgeCardProps };
