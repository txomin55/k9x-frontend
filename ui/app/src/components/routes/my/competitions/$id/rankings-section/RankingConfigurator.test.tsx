import { render } from "@solidjs/testing-library";
import RankingConfigurator, {
  type RankingCompetitionOption,
  type RankingConfiguratorChange,
} from "@/components/routes/my/competitions/$id/rankings-section/RankingConfigurator";
import { RANKING_INCLUDE_BY, RANKING_GROUP_BY } from "@/utils/ranking";

vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const GROUP_BY_OPTIONS = [
  { id: RANKING_GROUP_BY.INDIVIDUAL, name: "Individual" },
  { id: RANKING_GROUP_BY.TEAM, name: "Team" },
];

const INCLUDE_BY_OPTIONS = [
  { id: RANKING_INCLUDE_BY.ALL, name: "Every result" },
  { id: RANKING_INCLUDE_BY.LOWEST, name: "Worst results" },
];

const competition = (id: string, name: string): RankingCompetitionOption => ({
  id,
  name,
  stages: [
    {
      id: `${id}_stage_1`,
      name: "Stage 1",
      events: [
        { id: `${id}_event_1`, name: "Event 1" },
        { id: `${id}_event_2`, name: "Event 2" },
      ],
    },
  ],
});

const renderConfigurator = (
  overrides: Partial<Parameters<typeof RankingConfigurator>[0]> = {},
) => {
  const changes: RankingConfiguratorChange[] = [];
  const removals: number[] = [];
  const result = render(() => (
    <RankingConfigurator
      competitions={[competition("competition_1", "Competition 1")]}
      events={[]}
      groupBy={RANKING_GROUP_BY.INDIVIDUAL}
      includeBy={RANKING_INCLUDE_BY.ALL}
      includedCount={null}
      groupByOptions={GROUP_BY_OPTIONS}
      includeByOptions={INCLUDE_BY_OPTIONS}
      onChange={(change) => changes.push(change)}
      onRemoveLastEvent={() => removals.push(1)}
      {...overrides}
    />
  ));

  return { ...result, changes, removals };
};

describe("RankingConfigurator", () => {
  test("hides the competition select when there is only one competition", () => {
    const { getByText, queryByText } = renderConfigurator();

    expect(
      queryByText("MY.COMPETITIONS.RANKINGS_SECTION.COMPETITION"),
    ).not.toBeInTheDocument();
    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.STAGE"),
    ).toBeInTheDocument();
  });

  test("shows the competition select as soon as there is more than one", () => {
    const { getByText } = renderConfigurator({
      competitions: [
        competition("competition_1", "Competition 1"),
        competition("competition_2", "Competition 2"),
      ],
    });

    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.COMPETITION"),
    ).toBeInTheDocument();
  });

  test("keeps the add button disabled while no event is selected", () => {
    const { container } = renderConfigurator();

    expect(
      container.querySelector(".ranking-configurator__add"),
    ).toBeDisabled();
  });

  test("renders one chip per added event", () => {
    const { container, getByText } = renderConfigurator({
      events: [
        { id: "competition_1_event_1", name: "Event 1" },
        { id: "competition_1_event_2", name: "Event 2" },
      ],
    });

    expect(
      container.querySelectorAll(".ranking-configurator__event"),
    ).toHaveLength(2);
    expect(getByText("Event 1")).toBeInTheDocument();
    expect(getByText("Event 2")).toBeInTheDocument();
  });

  test("removing one of several events emits the reduced list", () => {
    const { container, changes } = renderConfigurator({
      events: [
        { id: "competition_1_event_1", name: "Event 1" },
        { id: "competition_1_event_2", name: "Event 2" },
      ],
    });

    container
      .querySelectorAll<HTMLButtonElement>(
        ".ranking-configurator__event-remove",
      )[0]
      .click();

    expect(changes).toHaveLength(1);
    expect(changes[0].eventIds).toEqual(["competition_1_event_2"]);
  });

  test("removing the last event delegates to the page instead of emitting a change", () => {
    const { container, changes, removals } = renderConfigurator({
      events: [{ id: "competition_1_event_1", name: "Event 1" }],
    });

    container
      .querySelector<HTMLButtonElement>(".ranking-configurator__event-remove")!
      .click();

    expect(changes).toHaveLength(0);
    expect(removals).toHaveLength(1);
  });

  test("hides the included count while every result counts", () => {
    const { queryByText } = renderConfigurator();

    expect(
      queryByText("MY.COMPETITIONS.RANKINGS_SECTION.INCLUDED_COUNT"),
    ).not.toBeInTheDocument();
  });

  test("shows the included count once an inclusion criterion is chosen", () => {
    const { getByText } = renderConfigurator({
      includeBy: RANKING_INCLUDE_BY.LOWEST,
      includedCount: 2,
    });

    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.INCLUDED_COUNT"),
    ).toBeInTheDocument();
  });

  test("shows the empty message when the ranking has no events", () => {
    const { getByText } = renderConfigurator();

    expect(
      getByText("MY.COMPETITIONS.RANKINGS_SECTION.NO_EVENTS"),
    ).toBeInTheDocument();
  });

  test("disables the remove buttons when the configurator is read only", () => {
    const { container } = renderConfigurator({
      disabled: true,
      events: [{ id: "competition_1_event_1", name: "Event 1" }],
    });

    expect(
      container.querySelector(".ranking-configurator__event-remove"),
    ).toBeDisabled();
  });
});
