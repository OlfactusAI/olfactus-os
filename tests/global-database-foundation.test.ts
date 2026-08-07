import {
  describe,
  expect,
  it,
} from "vitest";

import { fragrances } from "@/lib/data/fragrances";
import {
  buildGlobalFragranceDatabase,
  calculateDataQuality,
} from "@/lib/database/database-foundation";
import { findDuplicateFragrances } from "@/lib/database/duplicate-detection";
import {
  buildFragranceSearchIndex,
  searchGlobalFragranceDatabase,
} from "@/lib/database/search-index";
import { validateGlobalFragranceDatabase } from "@/lib/database/validation";

describe("Global Fragrance Database Foundation", () => {
  const database =
    buildGlobalFragranceDatabase({
      catalog: fragrances,
    });
  const index =
    buildFragranceSearchIndex(
      database,
    );

  it("normalizes the current catalog into reusable entities", () => {
    expect(
      database.schemaVersion,
    ).toBe("GFD-1.0.0");
    expect(
      database.fragrances,
    ).toHaveLength(
      fragrances.length,
    );
    expect(
      database.brands.length,
    ).toBeGreaterThan(2);
    expect(
      database.concentrations.length,
    ).toBeGreaterThan(3);
  });

  it("builds searchable documents and returns relevant results", () => {
    const first =
      database.fragrances[0];
    const results =
      searchGlobalFragranceDatabase({
        database,
        index,
        query: first.name,
      });

    expect(
      results[0]?.fragrance.id,
    ).toBe(first.id);
    expect(index).toHaveLength(
      database.fragrances.length,
    );
  });

  it("validates database integrity", () => {
    const result =
      validateGlobalFragranceDatabase(
        database,
      );

    expect(result.valid).toBe(true);
    expect(
      result.counts.errors,
    ).toBe(0);
  });

  it("calculates quality and duplicate candidates deterministically", () => {
    expect(
      calculateDataQuality(
        fragrances[0],
      ),
    ).toBeGreaterThanOrEqual(40);

    const duplicates =
      findDuplicateFragrances(
        database.fragrances,
      );

    expect(
      Array.isArray(duplicates),
    ).toBe(true);
  });
});
