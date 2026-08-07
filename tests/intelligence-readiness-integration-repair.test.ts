import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  CollectionItem,
  CollectorProfile,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  analyzeCollectionHealth,
} from "@/lib/intelligence/collection-health";
import {
  analyzeDeal,
} from "@/lib/intelligence/deal-analyzer-engine";

const fragrance:
  FragranceRecord = {
    id: "repair-fixture",
    brand: "Example",
    name: "Repair Fixture",
    concentration:
      "Eau de Parfum",
    releaseYear: 2024,
    family: "Woody",
    perfumers: [
      "Example Nose",
    ],
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
    intelligenceStatus:
      "validated",
  };

const profile:
  CollectorProfile = {
    collectionStrategy:
      "balanced-luxury",
    targetSize: 20,
    climate:
      "four-seasons",
  };

const collection:
  CollectionItem[] = [];

describe("Intelligence readiness final cleanup", () => {
  it("runs Collection Health with the readiness filter available", () => {
    const result =
      analyzeCollectionHealth({
        collection,
        profile,
        catalog: [fragrance],
      });

    expect(result).toBeDefined();
  });

  it("does not access Deal Lab eligibleCatalog before initialization", () => {
    expect(() =>
      analyzeDeal({
        candidateId:
          fragrance.id,
        offers: [],
        collection,
        catalog: [fragrance],
      }),
    ).not.toThrow(
      /before initialization/,
    );
  });
});
