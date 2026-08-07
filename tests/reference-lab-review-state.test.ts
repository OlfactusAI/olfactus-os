import {
  describe,
  expect,
  it,
} from "vitest";
import {
  derivePackageState,
} from "@/lib/reference-lab/review-workflow";

const claims = [
  {
    claimId:
      "claim:1",
  },
  {
    claimId:
      "claim:2",
  },
] as any[];

describe("Reference Laboratory review state", () => {
  it("requires all submitted claims to be approved before package approval", () => {
    expect(
      derivePackageState({
        claims,
        reviews: [
          {
            reviewId:
              "review:1",
            submissionId:
              "submission:1",
            claimId:
              "claim:1",
            reviewerId:
              "reviewer:b",
            decision:
              "approved",
            note: "",
          },
        ],
      }),
    ).toBe(
      "under-review",
    );

    expect(
      derivePackageState({
        claims,
        reviews: [
          {
            reviewId:
              "review:1",
            submissionId:
              "submission:1",
            claimId:
              "claim:1",
            reviewerId:
              "reviewer:b",
            decision:
              "approved",
            note: "",
          },
          {
            reviewId:
              "review:2",
            submissionId:
              "submission:1",
            claimId:
              "claim:2",
            reviewerId:
              "reviewer:b",
            decision:
              "approved",
            note: "",
          },
        ],
      }),
    ).toBe(
      "approved",
    );
  });
});
