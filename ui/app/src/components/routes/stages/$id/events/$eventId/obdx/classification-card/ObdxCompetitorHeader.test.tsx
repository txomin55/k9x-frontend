import { render } from "@solidjs/testing-library";
import ObdxCompetitorHeader from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/ObdxCompetitorHeader";
import type { StageEventClassificationItemResponseDTO } from "@/services/fetch-stages/fetchStages.types";

vi.mock("@/components/common/country-flag/CountryFlag", () => ({
  default: () => <span>flag</span>,
}));

const buildCompetitor = (
  overrides: Partial<StageEventClassificationItemResponseDTO> = {},
): StageEventClassificationItemResponseDTO => ({
  country: { id: "es", name: "Spain" },
  dog: { id: "dog-1", name: "Koda" },
  exercises: [],
  owner: "owner@example.com",
  handler: "Carlos",
  position: 1,
  scoreRating: 0,
  status: "STARTED",
  team: "team",
  totalScore: 0,
  tied: false,
  startOrder: 1,
  bih: false,
  awards: [],
  ...overrides,
});

describe("ObdxCompetitorHeader", () => {
  test("shows the BIH indicator when the competitor is best in show", () => {
    const competitor = buildCompetitor({ bih: true });
    const { container } = render(() => (
      <ObdxCompetitorHeader competitor={competitor} />
    ));

    expect(container.querySelector(".bih-indicator")).toBeInTheDocument();
  });

  test("hides the BIH indicator when the competitor is not best in show", () => {
    const competitor = buildCompetitor({ bih: false });
    const { container } = render(() => (
      <ObdxCompetitorHeader competitor={competitor} />
    ));

    expect(container.querySelector(".bih-indicator")).not.toBeInTheDocument();
  });
});
