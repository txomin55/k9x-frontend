import type { Dog } from "@/services/api/dog-crud/dogCrud.types";

type DogCardProps = {
  dog: Dog;
  onEdit: () => void;
  onDelete: () => void;
};

export type { DogCardProps };
