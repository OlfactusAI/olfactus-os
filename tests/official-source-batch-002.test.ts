import {
  describe,
  expect,
  it,
} from "vitest";
import {
  countOfficialSourceBatch002Rows,
  getOfficialSourceBatch002Houses,
  previewOfficialSourceBatch002,
} from "@/lib/catalog-v2/data/official-source-batch-002";

describe("Official Source Batch 002", () => {
  it("adds 50 real-source records across 10 new houses", () => {
    expect(
      countOfficialSourceBatch002Rows(),
    ).toBe(50);

    expect(
      getOfficialSourceBatch002Houses().length,
    ).toBe(10);
  });

  it("passes Catalog V2 preview without rejected rows", () => {
    const preview =
      previewOfficialSourceBatch002();

    expect(
      preview.incoming,
    ).toBe(50);
    expect(
      preview.accepted,
    ).toBe(50);
    expect(
      preview.rejected,
    ).toBe(0);
  });
});
