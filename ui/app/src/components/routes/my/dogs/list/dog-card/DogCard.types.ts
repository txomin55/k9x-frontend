import type { Dog } from "@/services/api/dog-crud/dogCrudTypes";

type DogCardProps = {
  dog: Dog;
  onEdit: () => void;
  onDelete: () => void;
};

export type { DogCardProps };
