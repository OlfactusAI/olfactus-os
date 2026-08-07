import {
  describe,
  expect,
  it,
} from "vitest";
import {
  activateProductionReference,
} from "@/lib/production-activation/bridge";

describe("Production Activation Bridge runtime entity", () => {
  it("publishes only normalized runtime-safe fingerprint values", () => {
    const result =
      activateProductionReference({
        activationPackage: {
          activationId:
            "activation:1",
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
          generatedAt:
            "2026-08-07T00:00:00.000Z",
          generatedBy:
            "production:admin",
          targetSystems: [
            "recommendation",
          ],
        },
        promotion: {
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
            "approved",
          checks: [],
          blockers: [],
          createdAt:
            "2026-08-07T00:00:00.000Z",
          updatedAt:
            "2026-08-07T00:00:00.000Z",
          registrySnapshot:
            {} as any,
        },
        registryRecord: {
          referenceId:
            "reference:1",
          fragranceId:
            "house:scent",
          currentVersionId:
            "version:1",
          currentCertificateId:
            "certificate:1",
          lifecycle:
            "production-ready",
          productionStatus:
            "approved",
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
          certificate: {
            certificateId:
              "certificate:1",
            sessionId:
              "session:1",
            fragranceId:
              "house:scent",
            versionId:
              "version:1",
            calibrationVersion:
              "1.0.0",
            issuedAt:
              "2026-08-07T00:00:00.000Z",
            issuedBy:
              "reviewer:admin",
            referenceQuality: 97,
            evidenceCompleteness: 100,
            consensusConfidence: 95,
            unresolvedConflictCount: 0,
            locked: true,
            consensusId:
              "consensus:1",
            reviewerCount: 2,
            sourcePackageIds: [],
            certificateHash:
              "gs1-test",
            certificationVersion:
              "GS-1.0.0",
          },
          createdAt:
            "2026-08-07T00:00:00.000Z",
          updatedAt:
            "2026-08-07T00:00:00.000Z",
        },
        fingerprintBundle: {
          bundleId:
            "bundle:1",
          referenceId:
            "reference:1",
          fragranceId:
            "house:scent",
          versionId:
            "version:1",
          certificateId:
            "certificate:1",
          sourceConsensusId:
            "consensus:1",
          fingerprints: [
            {
              fingerprintId:
                "fp:1",
              referenceId:
                "reference:1",
              fragranceId:
                "house:scent",
              versionId:
                "version:1",
              certificateId:
                "certificate:1",
              kind:
                "similarity",
              status:
                "complete",
              completeness: 100,
              metrics: [
                {
                  key:
                    "dna:fresh",
                  value: 91,
                  confidence: 95,
                  sourceConsensusMetric:
                    "dna:fresh",
                },
              ],
              blockers: [],
              generatedAt:
                "2026-08-07T00:00:00.000Z",
              sourceConsensusId:
                "consensus:1",
            },
          ],
          generatedAt:
            "2026-08-07T00:00:00.000Z",
          overallCompleteness: 100,
          productionReady: true,
        },
        actor:
          "production:admin",
        timestamp:
          "2026-08-07T01:00:00.000Z",
      });

    expect(
      result.runtimeEntity
        .fingerprints[0]
        ?.metrics[0],
    ).toEqual({
      key:
        "dna:fresh",
      value: 91,
      confidence: 95,
    });

    expect(
      result.registryRecord
        .productionStatus,
    ).toBe(
      "active",
    );

    expect(
      result.promotion.status,
    ).toBe(
      "activated",
    );
  });
});
