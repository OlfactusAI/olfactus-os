import {
  describe,
  expect,
  it,
} from "vitest";
import {
  buildProductionFingerprintBundle,
} from "@/lib/production-fingerprints/builder";

describe("Production fingerprint certified-source guard", () => {
  it("refuses an unlocked certificate", () => {
    expect(
      () =>
        buildProductionFingerprintBundle({
          record: {
            referenceId:
              "reference:1",
            fragranceId:
              "house:scent",
            currentVersionId:
              "version:1",
            currentCertificateId:
              "certificate:1",
            lifecycle:
              "registered",
            productionStatus:
              "not-reviewed",
            confidence: 95,
            evidenceCompleteness: 100,
            referenceQuality: 97,
            reviewerCount: 2,
            coverage: {
              similarity: 0,
              recommendation: 0,
              collectionTwin: 0,
              decisionLab: 0,
              weather: 0,
              blindBuy: 0,
              globalIntelligence: 0,
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
              locked:
                false as any,
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
          run: {
            runId:
              "run:1",
            fragranceId:
              "house:scent",
            versionId:
              "version:1",
            sourcePackageIds: [],
            sourceSubmissionIds: [],
            reviewerIds: [
              "reviewer:a",
              "reviewer:b",
            ],
            generatedAt:
              "2026-08-07T00:00:00.000Z",
            thresholds: {
              lowMaxRange: 8,
              moderateMaxRange: 18,
              minimumReviewerCount: 2,
            },
            snapshot: {
              consensusId:
                "consensus:1",
              sessionId:
                "session:1",
              fragranceId:
                "house:scent",
              versionId:
                "version:1",
              generatedAt:
                "2026-08-07T00:00:00.000Z",
              metrics: [],
              averageConfidence: 95,
              unresolvedConflictCount: 0,
            },
            conflicts: [],
          },
          timestamp:
            "2026-08-07T01:00:00.000Z",
        }),
    ).toThrow(
      "locked Gold Standard",
    );
  });
});
