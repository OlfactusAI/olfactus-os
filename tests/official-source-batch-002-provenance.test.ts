import {
  describe,
  expect,
  it,
} from "vitest";
import {
  officialSourceBatch002,
  previewOfficialSourceBatch002,
} from "@/lib/catalog-v2/data/official-source-batch-002";

describe("Official Source Batch 002 provenance", () => {
  it("retains official HTTPS provenance for every accepted record", () => {
    for (
      const source
      of officialSourceBatch002
    ) {
      expect(
        source.sourceUrl,
      ).toMatch(
        /^https:\/\//,
      );
      expect(
        source.confidence,
      ).toBeGreaterThanOrEqual(
        99,
      );
    }

    const preview =
      previewOfficialSourceBatch002();

    for (
      const record
      of preview.records
    ) {
      expect(
        record.provenance[0]
          .sourceUrl,
      ).toMatch(
        /^https:\/\//,
      );
    }
  });
});
