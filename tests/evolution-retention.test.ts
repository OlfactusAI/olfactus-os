import {
  describe,
  expect,
  it,
} from "vitest";

import type { EvolutionSnapshot } from "@/lib/evolution/types";

describe("Evolution retention contract", () => {
  it("supports all stable capture reasons", () => {
    const reasons: EvolutionSnapshot["captureReason"][] =
      [
        "tracking-started",
        "collection-changed",
        "wear-milestone",
        "manual-capture",
        "purchase-impact",
        "annual-review",
        "imported-history",
      ];

    expect(reasons).toHaveLength(7);
    expect(
      new Set(reasons).size,
    ).toBe(7);
  });
});
