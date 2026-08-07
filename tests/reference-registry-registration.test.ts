import {
  describe,
  expect,
  it,
} from "vitest";
import {
  registerCertifiedReference,
} from "@/lib/reference-registry/registry";

describe("Reference Registry registration", () => {
  it("registers a Gold Standard certificate without activating production", () => {
    const record =
      registerCertifiedReference({
        certificate: {
          certificateId:
            "certificate:1",
          sessionId:
            "session:1",
          fragranceId:
            "creed:aventus",
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
          locked: true,
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
            "GS-1.0.0",
        },
        actor:
          "registry:system",
        timestamp:
          "2026-08-07T01:00:00.000Z",
      });

    expect(
      record.lifecycle,
    ).toBe(
      "registered",
    );

    expect(
      record.productionStatus,
    ).toBe(
      "not-reviewed",
    );

    expect(
      record.coverage.similarity,
    ).toBe(0);
  });
});
