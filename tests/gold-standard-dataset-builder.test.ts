import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createGoldStandardDatasetState,
} from "@/lib/gold-standard-builder/builder";

describe("Gold Standard Dataset Builder", () => {
  it("creates independent reviewer drafts without calibration scores", () => {
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
              "reviewer:a",
            displayName:
              "A",
          },
          {
            reviewerId:
              "reviewer:b",
            displayName:
              "B",
          },
        ],
        timestamp:
          "2026-08-07T00:00:00.000Z",
      });

    expect(
      state.reviewerDrafts,
    ).toHaveLength(2);

    expect(
      Object.values(
        state.reviewerDrafts[0]
          ?.claims ??
          {},
      ).every(
        (claim) =>
          claim.value ===
          undefined,
      ),
    ).toBe(true);
  });

  it("requires at least two reviewers", () => {
    expect(
      () =>
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
                "reviewer:a",
              displayName:
                "A",
            },
          ],
          timestamp:
            "2026-08-07T00:00:00.000Z",
        }),
    ).toThrow(
      "at least two",
    );
  });
});
