import {
  describe,
  expect,
  it,
} from "vitest";
import {
  certifyAndPrepareDataset,
} from "@/lib/gold-standard-builder/orchestrator";

describe("Gold Standard Dataset certification conflict gate", () => {
  it("blocks certification while consensus conflicts remain open", () => {
    expect(
      () =>
        certifyAndPrepareDataset({
          state: {
            target: {
              fragranceId:
                "creed:aventus",
              brand:
                "Creed",
              name:
                "Aventus",
            },
            reviewerDrafts: [],
            reviewPackages: [],
            consensusRun: {
              runId:
                "run:1",
              fragranceId:
                "creed:aventus",
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
                  "creed:aventus",
                versionId:
                  "version:1",
                generatedAt:
                  "2026-08-07T00:00:00.000Z",
                metrics: [],
                averageConfidence: 95,
                unresolvedConflictCount: 1,
              },
              conflicts: [
                {
                  conflictId:
                    "conflict:1",
                  sessionId:
                    "session:1",
                  fragranceId:
                    "creed:aventus",
                  versionId:
                    "version:1",
                  domain:
                    "dna",
                  metric:
                    "freshness",
                  claimIds: [
                    "claim:a",
                    "claim:b",
                  ],
                  severity:
                    "moderate",
                  status:
                    "open",
                },
              ],
            },
          },
          certifier: {
            reviewerId:
              "reviewer:admin",
            displayName:
              "Admin",
            role:
              "administrator",
            active: true,
          },
          productionApprover:
            "production:admin",
          timestamp:
            "2026-08-07T01:00:00.000Z",
        }),
    ).toThrow(
      "unresolved calibration conflict",
    );
  });
});
