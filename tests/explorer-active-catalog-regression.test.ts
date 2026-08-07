import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  buildGlobalFragranceDatabase,
} from "@/lib/database/database-foundation";

describe("Explorer active catalog regression", () => {
  it("reads fragrance records from database.fragrances", () => {
    const catalog:
      FragranceRecord[] = [
        {
          id: "atlas",
          brand: "Example",
          name: "Atlas",
          concentration:
            "Eau de Parfum",
          family: "Woody",
          roles: ["office"],
          seasons: {
            spring: 70,
            summer: 60,
            fall: 80,
            winter: 75,
          },
          dna: {
            fresh: 50,
            green: 40,
            woody: 80,
            amber: 50,
            sweet: 30,
            dark: 40,
            artistic: 60,
            formal: 70,
          },
          moods: [],
          performance: {
            longevity: 75,
            projection: 70,
          },
          intelligenceStatus:
            "validated",
        },
      ];

    const database =
      buildGlobalFragranceDatabase({
        catalog,
      });

    const brands = [
      ...new Set(
        database.fragrances.map(
          (item) => item.brand,
        ),
      ),
    ];

    expect(brands).toEqual([
      "Example",
    ]);
  });
});
