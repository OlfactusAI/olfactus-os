import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  buildLineageSystemIndex,
  getLineageSystemContext,
} from "@/lib/intelligence/lineage-system-integration";

const base = {
  brand: "Example",
  family: "Woody",
  roles: ["office"] as const,
  seasons: {
    spring: 80,
    summer: 70,
    fall: 70,
    winter: 60,
  },
  dna: {
    fresh: 60,
    green: 40,
    woody: 70,
    amber: 30,
    sweet: 20,
    dark: 20,
    artistic: 60,
    formal: 70,
  },
  moods: ["refined"],
  performance: {
    longevity: 75,
    projection: 70,
  },
  intelligenceStatus: "validated" as const,
};

const catalog: FragranceRecord[] = [
  {
    ...base,
    id: "vector-edt",
    name: "Vector",
    concentration: "Eau de Toilette",
    releaseYear: 2012,
    roles: [...base.roles],
  },
  {
    ...base,
    id: "vector-edp",
    name: "Vector Eau de Parfum",
    concentration: "Eau de Parfum",
    releaseYear: 2016,
    roles: ["office", "formal"],
    dna: {
      ...base.dna,
      fresh: 48,
      amber: 48,
      formal: 82,
    },
    performance: {
      longevity: 86,
      projection: 78,
    },
  },
  {
    ...base,
    id: "solo",
    name: "Solo",
    concentration: "Eau de Parfum",
    releaseYear: 2020,
    roles: [...base.roles],
  },
];

describe("Lineage System Integration", () => {
  it("creates reusable lineage context for connected modules", () => {
    const index = buildLineageSystemIndex({
      catalog,
      collection: [
        {
          fragranceId: "vector-edt",
            daysSinceLastWear: 0,
          wearCount: 4,
        },
      ],
    });

    const context = index.contexts.get("vector-edt");

    expect(context?.hasKnownLineage).toBe(true);
    expect(context?.memberCount).toBe(2);
    expect(context?.buyConfidence).toBeGreaterThan(0);
  });

  it("returns safe links for orphan fragrances", () => {
    const context = getLineageSystemContext({
      fragranceId: "solo",
      catalog,
      collection: [],
    });

    expect(context.hasKnownLineage).toBe(false);
    expect(context.lineageHref).toContain("fragrance=solo");
    expect(context.graphHref).toContain("fragrance=solo");
  });
});
