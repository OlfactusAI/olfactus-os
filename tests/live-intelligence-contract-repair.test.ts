import {
  describe,
  expect,
  it,
} from "vitest";

import {
  defaultDashboardPreferences,
  readDashboardPreferences,
} from "@/lib/intelligence-everywhere/dashboard-preferences";
import {
  buildCollectionSignal,
} from "@/lib/intelligence-everywhere/live-selectors";

describe("Live intelligence compatibility repair", () => {
  it("prioritizes the empty collection state", () => {
    expect(
      buildCollectionSignal({
        collectionSize: 0,
        healthScore: 0,
        roleCoverage: 0,
        seasonalBalance: 0,
        dnaDiversity: 0,
        redundancy: 0,
        rotationBalance: 0,
      }).label,
    ).toBe(
      "Collection empty",
    );
  });

  it("preserves the dashboard preference union", () => {
    const preferences =
      readDashboardPreferences();

    expect([
      "compact",
      "expanded",
    ]).toContain(
      preferences.density,
    );
    expect(
      defaultDashboardPreferences.density,
    ).toBe(
      "expanded",
    );
  });
});
