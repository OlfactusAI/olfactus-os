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
  createCatalogIntelligenceDraftStore,
} from "@/lib/catalog-v2/enrichment/intelligence-store";

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

describe("Catalog intelligence review queue", () => {
  it("keeps draft review separate from activation", () => {
    const draft =
      createCatalogIntelligenceDraft({
        record,
        roles:
          evidenceClaim({
            value: [],
            confidence: 0,
            method:
              "curated-review",
            evidence: "",
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

    const store =
      createCatalogIntelligenceDraftStore([
        draft,
      ]);

    expect(
      store.reviewQueue(),
    ).toHaveLength(1);

    expect(
      store.reviewQueue()[0]
        .decision.eligible,
    ).toBe(false);
  });
});
