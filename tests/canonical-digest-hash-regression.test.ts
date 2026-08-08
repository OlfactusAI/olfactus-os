import { describe, expect, it } from "vitest";
import { aventusEvidenceDigestV1, regenerateAventusEvidenceDigestV1 } from "@/lib/os/evidence/aventus-digest";
import { assertEvidenceDigestIntegrity } from "@/lib/os/evidence/digest";

describe("v5.0.0-alpha.3.2 canonical digest hash regression", () => {
  it("freezes the generator-produced Aventus digest hash", () => {
    const regenerated = regenerateAventusEvidenceDigestV1();
    expect(regenerated.integrityHash).toBe("sha256:6299c5ecebce5d784c902c630b117117b5129db298d4f2e11ce338a0ecae0b97");
    expect(regenerated).toEqual(aventusEvidenceDigestV1);
    expect(() => assertEvidenceDigestIntegrity(aventusEvidenceDigestV1)).not.toThrow();
  });
});
