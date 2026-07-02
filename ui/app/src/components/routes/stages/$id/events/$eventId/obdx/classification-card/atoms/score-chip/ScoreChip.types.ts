export type ScoreChipShape = "square" | "pill";

export type ScoreChipProps = {
  value: number | null;
  rating: number | null | undefined;
  shape: ScoreChipShape;
  sublabel?: string;
  hasYellowCard?: boolean;
};
