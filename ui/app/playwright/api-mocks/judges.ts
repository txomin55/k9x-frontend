import type { Page } from "@playwright/test";
import type { JudgeResponseDTO } from "@/services/secured/judge-crud/judgeCrud.types";
import { setRouteResponses } from "@test/utils/playwrightMockingUtils";

export const defaultJudges: JudgeResponseDTO[] = [
  { id: "judge-1", name: "Judge Alpha", country: "es" },
  { id: "judge-2", name: "Judge Beta", country: "pt" },
];

/**
 * Stateful `/secured/judges` mocks so a post-flush reload reflects each write.
 * GET returns the live collection; POST/PUT/DELETE mutate it.
 */
export const setupJudgesCrud = (page: Page) => {
  const judges: Record<string, unknown>[] = defaultJudges.map((judge) => ({
    ...judge,
  }));
  const indexOf = (id: string | undefined) =>
    judges.findIndex((judge) => judge.id === id);

  return Promise.all([
    setRouteResponses(page, {
      method: "GET",
      payload: () => judges,
      pathname: "/secured/judges",
    }),
    setRouteResponses(page, {
      method: "POST",
      payload: (_match, request) => {
        judges.push(request.postDataJSON());
        return "";
      },
      pathname: "/secured/judges",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "PUT",
      payload: (match, request) => {
        const index = indexOf(match?.[1]);
        const update = request.postDataJSON();
        judges[index] = { ...judges[index], ...update };
        return "";
      },
      pathname: "/secured/judges/*",
      status: 204,
    }),
    setRouteResponses(page, {
      method: "DELETE",
      payload: (match) => {
        judges.splice(indexOf(match?.[1]), 1);
        return "";
      },
      pathname: "/secured/judges/*",
      status: 204,
    }),
  ]);
};
