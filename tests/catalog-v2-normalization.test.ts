import {
  describe,
  expect,
  it,
} from "vitest";
import {
  buildCatalogCanonicalId,
  listValue,
} from "@/lib/catalog-v2/normalize";

describe("Catalog V2 normalization", () => {
  it("creates deterministic canonical IDs and list values", () => {
    expect(
      buildCatalogCanonicalId({
        brand:
          "Maison Francis Kurkdjian",
        name:
          "Baccarat Rouge 540",
      }),
    ).toBe(
      "maison-francis-kurkdjian:baccarat-rouge-540",
    );

    expect(
      listValue(
        "Bergamot|Cedar|Musk",
      ),
    ).toEqual([
      "Bergamot",
      "Cedar",
      "Musk",
    ]);
  });
});
