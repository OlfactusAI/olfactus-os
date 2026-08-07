import {
  describe,
  expect,
  it,
} from "vitest";
import {
  approveProductionPromotion,
} from "@/lib/production-pipeline/pipeline";

describe("Production promotion approval", () => {
  it("refuses to approve blocked promotion packages", () => {
    expect(
      () =>
        approveProductionPromotion({
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
              "blocked",
            checks: [],
            blockers: [
              "Missing similarity fingerprint.",
            ],
            createdAt:
              "2026-08-07T00:00:00.000Z",
            updatedAt:
              "2026-08-07T00:00:00.000Z",
            registrySnapshot:
              {} as any,
          },
          approver:
            "production:admin",
          timestamp:
            "2026-08-07T01:00:00.000Z",
        }),
    ).toThrow(
      "cannot be approved",
    );
  });
});
