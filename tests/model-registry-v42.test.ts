import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getIntelligenceModel,
} from "@/lib/models/registry";

describe("v4.2 model registry", () => {
  it("registers PFL, PEM, and Semantic Search", () => {
    expect(
      getIntelligenceModel(
        "PFL",
      )?.version,
    ).toBe(
      "1.0.0",
    );
    expect(
      getIntelligenceModel(
        "PEM",
      )?.version,
    ).toBe(
      "1.0.0",
    );
    expect(
      getIntelligenceModel(
        "SEM",
      )?.version,
    ).toBe(
      "1.0.0",
    );
  });
});
