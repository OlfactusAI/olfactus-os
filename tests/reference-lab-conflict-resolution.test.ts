import {
  describe,
  expect,
  it,
} from "vitest";
import {
  resolveReferenceConflict,
} from "@/lib/reference-lab/conflict-resolution";

describe("Reference Laboratory conflict resolution", () => {
  it("requires an auditable explanation", () => {
    const conflict = {
      conflictId:
        "conflict:1",
      sessionId:
        "session:1",
      fragranceId:
        "house:scent",
      versionId:
        "version:1",
      domain:
        "season" as const,
      metric:
        "summer",
      claimIds: [
        "claim:a",
        "claim:b",
      ],
      severity:
        "moderate" as const,
      status:
        "open" as const,
    };

    expect(
      () =>
        resolveReferenceConflict({
          conflict,
          status:
            "resolved",
          resolution:
            "",
          resolvedBy:
            "reviewer:admin",
          resolvedAt:
            "2026-08-07T03:00:00.000Z",
        }),
    ).toThrow(
      "requires an explanation",
    );

    const result =
      resolveReferenceConflict({
        conflict,
        status:
          "resolved",
        resolution:
          "Reviewer conditions differed; standardized warm-weather protocol accepted.",
        resolvedBy:
          "reviewer:admin",
        resolvedAt:
          "2026-08-07T03:00:00.000Z",
      });

    expect(
      result.conflict.status,
    ).toBe(
      "resolved",
    );

    expect(
      result.resolution.resolution,
    ).toContain(
      "standardized",
    );
  });
});
