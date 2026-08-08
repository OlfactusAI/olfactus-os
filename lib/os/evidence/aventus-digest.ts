import digestData from "@/lib/os/evidence/digests/aventus-v1.json";
import type { EvidenceDigest } from "@/lib/os/evidence/digest-types";
import { assertEvidenceDigestIntegrity, generateEvidenceDigest } from "@/lib/os/evidence/digest";
import { resolveAventusFrozenResearchPack } from "@/lib/os/evidence/aventus";

export const aventusEvidenceDigestV1 = digestData as EvidenceDigest;

export function regenerateAventusEvidenceDigestV1(): EvidenceDigest {
  const resolved = resolveAventusFrozenResearchPack();
  return generateEvidenceDigest(
    { pack: resolved.pack, evidence: resolved.evidence, sources: resolved.sources },
    aventusEvidenceDigestV1.generatedAt,
  );
}

export function assertAventusEvidenceDigestV1(): void {
  assertEvidenceDigestIntegrity(aventusEvidenceDigestV1);
  const regenerated = regenerateAventusEvidenceDigestV1();
  if (JSON.stringify(regenerated) !== JSON.stringify(aventusEvidenceDigestV1)) {
    throw new Error("Aventus Evidence Digest v1 is not reproducible from the frozen Research Pack v1.");
  }
}
