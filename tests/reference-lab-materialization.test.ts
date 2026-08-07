import {
  describe,
  expect,
  it,
} from "vitest";
import {
  referenceCalibrationTargetsPhase1,
} from "@/lib/reference-lab/reference-targets";
import {
  createReferenceWorkspaceDraft,
  materializeReferenceWorkspace,
  updateReferenceWorkspaceClaim,
} from "@/lib/reference-lab/workspace";

describe("Reference Laboratory claim materialization", () => {
  it("converts only explicitly scored workspace values into evidence-backed lab records", () => {
    const initial =
      createReferenceWorkspaceDraft({
        target:
          referenceCalibrationTargetsPhase1[0]!,
        reviewerId:
          "reviewer:test",
        timestamp:
          "2026-08-07T00:00:00.000Z",
      });

    const draft =
      updateReferenceWorkspaceClaim({
        draft:
          initial,
        domain:
          "performance",
        metric:
          "projection",
        patch: {
          value: 84,
          confidence: 91,
          rationale:
            "Calibrated against reference behavior.",
          evidence:
            "Repeated wear and comparison evidence.",
          sourceUrl:
            "https://example.com/evidence",
        },
        timestamp:
          "2026-08-07T00:01:00.000Z",
      });

    const result =
      materializeReferenceWorkspace({
        draft,
        timestamp:
          "2026-08-07T00:02:00.000Z",
      });

    expect(
      result.claims,
    ).toHaveLength(1);

    expect(
      result.evidence,
    ).toHaveLength(1);

    expect(
      result.claims[0]
        ?.value,
    ).toBe(84);

    expect(
      result.evidence[0]
        ?.detail,
    ).toContain(
      "Repeated wear",
    );
  });
});
