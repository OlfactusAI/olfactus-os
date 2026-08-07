import {
  describe,
  expect,
  it,
} from "vitest";
import {
  officialSourceBatch001,
  previewOfficialSourceBatch001,
} from "@/lib/catalog-v2/data/official-source-batch-001";

describe("Official Source Batch 001 provenance", () => {
  it("uses only official HTTPS source URLs", () => {
    for (const source of officialSourceBatch001) {
      expect(
        source.sourceUrl.startsWith("https://"),
      ).toBe(true);

      expect(
        source.confidence,
      ).toBeGreaterThanOrEqual(98);
    }
  });

  it("preserves source URL provenance on every accepted record", () => {
    const preview =
      previewOfficialSourceBatch001();

    for (const record of preview.records) {
      expect(
        record.provenance.length,
      ).toBeGreaterThan(0);

      expect(
        record.provenance[0].sourceUrl,
      ).toMatch(/^https:\/\//);
    }
  });
});
