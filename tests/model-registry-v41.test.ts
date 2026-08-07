import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getIntelligenceModel,
} from "@/lib/models/registry";

describe("v4.1 model registry", () => {
  it("registers the Unified Decision Core and migrated Recommendation model", () => {
    expect(
      getIntelligenceModel(
        "UDC",
      )?.version,
    ).toBe(
      "1.0.0",
    );
    expect(
      getIntelligenceModel(
        "REC",
      )?.version,
    ).toBe(
      "4.1.0",
    );
  });
});
