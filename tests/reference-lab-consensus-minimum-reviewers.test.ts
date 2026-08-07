import {
  describe,
  expect,
  it,
} from "vitest";
import {
  buildReferenceConsensus,
} from "@/lib/reference-lab/consensus-engine";

describe("Reference Laboratory consensus minimum reviewers", () => {
  it("refuses to treat one approved submission as consensus", () => {
    expect(
      () =>
        buildReferenceConsensus({
          packages: [
            {
              packageId:
                "package:1",
              submission: {
                submissionId:
                  "submission:1",
                sessionId:
                  "session:1",
                fragranceId:
                  "house:scent",
                versionId:
                  "version:1",
                reviewerId:
                  "reviewer:a",
                claimIds: [],
                submittedAt:
                  "2026-08-07T00:00:00.000Z",
              },
              claims: [],
              evidence: [],
              reviews: [],
              state:
                "approved",
              createdAt:
                "2026-08-07T00:00:00.000Z",
              updatedAt:
                "2026-08-07T00:00:00.000Z",
            },
          ],
          fragranceId:
            "house:scent",
          versionId:
            "version:1",
          timestamp:
            "2026-08-07T02:00:00.000Z",
        }),
    ).toThrow(
      "at least 2",
    );
  });
});
