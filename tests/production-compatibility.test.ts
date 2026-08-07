import {
  describe,
  expect,
  it,
} from "vitest";
import {
  scanReferenceProductionCompatibility,
} from "@/lib/production-pipeline/compatibility";
import {
  registerCertifiedReference,
  updateRegistryCoverage,
} from "@/lib/reference-registry/registry";

const certificate = {
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
  consensusConfidence: 96,
  unresolvedConflictCount: 0,
  locked: true as const,
  consensusId:
    "consensus:1",
  reviewerCount: 3,
  sourcePackageIds: [
    "package:a",
    "package:b",
  ],
  certificateHash:
    "gs1-abc12345",
  certificationVersion:
    "GS-1.0.0" as const,
};

describe("Production compatibility scanner", () => {
  it("blocks a newly registered certificate until production fingerprints exist", () => {
    const record =
      registerCertifiedReference({
        certificate,
        actor:
          "registry:system",
        timestamp:
          "2026-08-07T01:00:00.000Z",
      });

    const checks =
      scanReferenceProductionCompatibility(
        record,
      );

    expect(
      checks.some(
        (check) =>
          !check.passed,
      ),
    ).toBe(true);
  });

  it("passes when all required coverage reaches 100", () => {
    const initial =
      registerCertifiedReference({
        certificate,
        actor:
          "registry:system",
        timestamp:
          "2026-08-07T01:00:00.000Z",
      });

    const record =
      updateRegistryCoverage({
        record:
          initial,
        coverage: {
          similarity: 100,
          recommendation: 100,
          collectionTwin: 100,
          decisionLab: 100,
          weather: 100,
          blindBuy: 100,
          globalIntelligence: 100,
        },
        timestamp:
          "2026-08-07T02:00:00.000Z",
      });

    expect(
      scanReferenceProductionCompatibility(
        record,
      ).every(
        (check) =>
          check.passed,
      ),
    ).toBe(true);
  });
});
