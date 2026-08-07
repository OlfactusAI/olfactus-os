import {
  describe,
  expect,
  it,
} from "vitest";
import {
  activateOfficialSourceBatch001,
} from "@/lib/catalog-v2/data/official-source-batch-001";

describe("Official Source Batch 001 activation boundary", () => {
  it("activates sourced records only into identity/discovery tiers", () => {
    const result =
      activateOfficialSourceBatch001();

    expect(
      result.activation.blocked,
    ).toHaveLength(0);

    expect(
      result.activation.activated,
    ).toHaveLength(39);

    expect(
      result.activation.intelligenceRecords,
    ).toHaveLength(0);

    expect(
      result.levels.intelligence ?? 0,
    ).toBe(0);

    expect(
      result.levels.full ?? 0,
    ).toBe(0);

    expect(
      (result.levels.identity ?? 0) +
      (result.levels.discovery ?? 0),
    ).toBe(39);
  });
});
