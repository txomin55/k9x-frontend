import type { IdNameDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import type { PublicDog } from "@/services/fetch-dogs/fetchDogs.types";

/**
 * The countries the country filter of the public directory can offer. They cannot come from the secured
 * countries endpoint, so they are taken from the dogs already loaded — which carry their own localised
 * country name — deduplicated and sorted by that name. A country no loaded dog belongs to is therefore
 * not offered until scrolling reaches one.
 */
export const countriesOf = (dogs: PublicDog[]): IdNameDTO[] => {
  const nameById = new Map<string, string>();

  for (const dog of dogs) {
    const id = dog.country?.id;
    if (id && !nameById.has(id)) {
      nameById.set(id, dog.country.name || id);
    }
  }

  return [...nameById.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name));
};
