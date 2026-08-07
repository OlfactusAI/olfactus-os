import {
  describe,
  expect,
  it,
} from "vitest";

import { fragrances } from "@/lib/data/fragrances";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import {
  getRelatedExplorerFragrances,
  searchFragranceExplorer,
} from "@/lib/database/fragrance-explorer-engine";
import { buildFragranceSearchIndex } from "@/lib/database/search-index";

describe("Advanced Search & Fragrance Explorer", () => {
  const database =
    buildGlobalFragranceDatabase({
      catalog: fragrances,
    });
  const index =
    buildFragranceSearchIndex(
      database,
    );

  it("returns explorer results with match explanations", () => {
    const first =
      database.fragrances[0];

    const results =
      searchFragranceExplorer({
        database,
        index,
        query: first.name,
        filters: {},
        sort: "relevance",
        ownedIds: new Set(),
      });

    expect(
      results[0]?.fragrance.id,
    ).toBe(first.id);
    expect(
      results[0].whyMatched.length,
    ).toBeGreaterThan(0);
  });

  it("applies performance and DNA filters", () => {
    const results =
      searchFragranceExplorer({
        database,
        index,
        query: "",
        filters: {
          minimumLongevity: 80,
          minimumProjection: 70,
          minimumArtisticDna: 60,
        },
        sort: "longevity",
        ownedIds: new Set(),
      });

    expect(
      results.every(
        (result) =>
          result.fragrance
            .performance
            .longevity >= 80 &&
          result.fragrance
            .performance
            .projection >= 70 &&
          result.fragrance.dna
            .artistic >= 60,
      ),
    ).toBe(true);
  });

  it("sorts results and marks owned fragrances", () => {
    const ownedId =
      database.fragrances[0].id;

    const results =
      searchFragranceExplorer({
        database,
        index,
        query: "",
        filters: {},
        sort: "quality",
        ownedIds: new Set([
          ownedId,
        ]),
      });

    expect(
      results.find(
        (result) =>
          result.fragrance.id ===
          ownedId,
      )?.owned,
    ).toBe(true);

    for (
      let index = 1;
      index < results.length;
      index += 1
    ) {
      expect(
        results[index - 1]
          .fragrance
          .dataQualityScore,
      ).toBeGreaterThanOrEqual(
        results[index]
          .fragrance
          .dataQualityScore,
      );
    }
  });

  it("generates related fragrance candidates", () => {
    const related =
      getRelatedExplorerFragrances({
        candidate:
          database.fragrances[0],
        database,
      });

    expect(related.length).toBeGreaterThan(0);
    expect(
      related.some(
        (item) =>
          item.fragrance.id ===
          database.fragrances[0].id,
      ),
    ).toBe(false);
  });
});
