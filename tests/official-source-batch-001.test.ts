import {
  describe,
  expect,
  it,
} from "vitest";
import {
  countOfficialSourceBatch001Rows,
  getOfficialSourceBatch001Houses,
  previewOfficialSourceBatch001,
} from "@/lib/catalog-v2/data/official-source-batch-001";

describe("Official Source Batch 001", () => {
  it("contains the expected sourced pilot breadth", () => {
    expect(
      countOfficialSourceBatch001Rows(),
    ).toBe(39);

    expect(
      getOfficialSourceBatch001Houses().length,
    ).toBe(10);
  });

  it("passes Catalog V2 preview without rejected rows", () => {
    const result =
      previewOfficialSourceBatch001();

    expect(result.incoming).toBe(39);
    expect(result.accepted).toBe(39);
    expect(result.rejected).toBe(0);
  });
});
