import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  buildGlobalFragranceDatabase,
} from "@/lib/database/database-foundation";
import {
  migrateFoundationDatabaseToV2,
} from "@/lib/database/core/migration";

describe("Global database migration", () => {
  it("migrates the existing foundation database into the v2 snapshot", () => {
    const foundation =
      buildGlobalFragranceDatabase({
        catalog: fragrances,
      });

    const migrated =
      migrateFoundationDatabaseToV2({
        foundation,
        catalog: fragrances,
      });

    expect(
      migrated.schemaVersion,
    ).toBe("GFD-2.0.0");
    expect(
      migrated.fragrances,
    ).toHaveLength(
      foundation.fragrances.length,
    );
    expect(
      migrated.brands,
    ).toHaveLength(
      foundation.brands.length,
    );
  });
});
