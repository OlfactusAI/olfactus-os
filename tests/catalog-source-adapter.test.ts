import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createJsonCatalogAdapter,
} from "@/lib/catalog-v2/adapters/json-adapter";

describe("Catalog source adapter", () => {
  it("normalizes a source into the shared batch contract", async () => {
    const adapter =
      createJsonCatalogAdapter({
        id:
          "test-json",
        name:
          "Test JSON",
        provenance: {
          sourceKind:
            "curated",
          confidence: 92,
        },
      });

    const batch =
      await adapter.load(
        JSON.stringify([
          {
            brand:
              "Example House",
            name:
              "Example Scent",
          },
        ]),
      );

    expect(
      batch.source.sourceId,
    ).toBe(
      "test-json",
    );
    expect(
      batch.rows.length,
    ).toBe(
      1,
    );
  });
});
