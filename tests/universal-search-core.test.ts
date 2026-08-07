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
  levenshteinDistance,
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
        heart: [
          "Birch",
          "Jasmine",
        ],
        base: [
          "Musk",
          "Oakmoss",
        ],
      },
      accords: [
        "Fruity",
        "Woody",
      ],
      roles: [
        "signature",
      ],
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
      moods: [
        "confident",
      ],
      performance: {
        longevity: 84,
        projection: 82,
      },
      intelligenceStatus:
        "validated",
    },
    {
      id: "green-irish-tweed",
      brand: "Creed",
      name:
        "Green Irish Tweed",
      concentration:
        "Eau de Parfum",
      releaseYear: 1985,
      family:
        "Green Aromatic",
      perfumers: [
        "Pierre Bourdon",
      ],
      notes: {
        top: ["Lemon"],
        heart:
          ["Violet Leaf"],
        base: [
          "Sandalwood",
        ],
      },
      accords: [
        "Green",
        "Fresh",
      ],
      roles: [
        "office",
      ],
      seasons: {
        spring: 95,
        summer: 88,
        fall: 78,
        winter: 45,
      },
      dna: {
        fresh: 88,
        green: 92,
        woody: 65,
        amber: 12,
        sweet: 10,
        dark: 18,
        artistic: 82,
        formal: 78,
      },
      moods: [
        "refined",
      ],
      performance: {
        longevity: 80,
        projection: 74,
      },
      intelligenceStatus:
        "validated",
    },
  ];

describe("Universal Search Core", () => {
  const index =
    buildUniversalSearchIndex({
      catalog,
    });

  it("finds exact fragrance matches", () => {
    const result =
      searchUniversalIndex({
        index,
        query: "Aventus",
      });

    expect(
      result.hits[0]
        .document.id,
    ).toBe(
      "fragrance:aventus",
    );
    expect(
      result.hits[0]
        .matchType,
    ).toBe("exact");
  });

  it("finds prefix matches and groups entities", () => {
    const result =
      searchUniversalIndex({
        index,
        query: "Cre",
      });

    expect(
      result.groups.some(
        (group) =>
          group.entityType ===
          "brand",
      ),
    ).toBe(true);
  });

  it("searches note and metadata keywords", () => {
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

  it("supports typo-tolerant matching", () => {
    const result =
      searchUniversalIndex({
        index,
        query: "Aventis",
        options: {
          typoTolerance: 2,
        },
      });

    expect(
      result.hits.some(
        (hit) =>
          hit.document.id ===
          "fragrance:aventus",
      ),
    ).toBe(true);

    expect(
      levenshteinDistance(
        "aventus",
        "aventis",
      ),
    ).toBe(1);
  });

  it("includes imported catalog records", () => {
    const imported:
      FragranceRecord[] = [
        {
          ...catalog[0],
          id: "solaris-one",
          brand:
            "Independent House",
          name:
            "Solaris One",
          intelligenceStatus:
            "calibration",
        },
      ];

    const importedIndex =
      buildUniversalSearchIndex({
        catalog,
        importedCatalog:
          imported,
      });

    const result =
      searchUniversalIndex({
        index:
          importedIndex,
        query: "Solaris",
      });

    expect(
      result.hits[0]
        .document.source,
    ).toBe("imported");
  });
});
