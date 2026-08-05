export const roles = [
  "office", "casual", "date", "formal", "summer", "winter", "creative", "signature", "travel",
] as const;
export type FragranceRole = (typeof roles)[number];
export type Season = "spring" | "summer" | "fall" | "winter";

export type DnaDimension =
  | "fresh"
  | "green"
  | "woody"
  | "amber"
  | "sweet"
  | "dark"
  | "artistic"
  | "formal";

export interface FragranceRecord {
  id: string;
  brand: string;
  name: string;
  concentration: string;
  family: string;
  roles: FragranceRole[];
  seasons: Record<Season, number>;
  dna: Record<DnaDimension, number>;
  moods: string[];
  performance: { projection: number; longevity: number };
  intelligenceStatus: "calibration" | "validated" | "draft";
}
