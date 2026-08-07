import {
  describe,
  expect,
  it,
} from "vitest";

import {
  defaultDashboardPreferences,
} from "@/lib/intelligence-everywhere/dashboard-preferences";

describe("Dashboard preferences", () => {
  it("enables live modules by default", () => {
    expect(
      defaultDashboardPreferences.modules,
    ).toContain(
      "health",
    );
    expect(
      defaultDashboardPreferences.modules,
    ).toContain(
      "wear",
    );
    expect(
      defaultDashboardPreferences.density,
    ).toBe(
      "expanded",
    );
  });
});
