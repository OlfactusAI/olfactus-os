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

describe("Global Search Interface contract", () => {
  const index =
    buildUniversalSearchIndex({
      catalog,
    });

  it("returns routes suitable for direct navigation", () => {
    const result =
      searchUniversalIndex({
        index,
        query: "Aventus",
      });

    expect(
      result.hits[0]
        .document.route,
    ).toBe(
      "/explorer?fragrance=aventus",
    );
  });

  it("supports entity filters used by the interface", () => {
    const result =
      searchUniversalIndex({
        index,
        query: "Creed",
        options: {
          entityTypes: [
            "brand",
          ],
        },
      });

    expect(
      result.hits.every(
        (hit) =>
          hit.document
            .entityType ===
          "brand",
      ),
    ).toBe(true);
  });

  it("returns grouped results with explanations", () => {
    const result =
      searchUniversalIndex({
        index,
        query: "Pineapple",
      });

    expect(
      result.groups.length,
    ).toBeGreaterThan(0);
    expect(
      result.hits.some(
        (hit) =>
          hit.explanation
            .length > 0,
      ),
    ).toBe(true);
  });
});
