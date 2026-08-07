import {
  describe,
  expect,
  it,
} from "vitest";
import {
  getDatasetReviewReadiness,
} from "@/lib/gold-standard-builder/review-console";

describe("Gold Standard Dataset Review Console", () => {
  it("reports review readiness from submitted packages", () => {
    const readiness =
      getDatasetReviewReadiness({
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
      });

    expect(
      readiness.submitted,
    ).toBe(false);

    expect(
      readiness.allApproved,
    ).toBe(false);
  });
});
