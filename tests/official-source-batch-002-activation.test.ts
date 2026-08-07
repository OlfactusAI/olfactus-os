import {
  describe,
  expect,
  it,
} from "vitest";
import {
  activateOfficialSourceBatch002,
} from "@/lib/catalog-v2/data/official-source-batch-002";

describe("Official Source Batch 002 activation boundary", () => {
  it("keeps sourced records out of NRE until explicit intelligence enrichment exists", () => {
    const result =
      activateOfficialSourceBatch002();

    expect(
      result.activation.activated,
    ).toHaveLength(50);

    expect(
      result.activation.intelligenceRecords,
    ).toHaveLength(0);

    expect(
      result.levels.intelligence ?? 0,
    ).toBe(0);

    expect(
      result.levels.full ?? 0,
    ).toBe(0);
  });
});
