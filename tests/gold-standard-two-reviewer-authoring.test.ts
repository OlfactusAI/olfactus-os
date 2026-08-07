import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createGoldStandardDatasetState,
} from "@/lib/gold-standard-builder/builder";
import {
  getDatasetAuthoringReadiness,
  updateDatasetReviewerClaim,
} from "@/lib/gold-standard-builder/authoring";

describe("Gold Standard integrated two-reviewer authoring", () => {
  it("updates one reviewer without exposing or mutating the other reviewer draft", () => {
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

    const updated =
      updateDatasetReviewerClaim({
        state,
        reviewerId:
          "reviewer:dataset-a",
        domain:
          "dna",
        metric:
          "freshness",
        patch: {
          value: 90,
          confidence: 95,
          rationale:
            "Independent rationale.",
          evidence:
            "Independent evidence.",
        },
        timestamp:
          "2026-08-07T01:00:00.000Z",
      });

    expect(
      updated.reviewerDrafts[0]
        ?.claims[
          "dna:freshness"
        ]?.value,
    ).toBe(90);

    expect(
      updated.reviewerDrafts[1]
        ?.claims[
          "dna:freshness"
        ]?.value,
    ).toBeUndefined();
  });

  it("reports dataset readiness independently for each reviewer", () => {
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

    const readiness =
      getDatasetAuthoringReadiness(
        state,
      );

    expect(
      readiness.independent,
    ).toBe(true);

    expect(
      readiness.allComplete,
    ).toBe(false);

    expect(
      readiness.reviewers,
    ).toHaveLength(2);
  });
});
