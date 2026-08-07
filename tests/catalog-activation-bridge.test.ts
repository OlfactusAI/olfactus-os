import {
  describe,
  expect,
  it,
} from "vitest";
import {
  activateCatalogV2Record,
} from "@/lib/catalog-v2/activation/bridge";
import type {
  StagedCatalogRecord,
} from "@/lib/catalog-v2/staging/types";

function staged(): StagedCatalogRecord {
  return {
    stagingId:
      "stage:house:scent",
    stagedAt:
      "2026-08-07T00:00:00.000Z",
    status:
      "approved",
    issues: [],
    conflicts: [],
    record: {
      canonicalId:
        "house:scent",
      brand:
        "House",
      name:
        "Scent",
      aliases: [],
      releaseYear: 2026,
      concentration:
        "Eau de Parfum",
      family:
        "Woody",
      perfumers: [
        "Perfumer",
      ],
      notes: [
        "Cedar",
      ],
      accords: [
        "Woody",
      ],
      collections: [],
      validationStatus:
        "validated",
      provenance: [
        {
          sourceId: "one",
          sourceKind:
            "curated",
          sourceName:
            "One",
          importedAt:
            "2026-08-07T00:00:00.000Z",
          confidence: 95,
        },
      ],
      fieldConfidence: {},
    },
  };
}

describe("Catalog Activation Bridge", () => {
  it("does not fabricate an intelligence record without an intelligence profile", () => {
    const result =
      activateCatalogV2Record({
        staged:
          staged(),
      });

    expect(
      result.level,
    ).toBe(
      "discovery",
    );
    expect(
      result.fragrance,
    ).toBeUndefined();
  });

  it("creates a first-class FragranceRecord only when intelligence data exists", () => {
    const result =
      activateCatalogV2Record({
        staged:
          staged(),
        intelligenceProfile: {
          roles: [
            "casual",
          ],
          seasons: {
            spring: 70,
            summer: 50,
            fall: 80,
            winter: 75,
          },
          dna: {
            fresh: 45,
            green: 50,
            woody: 85,
            amber: 60,
            sweet: 40,
            dark: 55,
            artistic: 70,
            formal: 65,
          },
          moods: [
            "refined",
          ],
          performance: {
            projection: 70,
            longevity: 80,
          },
        },
      });

    expect(
      result.level,
    ).toBe(
      "intelligence",
    );
    expect(
      result.fragrance?.id,
    ).toBe(
      "catalog-v2:house:scent",
    );
    expect(
      result.fragrance?.dna.woody,
    ).toBe(85);
  });
});
