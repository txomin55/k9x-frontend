export type LocalizedText = { es: string; en: string };

export type CompetitorRange = { min: number; max: number | null };

export type RankLetter = "E" | "D" | "C" | "B" | "A" | "S";

export type GlobalScaleRange = {
  letter: RankLetter;
  min: number;
  max: number;
};

export type GlobalScale = {
  min: number;
  max: number;
  ranges: GlobalScaleRange[];
};

/** Competitor-count tier, the layer that positions an event inside its category sub-band. */
export type TierDefinition = {
  tier: number;
  competitors: CompetitorRange;
};

export type CategoryId = "CLUB" | "OPEN" | "WC_Q" | "WC_SEMI" | "WC_FINAL";

export type Category = {
  id: CategoryId;
  name: LocalizedText;
  /** World championship rounds are fixed points: the competitor count does not move them. */
  championship: boolean;
};

export type GradeCategoryTier = {
  tier: number;
  competitors: CompetitorRange;
  rankScore: number;
  letter: RankLetter;
};

export type GradeCategory = {
  id: CategoryId;
  subBand: { min: number; max: number };
  /** `true` when the sub-band is a single point, i.e. a championship round. */
  fixed: boolean;
  tiers: GradeCategoryTier[];
};

export type Grade = {
  id: string;
  name: LocalizedText;
  band: { min: number; max: number };
  possibleLetters: RankLetter[];
  categories: GradeCategory[];
};

export type Federation = {
  id: string;
  name: string;
  grades: Grade[];
};

export type Qualification = {
  id: string;
  nameEn: string;
  score: number;
  top?: boolean;
};

export type MeritCurve = {
  context: {
    configuration: string;
    category: CategoryId;
    eventScore: number;
    /** The grade's floor, which every competitor of that grade is measured from. */
    gradeFloor: number;
    maxScore: number;
    qualifications: Qualification[];
    parameters: {
      unlockPct: number;
      kneeShare: number;
      floorBelowFirstQualification: number;
    };
  };
  series: { id: string; points: { x: number; y: number }[] }[];
};

export type ObdxMethodology = {
  schemaVersion: number;
  globalScale: GlobalScale;
  tiers: TierDefinition[];
  categories: Category[];
  federations: Federation[];
  meritCurve: MeritCurve;
};

export type DecaySeries = {
  id: "level" | "freshness";
  plateauMonths: number;
  floor: { fromMonth: number; value: number };
  anchors: { month: number; weight: number }[];
};

export type SlotFillingCase = {
  id: string;
  results: number[];
  slots: number[];
  level: number;
};

export type ExampleDog = {
  id: string;
  name: LocalizedText;
  results: { month: number; score: number }[];
  series: { month: number; index: number }[];
  events: { month: number; index: number; label: string; score: number }[];
};

export type K9xMethodology = {
  schemaVersion: number;
  indexScale: { min: number; max: number };
  decayCurves: { series: DecaySeries[] };
  indexExample: {
    formula: string;
    parameters: {
      N: number;
      C: number;
      cReference: LocalizedText;
      filler: string;
      provisionalIfResultsBelow: number;
    };
    slotFilling: { cases: SlotFillingCase[] };
    dogs: ExampleDog[];
  };
};
