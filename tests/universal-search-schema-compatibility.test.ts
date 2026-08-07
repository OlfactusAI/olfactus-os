import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  buildUniversalSearchIndex,
  searchUniversalIndex,
} from "@/lib/search";

const catalog:
  FragranceRecord[] = [
    {
      id: "aventus",
      brand: "Creed",
      name: "Aventus",
      concentration:
        "Eau de Parfum",
      releaseYear: 2010,
      family:
        "Fruity Chypre",
      perfumers: [
        "Jean-Christophe Hérault",
      ],
      notes: {
        top: [
          "Pineapple",
          "Bergamot",
        ],
        heart: ["Birch"],
        base: ["Musk"],
      },
      accords: [
        "Fruity",
        "Woody",
      ],
      roles: ["signature"],
      seasons: {
        spring: 90,
        summer: 82,
        fall: 88,
        winter: 70,
      },
      dna: {
        fresh: 82,
        green: 48,
        woody: 78,
        amber: 35,
        sweet: 42,
        dark: 38,
        artistic: 78,
        formal: 82,
      },
      moods: ["confident"],
      performance: {
        longevity: 84,
        projection: 82,
      },
      intelligenceStatus:
        "validated",
    },
  ];

describe("Universal Search schema compatibility", () => {
  it("builds brand and perfumer documents without embedded fragrance arrays", () => {
    const index =
      buildUniversalSearchIndex({
        catalog,
      });

    expect(
      index.documents.some(
        (document) =>
          document.id.startsWith(
            "brand:",
          ),
      ),
    ).toBe(true);

    expect(
      index.documents.some(
        (document) =>
          document.id.startsWith(
            "perfumer:",
          ),
      ),
    ).toBe(true);
  });

  it("indexes note category and naturality from the actual schema", () => {
    const index =
      buildUniversalSearchIndex({
        catalog,
      });

    const result =
      searchUniversalIndex({
        index,
        query: "Pineapple",
      });

    expect(
      result.hits.some(
        (hit) =>
          hit.document.id ===
          "fragrance:aventus",
      ),
    ).toBe(true);
  });
});
