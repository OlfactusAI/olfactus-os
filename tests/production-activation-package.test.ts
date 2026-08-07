import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createProductionActivationPackage,
} from "@/lib/production-pipeline/pipeline";

describe("Production activation package", () => {
  it("generates a package without mutating runtime engines", () => {
    const activation =
      createProductionActivationPackage({
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
          approvedBy:
            "production:admin",
          approvedAt:
            "2026-08-07T00:30:00.000Z",
          createdAt:
            "2026-08-07T00:00:00.000Z",
          updatedAt:
            "2026-08-07T00:30:00.000Z",
          registrySnapshot:
            {} as any,
        },
        actor:
          "production:admin",
        timestamp:
          "2026-08-07T01:00:00.000Z",
      });

    expect(
      activation.targetSystems,
    ).toContain(
      "recommendation",
    );

    expect(
      activation.targetSystems,
    ).toContain(
      "collection-twin",
    );

    expect(
      activation.activationId,
    ).toContain(
      "ref-activation-package",
    );
  });
});
