export type LocalizedText = { es: string; en: string };

export type CompetitorRange = { min: number; max: number | null };

export type RankLetter = "E" | "D" | "C" | "B" | "A" | "S";

export type GlobalScaleRange = {
  letter: RankLetter;
  min: number;
  max: number;
  alwaysInternational?: boolean;
};

export type GlobalScale = {
  min: number;
  max: number;
  automaticCap: number;
  ranges: GlobalScaleRange[];
  internationalSuffix: string;
};

export type ForeignersByTier = {
  tier: number;
  competitors: CompetitorRange;
  requiredForeigners: number;
};

export type International = {
  bonusValue: number;
  bonusValueUnit: string;
  foreignersByTier: ForeignersByTier[];
};

export type GradeTier = {
  tier: number;
  competitors: CompetitorRange;
  requiredForeigners: number;
  tierContributionPctOfRange: number;
  nationalRankScore: number;
  nationalLetter: string;
  internationalRankScore: number;
  internationalLetter: string;
};

export type Grade = {
  id: string;
  name: LocalizedText;
  band: { min: number; max: number };
  possibleLetters: string[];
  internationalBonus: {
    bonusValue: number;
    bonusValueUnit: string;
    points: number;
  };
  tiers: GradeTier[];
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
    eventScore: number;
    band: { min: number; max: number };
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
  international: International;
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
