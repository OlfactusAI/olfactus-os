import {
  describe,
  expect,
  it,
} from "vitest";
import {
  previewOfficialSourceBatch002,
} from "@/lib/catalog-v2/data/official-source-batch-002";
import {
  buildCatalogEnrichmentQueue,
  summarizeCatalogEnrichmentQueue,
} from "@/lib/catalog-v2/enrichment";

describe("Catalog enrichment queue", () => {
  it("turns missing metadata into explicit prioritized work", () => {
    const preview =
      previewOfficialSourceBatch002();

    const queue =
      buildCatalogEnrichmentQueue(
        preview.records,
      );

    const summary =
      summarizeCatalogEnrichmentQueue(
        queue,
      );

    expect(
      queue,
    ).toHaveLength(50);

    expect(
      summary.total,
    ).toBe(50);

    expect(
      queue.some(
        (task) =>
          task.missingFields.length >
          0,
      ),
    ).toBe(true);

    expect(
      queue.every(
        (task) =>
          task.completeness >=
            0 &&
          task.completeness <=
            100,
      ),
    ).toBe(true);
  });
});
