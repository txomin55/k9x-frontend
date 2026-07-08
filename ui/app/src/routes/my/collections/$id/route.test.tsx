import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import type { JSX } from "solid-js";
import { createSignal } from "solid-js";
import type { CollectionResponseDTO } from "@/services/secured/collection-crud/collectionCrud.types";
import { Route } from "@/routes/my/collections/$id/route";

const mocks = vi.hoisted(() => ({
  collectionDataAccessor: (() => undefined) as () =>
    | CollectionResponseDTO
    | undefined,
  updateCollectionScore: vi.fn(),
}));

vi.mock("@tanstack/solid-router", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@tanstack/solid-router")>();

  return {
    ...actual,
    useParams: () => () => ({ id: "event-1" }),
    useSearch: () => () => ({ competitorId: "dog-1", judgesIds: [] }),
  };
});

vi.mock("@/services/secured/collection-crud/collectionCrud", () => ({
  getCachedCollections: vi.fn(() => []),
  updateCollectionScore: mocks.updateCollectionScore,
  useCollectionById: () => ({
    get data() {
      return mocks.collectionDataAccessor();
    },
  }),
  useCollections: () => ({ data: [] }),
}));

vi.mock("@lib/components/atoms/select/AtomSelect", () => ({
  default: () => <div />,
}));

vi.mock(
  "@/components/routes/my/collections/$id/obdx/scores-competitor-pre-label/ScoresCompetitorPreLabel",
  () => ({
    default: () => <div />,
  }),
);

vi.mock("@lib/components/atoms/number-input/AtomNumberInput", () => ({
  default: (props: {
    rawValue?: number;
    onBlur?: JSX.FocusEventHandlerUnion<HTMLInputElement, FocusEvent>;
    onRawValueChange?: (value: number) => void;
  }) => (
    <input
      aria-label="score-input"
      type="number"
      value={props.rawValue ?? ""}
      onBlur={props.onBlur}
      onInput={(event) =>
        props.onRawValueChange?.(Number(event.currentTarget.value))
      }
    />
  ),
}));

const createCollection = (score: number): CollectionResponseDTO => ({
  configuration: {
    allowedValues: [1, 2, 3],
    description: "allowed values",
  },
  discipline: {
    id: "123",
    name: "discipline",
  },
  obdx: {
    competitors: [
      {
        competitor: {
          dog: { id: "dog-1", name: "Dog 1" },
          owner: "Owner",
          handler: "Handler",
          position: 1,
          team: "",
          identity: "",
          country: "",
          status: "",
          breed: "",
        } satisfies CollectionResponseDTO["obdx"]["competitors"][number]["competitor"],
        exercises: [
          {
            exercise: {
              id: "exercise-1",
              name: "ExerciseResponseDTO 1",
              position: 1,
            },
            collectionScores: [
              {
                judge: {
                  id: "judge-1",
                  name: "IdNameDTO 1",
                } as CollectionResponseDTO["obdx"]["competitors"][number]["exercises"][number]["collectionScores"][number]["judge"],
                score,
              },
            ],
          },
        ],
      },
    ],
  },
});

describe("collection detail route", () => {
  beforeEach(() => {
    mocks.updateCollectionScore.mockReset();
  });

  test("keeps the edited score visible while stale collection data is re-emitted", async () => {
    const user = userEvent.setup();
    const [collectionData, setCollectionData] = createSignal(
      createCollection(1),
    );
    mocks.collectionDataAccessor = collectionData;

    const Component = Route.options.component as () => JSX.Element;
    render(() => <Component />);

    const getScoreInput = () => screen.getByRole("spinbutton");

    expect(getScoreInput()).toHaveValue(1);

    await user.clear(getScoreInput());
    await user.type(getScoreInput(), "2");
    fireEvent.blur(getScoreInput());

    expect(mocks.updateCollectionScore).toHaveBeenCalledWith("event-1", {
      dogId: "dog-1",
      eventId: "event-1",
      exerciseId: "exercise-1",
      judgeId: "judge-1",
      score: 2,
    });

    setCollectionData(createCollection(1));

    await waitFor(() => {
      expect(getScoreInput()).toHaveValue(2);
    });

    setCollectionData(createCollection(2));

    await waitFor(() => {
      expect(getScoreInput()).toHaveValue(2);
    });
  });
});
