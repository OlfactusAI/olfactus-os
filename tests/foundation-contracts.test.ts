import { describe, expect, it } from "vitest";
import {
  CANON_INVARIANTS,
  certificationReady,
  isProductionReadable,
  type FrozenResearchPack,
  type RuntimeReference,
} from "../lib/os/contracts";
import { assertNoScoresInResearchPack } from "../lib/os/contracts/evidence";

describe("OLFACTUS v5 foundation contracts", () => {
  it("locks the core certification-before-runtime invariant", () => {
    expect(CANON_INVARIANTS).toContain("certification-before-runtime");
  });

  it("requires every certification gate", () => {
    expect(certificationReady({
      researchPackFrozen: true,
      evidenceIntegrityValid: true,
      reviewerAApproved: true,
      reviewerBApproved: true,
      requiredFieldsComplete: true,
      comparisonComplete: true,
      openRequiredConflicts: 0,
      consensusApproved: true,
      schemaValid: true,
      identityVerified: true,
      registryCompatible: true,
      runtimeCompatible: true,
    })).toBe(true);

    expect(certificationReady({
      researchPackFrozen: true,
      evidenceIntegrityValid: true,
      reviewerAApproved: true,
      reviewerBApproved: true,
      requiredFieldsComplete: true,
      comparisonComplete: true,
      openRequiredConflicts: 1,
      consensusApproved: true,
      schemaValid: true,
      identityVerified: true,
      registryCompatible: true,
      runtimeCompatible: true,
    })).toBe(false);
  });

  it("keeps research packs score-free", () => {
    const pack: FrozenResearchPack = {
      researchPackId: "research-pack:creed:aventus:2026-08-07",
      fragranceId: "creed:aventus",
      researchPackVersion: 1,
      generatedAt: "2026-08-07",
      frozenAt: "2026-08-07",
      evidenceRefs: [],
      sourceRefs: [],
      sectionLinks: [],
      reviewerCautions: [],
      policy: { scoresIncluded: false, purpose: "Independent reviewer calibration" },
      integrityHash: "test-hash",
    };

    expect(() => assertNoScoresInResearchPack(pack)).not.toThrow();
  });

  it("only exposes active runtime references to production", () => {
    const runtime: RuntimeReference = {
      referenceId: "reference:001",
      fragranceId: "creed:aventus",
      referenceVersion: 1,
      runtimeVersion: 1,
      certificateId: "certificate:001",
      consensusId: "consensus:001",
      registryId: "registry:001",
      status: "inactive",
      calibration: {},
      fingerprints: {},
      traceability: {
        researchPackId: "research-pack:creed:aventus:2026-08-07",
        reviewerPackageAId: "reviewer-a:001",
        reviewerPackageBId: "reviewer-b:001",
        consensusId: "consensus:001",
        certificateId: "certificate:001",
        registryId: "registry:001",
      },
    };

    expect(isProductionReadable(runtime)).toBe(false);
    expect(isProductionReadable({ ...runtime, status: "active" })).toBe(true);
  });
});
