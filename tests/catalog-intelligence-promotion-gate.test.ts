import {
  describe,
  expect,
  it,
} from "vitest";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import {
  createCatalogIntelligenceDraft,
  evidenceClaim,
} from "@/lib/catalog-v2/enrichment/intelligence-draft";
import {
  evaluateIntelligencePromotion,
} from "@/lib/catalog-v2/enrichment/promotion-gate";

const record:
  CatalogV2Record = {
    canonicalId:
      "house:scent",
    brand:
      "House",
    name:
      "Scent",
    aliases: [],
    perfumers: [],
    notes: [],
    accords: [],
    collections: [],
    validationStatus:
      "validated",
    provenance: [],
    fieldConfidence: {},
  };

describe("Catalog intelligence promotion gate", () => {
  it("blocks incomplete intelligence drafts instead of inventing defaults", () => {
    const draft =
      createCatalogIntelligenceDraft({
        record,
        roles:
          evidenceClaim({
            value: [
              "Daily",
            ],
            confidence: 90,
            method:
              "curated-review",
            evidence:
              "Reviewed collector-use evidence.",
          }),
        seasons:
          evidenceClaim({
            value: [],
            confidence: 0,
            method:
              "curated-review",
            evidence: "",
          }),
        dna: {},
        moods:
          evidenceClaim({
            value: [],
            confidence: 0,
            method:
              "curated-review",
            evidence: "",
          }),
        performance: {
          longevity:
            evidenceClaim({
              value: 0,
              confidence: 0,
              method:
                "curated-review",
              evidence: "",
            }),
          projection:
            evidenceClaim({
              value: 0,
              confidence: 0,
              method:
                "curated-review",
              evidence: "",
            }),
          sillage:
            evidenceClaim({
              value: 0,
              confidence: 0,
              method:
                "curated-review",
              evidence: "",
            }),
        },
      });

    const decision =
      evaluateIntelligencePromotion(
        draft,
      );

    expect(
      decision.eligible,
    ).toBe(false);

    expect(
      decision.reasons
        .length,
    ).toBeGreaterThan(
      0,
    );

    expect(
      decision.coverage
        .dna,
    ).toBe(0);
  });
});
