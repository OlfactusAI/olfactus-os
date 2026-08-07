import type {
  GlobalFragranceDatabase,
} from "@/lib/database/schema";
import type {
  GlobalDatabaseSnapshot,
} from "@/lib/database/core/types";
import {
  buildGlobalDatabaseSnapshot,
} from "@/lib/database/core/builder";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

export function migrateFoundationDatabaseToV2({
  foundation,
  catalog,
  datasetId =
    "olfactus-migrated-foundation",
  datasetVersion =
    "2.0.0-alpha.1",
}: {
  foundation:
    GlobalFragranceDatabase;
  catalog:
    FragranceRecord[];
  datasetId?: string;
  datasetVersion?: string;
}): GlobalDatabaseSnapshot {
  const snapshot =
    buildGlobalDatabaseSnapshot({
      catalog,
      datasetId,
      datasetVersion,
    });

  return {
    ...snapshot,
    generatedAt:
      foundation.generatedAt,
    brands:
      foundation.brands,
    perfumers:
      foundation.perfumers,
    notes:
      foundation.notes,
    accords:
      foundation.accords,
    countries:
      foundation.countries,
    fragrances:
      foundation.fragrances,
    assets:
      foundation.assets,
    ratings:
      foundation.fragrances.flatMap(
        (fragrance) =>
          fragrance.ratings,
      ),
    metadata: {
      ...snapshot.metadata,
      fragranceCount:
        foundation.fragrances.length,
      brandCount:
        foundation.brands.length,
      perfumerCount:
        foundation.perfumers.length,
      noteCount:
        foundation.notes.length,
      accordCount:
        foundation.accords.length,
    },
  };
}
