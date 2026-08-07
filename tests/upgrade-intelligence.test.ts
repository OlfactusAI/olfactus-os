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
  analyzeFamilyRedundancy,
  analyzeUpgrade,
  calculateDnaSeparation,
} from "@/lib/intelligence/upgrade-intelligence-engine";
import type {
  FragranceLine,
} from "@/lib/lineage/types";

const catalog:
  FragranceRecord[] = [
    {
      id: "axis-edt",
      brand: "Example",
      name: "Axis",
      concentration:
        "Eau de Toilette",
      family: "Citrus Woody",
      roles: ["office", "summer"],
      seasons: {
        spring: 90,
        summer: 95,
        fall: 65,
        winter: 35,
      },
      dna: {
        fresh: 90,
        green: 55,
        woody: 60,
        amber: 15,
        sweet: 12,
        dark: 10,
        artistic: 58,
        formal: 62,
      },
      moods: ["fresh"],
      performance: {
        longevity: 68,
        projection: 72,
      },
      intelligenceStatus:
        "validated",
    },
    {
      id: "axis-edp",
      brand: "Example",
      name: "Axis EDP",
      concentration:
        "Eau de Parfum",
      family: "Citrus Woody",
      roles: ["office", "date", "formal"],
      seasons: {
        spring: 85,
        summer: 78,
        fall: 82,
        winter: 60,
      },
      dna: {
        fresh: 74,
        green: 38,
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
      },
      intelligenceStatus:
        "validated",
    },
    {
      id: "axis-parfum",
      brand: "Example",
      name: "Axis Parfum",
      concentration: "Parfum",
      family: "Woody Amber",
      roles: ["formal", "winter", "date"],
      seasons: {
        spring: 65,
        summer: 40,
        fall: 92,
        winter: 95,
      },
      dna: {
        fresh: 42,
        green: 18,
        woody: 86,
        amber: 74,
        sweet: 48,
        dark: 68,
        artistic: 82,
        formal: 94,
      },
      moods: ["elegant"],
      performance: {
        longevity: 94,
        projection: 86,
      },
      intelligenceStatus:
        "validated",
    },
  ];

const database =
  buildGlobalFragranceDatabase({
    catalog,
  });

const line:
  FragranceLine = {
    id: "line-axis",
    canonicalName: "Axis",
    brandId:
      database.brands[0].id,
    originalFragranceId:
      "axis-edt",
    members: [
      {
        fragranceId:
          "axis-edt",
        lineId: "line-axis",
        generation: 0,
        releaseOrder: 1,
        relationship:
          "original",
        status: "active",
        concentrationId:
          "eau-de-toilette",
        dnaInheritance: 100,
        evolutionScore: 0,
        originalityScore: 100,
        performanceDelta: {
          longevity: 0,
          projection: 0,
          sillage: null,
        },
        dnaDeltas: [],
        children: [
          "axis-edp",
          "axis-parfum",
        ],
        inspiredByIds: [],
        cloneOfIds: [],
        confidence: 100,
      },
      {
        fragranceId:
          "axis-edp",
        lineId: "line-axis",
        parentId:
          "axis-edt",
        generation: 1,
        releaseOrder: 2,
        relationship:
          "flanker",
        status: "active",
        concentrationId:
          "eau-de-parfum",
        dnaInheritance: 84,
        evolutionScore: 28,
        originalityScore: 34,
        performanceDelta: {
          longevity: 14,
          projection: 6,
          sillage: null,
        },
        dnaDeltas: [],
        children: [],
        inspiredByIds: [],
        cloneOfIds: [],
        confidence: 100,
      },
      {
        fragranceId:
          "axis-parfum",
        lineId: "line-axis",
        parentId:
          "axis-edt",
        generation: 1,
        releaseOrder: 3,
        relationship:
          "successor",
        status: "active",
        concentrationId:
          "parfum",
        dnaInheritance: 62,
        evolutionScore: 55,
        originalityScore: 68,
        performanceDelta: {
          longevity: 26,
          projection: 14,
          sillage: null,
        },
        dnaDeltas: [],
        children: [],
        inspiredByIds: [],
        cloneOfIds: [],
        confidence: 100,
      },
    ],
    chronology: [
      "axis-edt",
      "axis-edp",
      "axis-parfum",
    ],
    activeMemberIds: [
      "axis-edt",
      "axis-edp",
      "axis-parfum",
    ],
    discontinuedMemberIds: [],
    averageInheritance: 82,
    averageEvolution: 28,
    confidence: 100,
  };

describe("Upgrade Intelligence", () => {
  it("calculates DNA separation and upgrade signals", () => {
    const owned =
      database.fragrances[0];
    const candidate =
      database.fragrances[2];

    expect(
      calculateDnaSeparation(
        owned,
        candidate,
      ),
    ).toBeGreaterThan(30);

    const result =
      analyzeUpgrade({
        owned,
        candidate,
        collection: [
          {
            fragranceId:
              owned.id,
            daysSinceLastWear: 0,
            wearCount: 10,
          },
        ],
      });

    expect(
      result.buyConfidence,
    ).toBeGreaterThan(0);
    expect(
      result.collectionGain,
    ).toBeGreaterThan(0);
    expect(
      result.explanation.length,
    ).toBeGreaterThan(10);
  });

  it("detects family redundancy across owned releases", () => {
    const analysis =
      analyzeFamilyRedundancy({
        line,
        database,
        collection: [
          {
            fragranceId:
              "axis-edt",
            daysSinceLastWear: 0,
            wearCount: 10,
          },
          {
            fragranceId:
              "axis-edp",
            daysSinceLastWear: 0,
            wearCount: 8,
          },
        ],
      });

    expect(
      analysis.ownedMemberIds,
    ).toHaveLength(2);
    expect(
      analysis.familyRedundancy,
    ).toBeGreaterThan(0);
    expect(
      analysis.items,
    ).toHaveLength(2);
  });

  it("returns zero redundancy for a single owned release", () => {
    const analysis =
      analyzeFamilyRedundancy({
        line,
        database,
        collection: [
          {
            fragranceId:
              "axis-edt",
            daysSinceLastWear: 0,
            wearCount: 10,
          },
        ],
      });

    expect(
      analysis.familyRedundancy,
    ).toBe(0);
    expect(
      analysis.items[0]
        .recommendation,
    ).toBe("keep");
  });
});
