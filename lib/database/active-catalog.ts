import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  loadImportedCatalog,
} from "@/lib/database/import/storage";

export function getActiveFragranceCatalog() {
  const imported =
    loadImportedCatalog();
  return mergeFragranceCatalogs(
    bundledIntelligenceCatalog,
    imported,
  );
}

export function mergeFragranceCatalogs(
  bundled: FragranceRecord[],
  imported: FragranceRecord[],
) {
  const byId =
    new Map<
      string,
      FragranceRecord
    >();

  for (const item of [
    ...bundled,
    ...imported,
  ]) {
    byId.set(
      item.id,
      item,
    );
  }

  return [...byId.values()];
}
