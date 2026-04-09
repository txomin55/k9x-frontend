import { createSignal } from "solid-js";
import type { Dog } from "./dogCrudTypes";

const [dogDrafts, setDogDrafts] = createSignal<Record<string, Dog>>({});
const [removedDogIds, setRemovedDogIds] = createSignal<string[]>([]);

const removeId = (ids: string[], id: string) => ids.filter((entry) => entry !== id);

export const getDogDrafts = dogDrafts;
export const getRemovedDogIds = removedDogIds;

export const mergeDogsWithDrafts = (baseDogs?: Dog[]) => {
  const drafts = dogDrafts();
  const removedIds = new Set(removedDogIds());
  const dogs = baseDogs ?? [];
  const nextDogs = dogs
    .filter((dog) => !removedIds.has(dog.id))
    .map((dog) => drafts[dog.id] ?? dog);
  const baseIds = new Set(dogs.map((dog) => dog.id));
  const appendedDrafts = Object.values(drafts).filter(
    (dog) => !baseIds.has(dog.id) && !removedIds.has(dog.id),
  );

  return [...appendedDrafts, ...nextDogs];
};

export const upsertDogDraft = (dog: Dog) => {
  setDogDrafts((current) => ({
    ...current,
    [dog.id]: dog,
  }));
  setRemovedDogIds((current) => removeId(current, dog.id));
};

export const removeDogDraft = (dogId: string) => {
  setDogDrafts((current) => {
    const nextDrafts = { ...current };

    delete nextDrafts[dogId];

    return nextDrafts;
  });
  setRemovedDogIds((current) =>
    current.includes(dogId) ? current : [...current, dogId],
  );
};

export const clearDogDraft = (dogId: string) => {
  setDogDrafts((current) => {
    if (!(dogId in current)) return current;

    const nextDrafts = { ...current };

    delete nextDrafts[dogId];

    return nextDrafts;
  });
  setRemovedDogIds((current) => removeId(current, dogId));
};

export const replaceDogDrafts = (
  visibleDogs: Dog[] | null,
  baseDogs?: Dog[],
) => {
  const baseById = new Map((baseDogs ?? []).map((dog) => [dog.id, dog]));
  const visibleIds = new Set((visibleDogs ?? []).map((dog) => dog.id));
  const nextDrafts: Record<string, Dog> = {};
  const nextRemovedIds: string[] = [];

  for (const dog of visibleDogs ?? []) {
    const baseDog = baseById.get(dog.id);

    if (!baseDog || JSON.stringify(baseDog) !== JSON.stringify(dog)) {
      nextDrafts[dog.id] = dog;
    }
  }

  for (const dog of baseDogs ?? []) {
    if (!visibleIds.has(dog.id)) {
      nextRemovedIds.push(dog.id);
    }
  }

  setDogDrafts(nextDrafts);
  setRemovedDogIds(nextRemovedIds);
};
