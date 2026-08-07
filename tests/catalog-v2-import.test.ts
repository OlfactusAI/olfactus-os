import {
  describe,
  expect,
  it,
} from "vitest";
import {
  previewCatalogImport,
} from "@/lib/catalog-v2/import-engine";

describe("Catalog V2 import", () => {
  it("previews valid and invalid fragrance records without committing them", () => {
    const preview =
      previewCatalogImport({
        rows: [
          {
            brand:
              "Example House",
            name:
              "Example Scent",
            releaseYear:
              2026,
          },
          {
            brand:
              "",
            name:
              "Invalid",
          },
        ],
        provenance: {
          sourceId:
            "test-source",
          sourceKind:
            "curated",
          sourceName:
            "Test",
          importedAt:
            "2026-08-07T00:00:00.000Z",
          confidence: 90,
        },
      });

    expect(
      preview.accepted.length,
    ).toBe(
      1,
    );
    expect(
      preview.rejected.length,
    ).toBe(
      1,
    );
  });
});
