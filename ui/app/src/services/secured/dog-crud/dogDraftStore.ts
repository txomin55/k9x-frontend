import { createSignal } from "solid-js";
import type { Dog } from "./dogCrud.types";

const [dogDrafts, setDogDrafts] = createSignal<Record<string, Dog>>({});
const [removedDogIdentifications, setRemovedDogIdentifications] = createSignal<
  string[]
>([]);

const removeId = (ids: string[], id: string) =>
  ids.filter((entry) => entry !== id);

export const mergeDogsWithDrafts = (baseDogs?: Dog[]) => {
  const drafts = dogDrafts();
  const removedIds = new Set(removedDogIdentifications());
  const dogs = baseDogs ?? [];
  const nextDogs = dogs
    .filter((dog) => !removedIds.has(dog.identification))
    .map((dog) => drafts[dog.identification] ?? dog);
  const baseIds = new Set(dogs.map((dog) => dog.identification));
  const appendedDrafts = Object.values(drafts).filter(
    (dog) =>
      !baseIds.has(dog.identification) && !removedIds.has(dog.identification),
  );

  return [...appendedDrafts, ...nextDogs];
};

export const upsertDogDraft = (dog: Dog) => {
  setDogDrafts((current) => ({
    ...current,
    [dog.identification]: dog,
  }));
  setRemovedDogIdentifications((current) =>
    removeId(current, dog.identification),
  );
};

export const removeDogDraft = (dogIdentification: string) => {
  setDogDrafts((current) => {
    const nextDrafts = { ...current };

    delete nextDrafts[dogIdentification];

    return nextDrafts;
  });
  setRemovedDogIdentifications((current) =>
    current.includes(dogIdentification)
      ? current
      : [...current, dogIdentification],
  );
};

export const clearDogDraft = (dogIdentification: string) => {
  setDogDrafts((current) => {
    if (!(dogIdentification in current)) return current;

    const nextDrafts = { ...current };

    delete nextDrafts[dogIdentification];

    return nextDrafts;
  });
  setRemovedDogIdentifications((current) =>
    removeId(current, dogIdentification),
  );
};

export const replaceDogDrafts = (
  visibleDogs: Dog[] | null,
  baseDogs?: Dog[],
) => {
  const baseById = new Map(
    (baseDogs ?? []).map((dog) => [dog.identification, dog]),
  );
  const visibleIds = new Set(
    (visibleDogs ?? []).map((dog) => dog.identification),
  );
  const nextDrafts: Record<string, Dog> = {};
  const nextRemovedIds: string[] = [];

  for (const dog of visibleDogs ?? []) {
    const baseDog = baseById.get(dog.identification);

    if (!baseDog || JSON.stringify(baseDog) !== JSON.stringify(dog)) {
      nextDrafts[dog.identification] = dog;
    }
  }

  for (const dog of baseDogs ?? []) {
    if (!visibleIds.has(dog.identification)) {
      nextRemovedIds.push(dog.identification);
    }
  }

  setDogDrafts(nextDrafts);
  setRemovedDogIdentifications(nextRemovedIds);
};
