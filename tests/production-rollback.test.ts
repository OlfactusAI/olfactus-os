import {
  describe,
  expect,
  it,
} from "vitest";
import {
  rollbackReferenceProduction,
} from "@/lib/production-pipeline/rollback";

describe("Production rollback", () => {
  it("requires a reason and returns the reference to registered state", () => {
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

    const record = {
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
      reviewerCount: 3,
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

    expect(
      () =>
        rollbackReferenceProduction({
          promotion,
          record,
          actor:
            "production:admin",
          timestamp:
            "2026-08-07T02:00:00.000Z",
          reason: "",
        }),
    ).toThrow(
      "requires a reason",
    );

    const result =
      rollbackReferenceProduction({
        promotion,
        record,
        actor:
          "production:admin",
        timestamp:
          "2026-08-07T02:00:00.000Z",
        reason:
          "Compatibility regression detected.",
      });

    expect(
      result.record.lifecycle,
    ).toBe(
      "registered",
    );

    expect(
      result.promotion.status,
    ).toBe(
      "rolled-back",
    );
  });
});
