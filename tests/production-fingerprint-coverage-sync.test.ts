import {
  describe,
  expect,
  it,
} from "vitest";
import {
  synchronizeRegistryCoverageFromFingerprints,
} from "@/lib/production-fingerprints/coverage";

describe("Production fingerprint coverage synchronization", () => {
  it("maps fingerprint completeness into registry engine coverage", () => {
    const updated =
      synchronizeRegistryCoverageFromFingerprints({
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
          certificate:
            {} as any,
          createdAt:
            "2026-08-07T00:00:00.000Z",
          updatedAt:
            "2026-08-07T00:00:00.000Z",
        },
        bundle: {
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
          generatedAt:
            "2026-08-07T01:00:00.000Z",
          overallCompleteness: 100,
          productionReady: true,
          fingerprints: [
            ["similarity", 100],
            ["recommendation", 100],
            ["collection-twin", 100],
            ["decision-lab", 100],
            ["season-weather", 100],
            ["blind-buy", 100],
            ["global-intelligence", 100],
          ].map(
            (
              [
                kind,
                completeness,
              ],
              index,
            ) => ({
              fingerprintId:
                `fingerprint:${index}`,
              referenceId:
                "reference:1",
              fragranceId:
                "house:scent",
              versionId:
                "version:1",
              certificateId:
                "certificate:1",
              kind:
                kind as any,
              status:
                "complete" as const,
              completeness:
                completeness as number,
              metrics: [],
              blockers: [],
              generatedAt:
                "2026-08-07T01:00:00.000Z",
              sourceConsensusId:
                "consensus:1",
            }),
          ),
        },
        timestamp:
          "2026-08-07T01:00:00.000Z",
      });

    expect(
      updated.coverage.similarity,
    ).toBe(100);
    expect(
      updated.coverage.collectionTwin,
    ).toBe(100);
    expect(
      updated.coverage.globalIntelligence,
    ).toBe(100);
  });
});
