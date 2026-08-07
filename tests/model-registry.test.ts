import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getIntelligenceModel,
  listActiveIntelligenceModels,
} from "@/lib/models/registry";

describe("Intelligence model registry", () => {
  it("versions the new v4 foundation models", () => {
    expect(
      getIntelligenceModel(
        "COLLECTOR-STATE",
      )?.version,
    ).toBe(
      "1.0.0",
    );
    expect(
      getIntelligenceModel(
        "PIG",
      )?.version,
    ).toBe(
      "1.0.0",
    );
    expect(
      listActiveIntelligenceModels()
        .length,
    ).toBeGreaterThan(
      5,
    );
  });
});
