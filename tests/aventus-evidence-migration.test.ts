import { describe, expect, it } from "vitest";
import type { ReviewerPackage } from "../lib/os/contracts/certification";
import {
  aventusEvidenceRepository,
  aventusFrozenResearchPackV1,
  assertReviewerPairUsesAventusPack,
  computeResearchPackIntegrityHash,
  resolveAventusFrozenResearchPack,
} from "../lib/os/evidence";

function reviewer(reviewerId: "A" | "B", researchPackId = aventusFrozenResearchPackV1.researchPackId): ReviewerPackage {
  return {
    reviewerId,
    fragranceId: "creed:aventus",
    researchPackId,
    packageVersion: 1,
    state: "draft",
    assessments: [],
    createdAt: "2026-08-07",
  };
}

describe("Aventus evidence repository migration", () => {
  it("migrates every alpha.5 source and fact without inventing calibration scores", () => {
    expect(aventusEvidenceRepository.sources).toHaveLength(4);
    expect(aventusEvidenceRepository.evidence).toHaveLength(16);
    expect(aventusFrozenResearchPackV1.policy.scoresIncluded).toBe(false);
    expect(JSON.stringify(aventusFrozenResearchPackV1)).not.toMatch(/calibrationScore|olfactusScore/i);
  });

  it("freezes exact evidence and source versions", () => {
    const resolved = resolveAventusFrozenResearchPack();
    expect(resolved.sources).toHaveLength(aventusFrozenResearchPackV1.sourceRefs.length);
    expect(resolved.evidence).toHaveLength(aventusFrozenResearchPackV1.evidenceRefs.length);
    expect(resolved.evidence.every((record) => record.status === "reviewed")).toBe(true);
  });

  it("has a reproducible SHA-256 research-pack fingerprint", () => {
    expect(computeResearchPackIntegrityHash(aventusFrozenResearchPackV1))
      .toBe(aventusFrozenResearchPackV1.integrityHash);
    expect(aventusFrozenResearchPackV1.integrityHash).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("preserves disagreement and caution evidence explicitly", () => {
    const cautionIds = new Set(
      aventusEvidenceRepository.evidence
        .filter((record) => record.category === "caution")
        .map((record) => record.evidenceId),
    );
    expect(cautionIds.size).toBeGreaterThan(0);
    expect(aventusFrozenResearchPackV1.sectionLinks.some(
      (link) => cautionIds.has(link.evidenceId) && link.relationship === "cautions",
    )).toBe(true);
  });

  it("binds Reviewer A and Reviewer B to one identical frozen pack", () => {
    expect(() => assertReviewerPairUsesAventusPack(reviewer("A"), reviewer("B"))).not.toThrow();
    expect(() => assertReviewerPairUsesAventusPack(
      reviewer("A"),
      reviewer("B", "research-pack:wrong"),
    )).toThrow(/same frozen Aventus research pack/);
  });
});
