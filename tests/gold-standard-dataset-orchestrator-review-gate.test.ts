import {
  describe,
  expect,
  it,
} from "vitest";
import {
  generateDatasetConsensus,
} from "@/lib/gold-standard-builder/orchestrator";

describe("Gold Standard Dataset consensus orchestration", () => {
  it("blocks consensus until both review packages are fully approved", () => {
    expect(
      () =>
        generateDatasetConsensus({
          state: {
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
          },
          timestamp:
            "2026-08-07T00:00:00.000Z",
        }),
    ).toThrow(
      "fully approved",
    );
  });
});
