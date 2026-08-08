import { describe, expect, it } from "vitest";
import type { DigestInput } from "../lib/os/evidence/digest-types";
import { aventusEvidenceDigestV1, regenerateAventusEvidenceDigestV1 } from "../lib/os/evidence/aventus-digest";

// Compile-time regression: DigestInput must accept the complete Canon EvidenceRelationship union,
// including contextualizes, without narrowing FrozenResearchPack.
const relationshipCompatibility: DigestInput["pack"]["sectionLinks"][number]["relationship"] = "contextualizes";

describe("v5.0.0-alpha.3.1 Evidence Digest stabilization", () => {
  it("keeps the complete evidence relationship vocabulary", () => {
    expect(relationshipCompatibility).toBe("contextualizes");
  });

  it("reproduces the frozen Aventus digest including its canonical hash", () => {
    const regenerated = regenerateAventusEvidenceDigestV1();
    expect(regenerated).toEqual(aventusEvidenceDigestV1);
    expect(regenerated.integrityHash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("does not reinterpret contextual evidence as support, caution, or contradiction", () => {
    for (const section of aventusEvidenceDigestV1.sections) {
      expect(section.contextualEvidence).toEqual([]);
    }
    expect(aventusEvidenceDigestV1.totals.contextualLinkCount).toBe(0);
  });
});
