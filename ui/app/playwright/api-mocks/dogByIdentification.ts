import { defaultDogs } from "@test/api-mocks/dogs";

export const resolveDogByIdentificationPayload = (
  pathnameMatch?: RegExpMatchArray,
) => {
  const identification = pathnameMatch?.[1] ?? "unknown-dog";
  return (
    defaultDogs.find(
      (candidate) => candidate.identification === identification,
    ) ?? {
      identification,
      image: `https://images.example.test/dogs/${identification}.png`,
      name: `Dog ${identification}`,
    }
  );
};
