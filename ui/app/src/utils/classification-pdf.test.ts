import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  StageEventClassificationItemResponseDTO,
  StageEventClassificationResponseDTO,
} from "@/services/fetch-stages/fetchStages.types";

const autoTable = vi.fn();
const save = vi.fn();
const text = vi.fn();
const setFontSize = vi.fn();

vi.mock("jspdf", () => ({
  jsPDF: class {
    internal = {
      pageSize: { getWidth: () => 297 },
    };
    text = text;
    setFontSize = setFontSize;
    save = save;
  },
}));

vi.mock("jspdf-autotable", () => ({
  default: autoTable,
}));

vi.mock("@/utils/date", () => ({
  formatDateTime: () => "2026-07-11 10:00",
}));

function makeCompetitor(
  overrides: Partial<StageEventClassificationItemResponseDTO> = {},
): StageEventClassificationItemResponseDTO {
  return {
    country: { id: "es", name: "Spain" },
    dog: { id: "dog-1", name: "Rex" },
    exercises: [
      {
        exercise: { id: "ex-1", name: "Heelwork" },
        scores: [],
        exerciseScore: 45,
        scoreRating: 90,
        totalScore: 50,
        tags: [],
        yellowCards: [],
        redCard: null,
      },
    ],
    owner: "Owner",
    handler: "Handler One",
    position: 1,
    competitorNumber: 1,
    scoreRating: 90,
    status: "FINISHED",
    team: "Club A",
    totalScore: 195,
    tied: false,
    startOrder: 4,
    bih: false,
    reserve: false,
    awards: [],
    qualification: "Excellent",
    ...overrides,
  };
}

const classification: StageEventClassificationResponseDTO = {
  event: { id: "event-1", name: "Event" },
  competitionName: "Trofeo Test",
  discipline: { id: "obdx", name: "Obedience" },
  rank: "A",
  stage: { id: "stage-1", name: "Stage" },
  configuration: { id: "class-1", name: "Clase 1" },
  lastUpdated: 1_700_000_000_000,
  status: "FINISHED",
  obdx: {
    competitors: [],
    scoreCalculation: "SUM",
    judges: [{ id: "judge-1", name: "Ana Perez" }],
  },
};

describe("exportClassificationPdf", () => {
  afterEach(() => {
    autoTable.mockReset();
    save.mockReset();
    text.mockReset();
    setFontSize.mockReset();
  });

  const t = (key: string) => key;

  it("builds one body row per competitor with the summary columns", async () => {
    const { exportClassificationPdf } = await import("./classification-pdf");
    const competitors = [
      makeCompetitor(),
      makeCompetitor({
        dog: { id: "dog-2", name: "Luna" },
        position: 2,
        startOrder: 3,
        totalScore: 180,
        scoreRating: 70,
        exercises: [
          {
            exercise: { id: "ex-1", name: "Heelwork" },
            scores: [],
            exerciseScore: 40,
            scoreRating: 70,
            totalScore: 50,
            tags: [],
            yellowCards: [],
            redCard: null,
          },
        ],
      }),
    ];

    await exportClassificationPdf(classification, competitors, t);

    expect(autoTable).toHaveBeenCalledTimes(1);
    const options = autoTable.mock.calls[0][1];
    expect(options.body).toHaveLength(2);
    expect(options.head[0]).not.toContain("Heelwork");
    expect(options.body[0]).toEqual([
      "1",
      "4",
      "Handler One",
      "Rex",
      "Club A",
      "195",
      "90%",
      "Excellent",
    ]);
    expect(save).toHaveBeenCalledWith("clasificacion-trofeo-test-clase-1.pdf");
  });

  it("shows a dash for the position of non-competing dogs", async () => {
    const { exportClassificationPdf } = await import("./classification-pdf");
    const competitors = [makeCompetitor({ notCompeting: true, position: 0 })];

    await exportClassificationPdf(classification, competitors, t);

    const options = autoTable.mock.calls[0][1];
    expect(options.body[0][0]).toBe("-");
  });
});
