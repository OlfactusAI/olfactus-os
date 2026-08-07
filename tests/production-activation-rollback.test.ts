import {
  describe,
  expect,
  it,
} from "vitest";
import {
  rollbackActivatedReference,
} from "@/lib/production-activation/rollback";

describe("Production Activation Bridge rollback", () => {
  it("requires an audit reason and returns the registry to rolled-back state", () => {
    const runtimeEntity = {
      runtimeReferenceId:
        "runtime:1",
      referenceId:
        "reference:1",
      fragranceId:
        "house:scent",
      versionId:
        "version:1",
      certificateId:
        "certificate:1",
      certificateHash:
        "hash:1",
      sourceConsensusId:
        "consensus:1",
      activatedAt:
        "2026-08-07T00:00:00.000Z",
      activatedBy:
        "production:admin",
      fingerprints: [],
    };

    const registryRecord = {
      referenceId:
        "reference:1",
      fragranceId:
        "house:scent",
      currentVersionId:
        "version:1",
      currentCertificateId:
        "certificate:1",
      lifecycle:
        "active" as const,
      productionStatus:
        "active" as const,
      confidence: 95,
      evidenceCompleteness: 100,
      referenceQuality: 97,
      reviewerCount: 2,
      coverage: {
        similarity: 100,
        recommendation: 100,
        collectionTwin: 100,
        decisionLab: 100,
        weather: 100,
        blindBuy: 100,
        globalIntelligence: 100,
      },
      versions: [],
      timeline: [],
      certificate:
        {} as any,
      createdAt:
        "2026-08-07T00:00:00.000Z",
      updatedAt:
        "2026-08-07T00:00:00.000Z",
    };

    const promotion = {
      promotionId:
        "promotion:1",
      referenceId:
        "reference:1",
      fragranceId:
        "house:scent",
      versionId:
        "version:1",
      certificateId:
        "certificate:1",
      status:
        "activated" as const,
      checks: [],
      blockers: [],
      createdAt:
        "2026-08-07T00:00:00.000Z",
      updatedAt:
        "2026-08-07T00:00:00.000Z",
      registrySnapshot:
        {} as any,
    };

    expect(
      () =>
        rollbackActivatedReference({
          runtimeEntity,
          registryRecord,
          promotion,
          actor:
            "production:admin",
          timestamp:
            "2026-08-07T01:00:00.000Z",
          reason: "",
        }),
    ).toThrow(
      "requires a reason",
    );

    const result =
      rollbackActivatedReference({
        runtimeEntity,
        registryRecord,
        promotion,
        actor:
          "production:admin",
        timestamp:
          "2026-08-07T01:00:00.000Z",
        reason:
          "Runtime validation regression.",
      });

    expect(
      result.registryRecord
        .productionStatus,
    ).toBe(
      "rolled-back",
    );

    expect(
      result.promotion.status,
    ).toBe(
      "rolled-back",
    );
  });
});
