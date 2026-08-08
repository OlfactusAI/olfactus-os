import repositoryData from "@/lib/os/evidence/repositories/aventus-v1.json";
import frozenPackData from "@/lib/os/evidence/frozen-packs/aventus-v1.json";
import type { ReviewerPackage } from "@/lib/os/contracts/certification";
import type { FrozenResearchPack } from "@/lib/os/contracts/evidence";
import { assertNoScoresInResearchPack } from "@/lib/os/contracts/evidence";
import { assertResearchPackIntegrity } from "@/lib/os/evidence/integrity";
import type { EvidenceRepository, ResolvedFrozenResearchPack } from "@/lib/os/evidence/types";

export const aventusEvidenceRepository = repositoryData as EvidenceRepository;
export const aventusFrozenResearchPackV1 = frozenPackData as FrozenResearchPack;

export function resolveAventusFrozenResearchPack(): ResolvedFrozenResearchPack {
  const pack = aventusFrozenResearchPackV1;
  const repository = aventusEvidenceRepository;
  const sourcesById = new Map(repository.sources.map((source) => [source.sourceId, source]));
  const evidenceById = new Map(repository.evidence.map((record) => [record.evidenceId, record]));

  const sources = pack.sourceRefs.map((ref) => {
    const source = sourcesById.get(ref.sourceId);
    if (!source || source.version !== ref.version) {
      throw new Error(`Missing frozen source ${ref.sourceId}@${ref.version}.`);
    }
    return source;
  });

  const evidence = pack.evidenceRefs.map((ref) => {
    const record = evidenceById.get(ref.evidenceId);
    if (!record || record.version !== ref.version) {
      throw new Error(`Missing frozen evidence ${ref.evidenceId}@${ref.version}.`);
    }
    return record;
  });

  assertNoScoresInResearchPack(pack);
  assertResearchPackIntegrity(pack);

  return { pack, sources, evidence };
}

export function assertReviewerPairUsesAventusPack(
  reviewerA: ReviewerPackage,
  reviewerB: ReviewerPackage,
): void {
  const pack = aventusFrozenResearchPackV1;
  if (reviewerA.reviewerId !== "A" || reviewerB.reviewerId !== "B") {
    throw new Error("Reviewer pair must be Reviewer A and Reviewer B.");
  }
  if (
    reviewerA.fragranceId !== pack.fragranceId ||
    reviewerB.fragranceId !== pack.fragranceId ||
    reviewerA.researchPackId !== pack.researchPackId ||
    reviewerB.researchPackId !== pack.researchPackId
  ) {
    throw new Error("Both reviewers must be bound to the same frozen Aventus research pack.");
  }
}
