import {
  bundledIntelligenceCatalog,
} from "@/lib/data/intelligence-catalog";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  loadImportedCatalog,
} from "@/lib/database/import/storage";
import {
  loadActivatedIntelligenceCatalogV2,
} from "@/lib/catalog-v2/activation/storage";

export function getActiveFragranceCatalog() {
  const imported =
    loadImportedCatalog();
  const activatedCatalogV2 =
    loadActivatedIntelligenceCatalogV2();

  return mergeFragranceCatalogs(
    bundledIntelligenceCatalog,
    imported,
    activatedCatalogV2,
  );
}

export function mergeFragranceCatalogs(
  ...catalogs: FragranceRecord[][]
) {
  const byId =
    new Map<
      string,
      FragranceRecord
    >();

  for (
    const item
    of catalogs.flat()
  ) {
    byId.set(
      item.id,
      item,
    );
  }

  return [
    ...byId.values(),
  ];
}
