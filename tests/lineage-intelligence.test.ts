import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import {
  analyzeLineageIntelligence,
  calculateDnaInheritance,
  calculateEvolutionScore,
  calculateOriginalityScore,
} from "@/lib/intelligence/lineage-intelligence-engine";
import {
  createLineageRegistry,
} from "@/lib/lineage/registry";

const catalog:
  FragranceRecord[] = [
    {
      id: "atlas-edt",
      brand: "Example House",
      name: "Atlas",
      concentration:
        "Eau de Toilette",
      releaseYear: 2010,
      family:
        "Citrus Woody",
      roles: [
        "office",
        "summer",
      ],
      seasons: {
        spring: 90,
        summer: 95,
        fall: 65,
        winter: 35,
      },
      dna: {
        fresh: 90,
        green: 55,
        woody: 62,
        amber: 18,
        sweet: 15,
        dark: 12,
        artistic: 58,
        formal: 64,
      },
      moods: ["fresh"],
      performance: {
        longevity: 68,
        projection: 72,
        sillage: 66,
      },
      intelligenceStatus:
        "validated",
    },
    {
      id: "atlas-edp",
      brand: "Example House",
      name: "Atlas Eau de Parfum",
      concentration:
        "Eau de Parfum",
      releaseYear: 2014,
      family:
        "Citrus Woody",
      roles: [
        "office",
        "date",
        "formal",
      ],
      seasons: {
        spring: 86,
        summer: 78,
        fall: 82,
        winter: 65,
      },
      dna: {
        fresh: 76,
        green: 40,
        woody: 72,
        amber: 42,
        sweet: 30,
        dark: 28,
        artistic: 66,
        formal: 78,
      },
      moods: ["refined"],
      performance: {
        longevity: 82,
        projection: 78,
        sillage: 74,
      },
      intelligenceStatus:
        "validated",
    },
    {
      id: "atlas-parfum",
      brand: "Example House",
      name: "Atlas Parfum",
      concentration:
        "Parfum",
      releaseYear: 2018,
      family:
        "Woody Amber",
      roles: [
        "formal",
        "date",
        "winter",
      ],
      seasons: {
        spring: 68,
        summer: 42,
        fall: 90,
        winter: 92,
      },
      dna: {
        fresh: 48,
        green: 22,
        woody: 84,
        amber: 70,
        sweet: 46,
        dark: 62,
        artistic: 78,
        formal: 92,
      },
      moods: ["elegant"],
      performance: {
        longevity: 92,
        projection: 84,
        sillage: 80,
      },
      intelligenceStatus:
        "validated",
    },
  ];

const database =
  buildGlobalFragranceDatabase({
    catalog,
  });

const registry =
  createLineageRegistry({
    lines: [
      {
        id: "line-atlas",
        canonicalName: "Atlas",
        brandId:
          database.brands[0].id,
        originalFragranceId:
          "atlas-edt",
        memberIds: [
          "atlas-edt",
          "atlas-edp",
          "atlas-parfum",
        ],
        confidence: 98,
        source: "curated",
      },
    ],
    metadata: [
      {
        fragranceId:
          "atlas-edt",
        lineId: "line-atlas",
        generation: 0,
        releaseOrder: 1,
        relationship:
          "original",
        status: "active",
        concentrationId:
          "eau-de-toilette",
        successorId:
          "atlas-edp",
        confidence: 98,
        source: "curated",
      },
      {
        fragranceId:
          "atlas-edp",
        lineId: "line-atlas",
        parentId:
          "atlas-edt",
        generation: 1,
        releaseOrder: 2,
        relationship:
          "flanker",
        status: "active",
        concentrationId:
          "eau-de-parfum",
        predecessorId:
          "atlas-edt",
        successorId:
          "atlas-parfum",
        confidence: 98,
        source: "curated",
      },
      {
        fragranceId:
          "atlas-parfum",
        lineId: "line-atlas",
        parentId:
          "atlas-edt",
        generation: 1,
        releaseOrder: 3,
        relationship:
          "successor",
        status:
          "discontinued",
        concentrationId:
          "parfum",
        predecessorId:
          "atlas-edp",
        inspiredByIds: [
          "atlas-edt",
        ],
        confidence: 98,
        source: "curated",
      },
    ],
  });

describe("Lineage Intelligence Core", () => {
  it("builds normalized fragrance lines, nodes, and chronology", () => {
    const result =
      analyzeLineageIntelligence({
        database,
        registry,
        inferMissing: false,
      });

    expect(
      result.modelVersion,
    ).toBe("LIE-1.0.0");
    expect(result.lines).toHaveLength(1);
    expect(result.nodes).toHaveLength(3);
    expect(
      result.lines[0].chronology,
    ).toEqual([
      "atlas-edt",
      "atlas-edp",
      "atlas-parfum",
    ]);
    expect(
      result.lines[0]
        .discontinuedMemberIds,
    ).toEqual([
      "atlas-parfum",
    ]);
  });

  it("calculates DNA inheritance and evolutionary movement", () => {
    const original =
      database.fragrances[0];
    const parfum =
      database.fragrances[2];

    expect(
      calculateDnaInheritance({
        original,
        current: original,
      }),
    ).toBe(100);

    expect(
      calculateDnaInheritance({
        original,
        current: parfum,
      }),
    ).toBeLessThan(80);

    expect(
      calculateEvolutionScore({
        original,
        current: parfum,
      }),
    ).toBeGreaterThan(
      calculateEvolutionScore({
        original,
        current:
          database.fragrances[1],
      }),
    );
  });

  it("calculates performance deltas and originality", () => {
    const result =
      analyzeLineageIntelligence({
        database,
        registry,
        inferMissing: false,
      });
    const parfum =
      result.nodes.find(
        (node) =>
          node.fragranceId ===
          "atlas-parfum",
      );

    expect(
      parfum?.performanceDelta
        .longevity,
    ).toBe(24);
    expect(
      parfum?.performanceDelta
        .projection,
    ).toBe(12);
    expect(
      parfum?.originalityScore,
    ).toBeGreaterThan(0);

    expect(
      calculateOriginalityScore({
        original:
          database.fragrances[0],
        current:
          database.fragrances[0],
      }),
    ).toBe(100);
  });

  it("creates parent, successor, predecessor, and inspiration edges", () => {
    const result =
      analyzeLineageIntelligence({
        database,
        registry,
        inferMissing: false,
      });

    const edgeTypes =
      new Set(
        result.edges.map(
          (edge) => edge.type,
        ),
      );

    expect(
      edgeTypes.has(
        "parent-child",
      ),
    ).toBe(true);
    expect(
      edgeTypes.has("successor"),
    ).toBe(true);
    expect(
      edgeTypes.has(
        "predecessor",
      ),
    ).toBe(true);
    expect(
      edgeTypes.has(
        "inspired-by",
      ),
    ).toBe(true);
  });

  it("rejects registries that reference unknown fragrances", () => {
    const invalid =
      createLineageRegistry({
        lines: [
          {
            id: "line-invalid",
            canonicalName:
              "Invalid",
            brandId:
              database.brands[0]
                .id,
            originalFragranceId:
              "missing",
            memberIds: [
              "missing",
            ],
            confidence: 100,
            source: "curated",
          },
        ],
        metadata: [],
      });

    expect(() =>
      analyzeLineageIntelligence({
        database,
        registry: invalid,
        inferMissing: false,
      }),
    ).toThrow(
      "Unknown original fragrance",
    );
  });
});
