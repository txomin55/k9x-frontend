import { defaultDogs } from "@test/api-mocks/dogs";

export const resolveDogByIdPayload = (pathnameMatch?: RegExpMatchArray) => {
  const dogId = pathnameMatch?.[1] ?? "unknown-dog";
  return defaultDogs.find((candidate) => candidate.id === dogId) ?? {
    id: dogId,
    image: `https://images.example.test/dogs/${dogId}.png`,
    name: `Dog ${dogId}`,
  };
};
