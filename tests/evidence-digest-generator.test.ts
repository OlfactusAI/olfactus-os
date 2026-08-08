import { describe, expect, it } from "vitest";
import {
  assertAventusEvidenceDigestV1,
  aventusEvidenceDigestV1,
  regenerateAventusEvidenceDigestV1,
} from "../lib/os/evidence/aventus-digest";
import { assertEvidenceDigestIsScoreFree } from "../lib/os/evidence/digest";

describe("Evidence Digest Generator", () => {
  it("reproduces Aventus Digest v1 exactly from Frozen Research Pack v1", () => {
    expect(regenerateAventusEvidenceDigestV1()).toEqual(aventusEvidenceDigestV1);
    expect(() => assertAventusEvidenceDigestV1()).not.toThrow();
  });

  it("preserves the research-pack integrity binding", () => {
    expect(aventusEvidenceDigestV1.researchPackId).toBe("research-pack:creed:aventus:v1");
    expect(aventusEvidenceDigestV1.researchPackIntegrityHash)
      .toBe("sha256:1157258490b2c3d4a5a6b9e13a372d7a3c03ac45dfc636318d5530772c002cee");
  });

  it("contains no scores, ratings, verdicts, recommendations, or reviewer conclusions", () => {
    expect(aventusEvidenceDigestV1.policy.scoresIncluded).toBe(false);
    expect(aventusEvidenceDigestV1.policy.reviewerConclusionsIncluded).toBe(false);
    expect(() => assertEvidenceDigestIsScoreFree(aventusEvidenceDigestV1)).not.toThrow();
    expect(() => assertEvidenceDigestIsScoreFree({ sectionId: "dna", score: 87 })).toThrow(/forbidden interpretive field/);
  });

  it("organizes every calibration section represented in the frozen pack", () => {
    expect(aventusEvidenceDigestV1.sections.map((section) => section.sectionId)).toEqual([
      "collector", "dna", "formality", "mood", "performance", "roles", "seasons", "time", "weather",
    ]);
    expect(aventusEvidenceDigestV1.totals.evidenceLinkCount).toBe(28);
    expect(aventusEvidenceDigestV1.totals.distinctEvidenceCount).toBeGreaterThan(0);
    expect(aventusEvidenceDigestV1.totals.distinctSourceCount).toBe(4);
  });

  it("surfaces caution evidence and structural gaps instead of silently resolving them", () => {
    expect(aventusEvidenceDigestV1.totals.cautionLinkCount).toBeGreaterThan(0);
    expect(aventusEvidenceDigestV1.sections.some((section) => section.cautionEvidence.length > 0)).toBe(true);
    expect(aventusEvidenceDigestV1.sections.some((section) => section.gaps.length > 0)).toBe(true);
  });
});
