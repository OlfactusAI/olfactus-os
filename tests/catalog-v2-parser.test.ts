import {
  describe,
  expect,
  it,
} from "vitest";
import {
  parseCatalogCsv,
  parseCatalogJson,
} from "@/lib/catalog-v2/parser";

describe("Catalog V2 parsers", () => {
  it("parses CSV and JSON imports", () => {
    const csv =
      parseCatalogCsv(
        "brand,name,releaseYear\nCreed,Aventus,2010",
      );

    expect(
      csv[0].brand,
    ).toBe(
      "Creed",
    );

    const json =
      parseCatalogJson(
        JSON.stringify([
          {
            brand:
              "Creed",
            name:
              "Aventus",
          },
        ]),
      );

    expect(
      json[0].name,
    ).toBe(
      "Aventus",
    );
  });
});
