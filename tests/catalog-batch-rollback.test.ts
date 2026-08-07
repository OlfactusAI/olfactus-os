import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createJsonCatalogAdapter,
} from "@/lib/catalog-v2/adapters/json-adapter";
import {
  runCatalogBatch,
} from "@/lib/catalog-v2/batch-engine";

describe("Catalog batch rollback", () => {
  it("can remove every staged record from a failed or cancelled batch", async () => {
    const adapter =
      createJsonCatalogAdapter({
        id:
          "batch-test",
        name:
          "Batch Test",
        provenance: {
          sourceKind:
            "curated",
          confidence: 90,
        },
      });

    const batch =
      await runCatalogBatch({
        adapter,
        input:
          JSON.stringify([
            {
              brand:
                "House",
              name:
                "One",
            },
            {
              brand:
                "House",
              name:
                "Two",
            },
          ]),
      });

    expect(
      batch.staging
        .list()
        .length,
    ).toBe(
      2,
    );

    batch.rollback();

    expect(
      batch.staging
        .list()
        .length,
    ).toBe(
      0,
    );
  });
});
