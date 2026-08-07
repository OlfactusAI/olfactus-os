import {
  describe,
  expect,
  it,
} from "vitest";
import {
  evidenceClaim,
} from "@/lib/catalog-v2/enrichment/intelligence-draft";

describe("Catalog intelligence evidence", () => {
  it("retains method, confidence, evidence, and provenance", () => {
    const claim =
      evidenceClaim({
        value: 82,
        confidence: 91,
        method:
          "calibrated-model",
        evidence:
          "Calibrated against validated reference records.",
        provenance: [
          {
            sourceId:
              "reference-set",
            sourceKind:
              "curated",
            sourceName:
              "Reference Set",
            importedAt:
              "2026-08-07T00:00:00.000Z",
            confidence: 95,
          },
        ],
      });

    expect(
      claim.value,
    ).toBe(82);
    expect(
      claim.confidence,
    ).toBe(91);
    expect(
      claim.method,
    ).toBe(
      "calibrated-model",
    );
    expect(
      claim.evidence,
    ).toContain(
      "Calibrated",
    );
    expect(
      claim.provenance,
    ).toHaveLength(1);
  });
});
