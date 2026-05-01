import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";

type DogCardProps = {
  dog: Dog;
  onEdit: () => void;
  onDelete: () => void;
};

export type { DogCardProps };
