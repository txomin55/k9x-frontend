import type { Page } from "@playwright/test";
import type { Dog } from "@/services/secured/dog-crud/dogCrud.types";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";
import { defaultBreeds } from "@test/api-mocks/breeds";

const resolveBreed = (payload: Record<string, unknown>) => {
  if (typeof payload.breed !== "string") return payload;
  const breed = defaultBreeds.find(({ id }) => id === payload.breed) ?? {
    id: payload.breed,
    name: payload.breed,
  };
  return { ...payload, breed };
};

export const defaultDogs: Dog[] = [
  {
    id: "dog-1",
    name: "Luna",
    image: "https://images.example.test/dogs/dog-1.png",
    breed: { id: "border-collie", name: "Border Collie" },
    identity: "ES-DOG-1",
    owner: "Carlos Competitor",
    handler: "Carlos Competitor",
    team: "Team Alpha",
    country: { id: "ES", name: "Spain" },
    sex: "FEMALE",
    withersCm: 52,
    owned: true,
    threeFciGenerationsConfirmed: false,
  },
  {
    id: "dog-2",
    name: "Koda",
    image: "https://images.example.test/dogs/dog-2.png",
    breed: { id: "labrador", name: "Labrador" },
    identity: "ES-DOG-2",
    owner: "Carlos Competitor",
    handler: "Carlos Competitor",
    team: "Team Beta",
    country: { id: "ES", name: "Spain" },
    sex: "MALE",
    withersCm: 58,
    owned: true,
    threeFciGenerationsConfirmed: true,
  },
];

/**
 * Stateful `/secured/dogs` mocks so a post-flush reload reflects each write.
 * GET returns the live collection; POST/PUT/DELETE mutate it.
 */
export const setupDogsCrud = (page: Page) => {
  const dogs: Record<string, unknown>[] = defaultDogs.map((dog) => ({ ...dog }));
  const indexOf = (id: string | undefined) =>
    dogs.findIndex((dog) => dog.id === id);

  return Promise.all([
    setRouteResponses(page, {
      method: "GET",
      payload: () => dogs,
      pathname: "/secured/dogs",
    }),
    setRouteResponses(page, {
      method: "POST",
      payload: (_match, request) => {
        dogs.push(resolveBreed(request.postDataJSON()));
        return "";
      },
      pathname: "/secured/dogs",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: (match, request) => {
        const index = indexOf(match?.[1]);
        const update = resolveBreed(request.postDataJSON());
        dogs[index] = { ...dogs[index], ...update };
        return "";
      },
      pathname: "/secured/dogs/*",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "DELETE",
      payload: (match) => {
        dogs.splice(indexOf(match?.[1]), 1);
        return "";
      },
      pathname: "/secured/dogs/*",
      status: 204,
    }),
  ]);
};
