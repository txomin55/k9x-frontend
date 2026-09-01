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
    identification: "dog-1",
    name: "Luna",
    image: "https://images.example.test/dogs/dog-1.png",
    breed: { id: "border-collie", name: "Border Collie" },
    origin: "ES-DOG-1",
    license: "LIC-DOG-1",
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
    identification: "dog-2",
    name: "Koda",
    image: "https://images.example.test/dogs/dog-2.png",
    breed: { id: "labrador", name: "Labrador" },
    origin: "ES-DOG-2",
    license: "LIC-DOG-2",
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

const contains = (term: string, value: unknown) =>
  Boolean(term) &&
  String(value ?? "")
    .toLowerCase()
    .includes(term);

/**
 * Answers `/secured/dogs` the way the API does: a page of the list, filtered by name and by
 * identification when the query carries them — a dog matches when either of the two does — and the
 * whole list in one page when no size is asked for.
 */
export const toDogsPage = (dogs: Record<string, unknown>[], url: string) => {
  const params = new URL(url).searchParams;
  const name = (params.get("name") ?? "").trim().toLowerCase();
  const identification = (params.get("identification") ?? "")
    .trim()
    .toLowerCase();
  const matching =
    name || identification
      ? dogs.filter(
          (dog) =>
            contains(name, dog.name) ||
            contains(identification, dog.identification),
        )
      : dogs;

  const size = params.get("size")
    ? Number(params.get("size"))
    : matching.length;
  const page = params.get("page") ? Number(params.get("page")) : 0;
  const items = size
    ? matching.slice(page * size, page * size + size)
    : matching;

  return {
    items,
    page,
    size,
    total: matching.length,
    totalPages: size
      ? Math.ceil(matching.length / size)
      : matching.length
        ? 1
        : 0,
  };
};

/**
 * Stateful `/secured/dogs` mocks so a post-flush reload reflects each write.
 * GET returns the live collection; POST/PUT/DELETE mutate it.
 */
export const setupDogsCrud = (page: Page) => {
  const dogs: Record<string, unknown>[] = defaultDogs.map((dog) => ({
    ...dog,
  }));
  const indexOf = (id: string | undefined) =>
    dogs.findIndex((dog) => dog.identification === id);

  return Promise.all([
    setRouteResponses(page, {
      method: "GET",
      payload: (_match, request) => toDogsPage(dogs, request.url()),
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
