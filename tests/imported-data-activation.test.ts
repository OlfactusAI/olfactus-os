import {
  describe,
  expect,
  it,
} from "vitest";

import type { FragranceRecord } from "@/lib/domain/fragrance";
import { assessImportedFragranceReadiness } from "@/lib/database/imported-readiness";
import { mergeFragranceCatalogs } from "@/lib/database/active-catalog";

const base: FragranceRecord = {
  id: "base",
  brand: "Example",
  name: "Base",
  concentration: "Eau de Parfum",
  family: "Woody",
  perfumers: ["A Nose"],
  notes: {
    top: ["Bergamot"],
    heart: ["Lavender"],
    base: ["Cedar"],
  },
  accords: ["Woody"],
  roles: ["office"],
  seasons: {
    spring: 75,
    summer: 65,
    fall: 80,
    winter: 70,
  },
  dna: {
    fresh: 60,
    green: 40,
    woody: 80,
    amber: 40,
    sweet: 20,
    dark: 30,
    artistic: 65,
    formal: 75,
  },
  moods: ["refined"],
  performance: {
    longevity: 78,
    projection: 72,
  },
  intelligenceStatus: "validated",
};

describe("Imported Data Activation", () => {
  it("lets imported records override bundled records by ID", () => {
    const merged = mergeFragranceCatalogs(
      [base],
      [{ ...base, name: "Imported Override" }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].name).toBe("Imported Override");
  });

  it("classifies complete imported data as ready or partial", () => {
    const readiness = assessImportedFragranceReadiness(base);
    expect(["ready", "partial"]).toContain(readiness.level);
    expect(readiness.allowsAdvancedScoring).toBe(true);
  });

  it("keeps identity-only records search-only", () => {
    const readiness = assessImportedFragranceReadiness({
      ...base,
      id: "minimal",
      name: "Minimal",
      brand: "Example",
      concentration: "Eau de Parfum",
      family: "Unknown",
      perfumers: [],
      notes: { top: [], heart: [], base: [] },
      accords: [],
      roles: [],
      moods: [],
    });
    expect(readiness.level).toBe("search-only");
    expect(readiness.allowsAdvancedScoring).toBe(false);
  });
});
