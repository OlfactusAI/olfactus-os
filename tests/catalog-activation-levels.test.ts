import {
  describe,
  expect,
  it,
} from "vitest";
import {
  assessCatalogActivationLevel,
} from "@/lib/catalog-v2/activation/levels";
import type {
  StagedCatalogRecord,
} from "@/lib/catalog-v2/staging/types";

function record(): StagedCatalogRecord {
  return {
    stagingId: "s1",
    stagedAt:
      "2026-08-07T00:00:00.000Z",
    status: "approved",
    issues: [],
    conflicts: [],
    record: {
      canonicalId:
        "brand:scent",
      brand: "Brand",
      name: "Scent",
      aliases: [],
      concentration:
        "Parfum",
      family: "Amber",
      perfumers: [],
      notes: ["Amber"],
      accords: ["Amber"],
      collections: [],
      validationStatus:
        "validated",
      provenance: [
        {
          sourceId: "source",
          sourceKind:
            "curated",
          sourceName: "Source",
          importedAt:
            "2026-08-07T00:00:00.000Z",
          confidence: 95,
        },
      ],
      fieldConfidence: {},
    },
  };
}

describe("Catalog activation levels", () => {
  it("keeps discovery data outside intelligence engines until enriched", () => {
    const result =
      assessCatalogActivationLevel({
        staged: record(),
      });

    expect(
      result.level,
    ).toBe("discovery");
    expect(
      result.intelligenceEligible,
    ).toBe(false);
  });
});
