import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createGoldStandardDatasetState,
} from "@/lib/gold-standard-builder/builder";
import {
  submitDatasetReviewersTogether,
} from "@/lib/gold-standard-builder/submission";

describe("Gold Standard two-reviewer submission gate", () => {
  it("blocks submission while either reviewer draft is incomplete", () => {
    const state =
      createGoldStandardDatasetState({
        target: {
          fragranceId:
            "creed:aventus",
          brand:
            "Creed",
          name:
            "Aventus",
        },
        reviewers: [
          {
            reviewerId:
              "reviewer:dataset-a",
            displayName:
              "A",
          },
          {
            reviewerId:
              "reviewer:dataset-b",
            displayName:
              "B",
          },
        ],
        timestamp:
          "2026-08-07T00:00:00.000Z",
      });

    expect(
      () =>
        submitDatasetReviewersTogether({
          state,
          timestamp:
            "2026-08-07T01:00:00.000Z",
        }),
    ).toThrow(
      "Both reviewer drafts must be complete",
    );
  });
});
