import type { JudgeResponseDTO } from "@/services/secured/judge-crud/judgeCrud.types";

type JudgeCardProps = {
  judge: JudgeResponseDTO;
  onEdit: () => void;
  onDelete: () => void;
};

export type { JudgeCardProps };
