import {
  describe,
  expect,
  it,
} from "vitest";
import {
  referenceCalibrationTargetsPhase1,
} from "@/lib/reference-lab/reference-targets";
import {
  calculateReferenceWorkspaceCompleteness,
  createReferenceWorkspaceDraft,
  updateReferenceWorkspaceClaim,
} from "@/lib/reference-lab/workspace";

describe("Reference Laboratory calibration workspace", () => {
  it("creates an empty auditable draft instead of pre-populated intelligence", () => {
    const draft =
      createReferenceWorkspaceDraft({
        target:
          referenceCalibrationTargetsPhase1[0]!,
        reviewerId:
          "reviewer:test",
        timestamp:
          "2026-08-07T00:00:00.000Z",
      });

    const completeness =
      calculateReferenceWorkspaceCompleteness(
        draft,
      );

    expect(
      completeness.scored,
    ).toBe(0);

    expect(
      completeness.evidenced,
    ).toBe(0);

    expect(
      completeness.readyForReview,
    ).toBe(false);
  });

  it("updates one claim without mutating unrelated calibration fields", () => {
    const draft =
      createReferenceWorkspaceDraft({
        target:
          referenceCalibrationTargetsPhase1[0]!,
        reviewerId:
          "reviewer:test",
        timestamp:
          "2026-08-07T00:00:00.000Z",
      });

    const updated =
      updateReferenceWorkspaceClaim({
        draft,
        domain:
          "dna",
        metric:
          "freshness",
        patch: {
          value: 91,
          confidence: 94,
          rationale:
            "Reference calibration rationale.",
          evidence:
            "Observed and compared with calibrated fresh references.",
        },
        timestamp:
          "2026-08-07T00:01:00.000Z",
      });

    expect(
      updated.claims[
        "dna:freshness"
      ]?.value,
    ).toBe(91);

    expect(
      draft.claims[
        "dna:freshness"
      ]?.value,
    ).toBeUndefined();
  });
});
