import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";

type JudgeCardProps = {
  judge: IdNameDTO;
  onEdit: () => void;
  onDelete: () => void;
};

export type { JudgeCardProps };
