import { render } from "@solidjs/testing-library";
import RankingsSection from "@/components/routes/my/competitions/$id/rankings-section/RankingsSection";
import type { CompetitionResponseDTO } from "@/services/secured/competition-crud/competitionCrud.types";
import type { RankingResponseDTO } from "@/services/secured/ranking-crud/rankingCrud.types";
import { RANKING_INCLUDE_BY, RANKING_GROUP_BY } from "@/utils/ranking";

const mocks = vi.hoisted(() => ({
  ranking: null as RankingResponseDTO | null,
  deleteRanking: vi.fn(),
  saveRanking: vi.fn(),
}));

vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/services/secured/ranking-crud/rankingCrud", () => ({
  deleteRanking: mocks.deleteRanking,
  saveRanking: mocks.saveRanking,
  useRanking: () => ({
    get data() {
      return mocks.ranking;
    },
  }),
  useRankingGroupBys: () => ({
    get data() {
      return [{ id: RANKING_GROUP_BY.INDIVIDUAL, name: "Individual" }];
    },
  }),
  useRankingIncludeBys: () => ({
    get data() {
      return [{ id: RANKING_INCLUDE_BY.NONE, name: "Every result" }];
    },
  }),
}));

const competition: CompetitionResponseDTO = {
  id: "competition_1",
  name: "Competition 1",
  country: "",
  description: "",
  address: "",
  notifications: [],
  stages: [
    {
      id: "stage_1",
      name: "Stage 1",
      dateFrom: 0,
      dateTo: 0,
      notifications: [],
      status: "CREATED",
      events: [
        {
          id: "event_1",
          name: "Event 1",
          discipline: { id: "OBDX", name: "Obedience" },
          status: "CREATED",
          rank: "",
        },
      ],
    },
  ],
  status: "CREATED",
};

const renderSection = (
  props: { showsEditMenu?: boolean; menuOpen?: boolean } = {},
) =>
  render(() => (
    <RankingsSection
      competition={competition}
      showsEditMenu={props.showsEditMenu ?? true}
      menuOpen={props.menuOpen ?? false}
    />
  ));

const persistedRanking: RankingResponseDTO = {
  rankingId: "ranking_competition_1",
  name: "Ranking",
  events: [{ id: "event_1", name: "Event 1" }],
  groupBy: RANKING_GROUP_BY.INDIVIDUAL,
  includeBy: RANKING_INCLUDE_BY.NONE,
  includedCount: null,
};

describe("RankingsSection", () => {
  beforeEach(() => {
    mocks.ranking = null;
    mocks.deleteRanking.mockClear();
    mocks.saveRanking.mockClear();
  });

  test("offers the add action without entering edit mode", () => {
    const { getByText } = renderSection();

    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.ADD_RANKING"),
    ).toBeInTheDocument();
  });

  test("sits above the cog while the menu is closed", () => {
    const { container } = renderSection({ showsEditMenu: true });

    expect(
      container.querySelector(".floating-action--level-1"),
    ).toBeInTheDocument();
  });

  test("steps aside while the cog menu is open, leaving the level to the pencil", () => {
    const { queryByText } = renderSection({
      showsEditMenu: true,
      menuOpen: true,
    });

    expect(
      queryByText("MY.COMPETITIONS.RANKINGS_SECTION.ADD_RANKING"),
    ).not.toBeInTheDocument();
  });

  test("drops to the base level when the competition has no cog", () => {
    const { container, getByText } = renderSection({ showsEditMenu: false });

    // No cog means the competition is no longer editable, but a ranking can still be composed.
    expect(
      container.querySelector(".floating-action--level-0"),
    ).toBeInTheDocument();
    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.ADD_RANKING"),
    ).toBeInTheDocument();
  });

  test("stays available with the menu open when there is no cog", () => {
    const { getByText } = renderSection({
      showsEditMenu: false,
      menuOpen: true,
    });

    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.ADD_RANKING"),
    ).toBeInTheDocument();
  });

  test("adding a ranking only starts a local draft, with no request", () => {
    const { getByText, queryByText } = renderSection();

    getByText("MY.COMPETITIONS.RANKINGS_SECTION.ADD_RANKING").click();

    expect(mocks.saveRanking).not.toHaveBeenCalled();
    expect(
      queryByText("MY.COMPETITIONS.RANKINGS_SECTION.NO_EVENTS"),
    ).toBeInTheDocument();
  });

  test("swaps the action for the delete one once a ranking exists", () => {
    mocks.ranking = persistedRanking;

    const { getByText, queryByText } = renderSection();

    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.DELETE_RANKING"),
    ).toBeInTheDocument();
    expect(
      queryByText("MY.COMPETITIONS.RANKINGS_SECTION.ADD_RANKING"),
    ).not.toBeInTheDocument();
  });

  test("shows the empty message when there is no ranking", () => {
    const { getByText } = renderSection();

    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.EMPTY"),
    ).toBeInTheDocument();
  });
});
