import {
  fragrances as coreFragrances,
} from "@/lib/data/fragrances";
import {
  globalDiscoveryFragrances,
} from "@/lib/data/global-discovery-fragrances";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

export function mergeIntelligenceCatalogs(
  ...catalogs:
    FragranceRecord[][]
) {
  const byId =
    new Map<
      string,
      FragranceRecord
    >();

  for (
    const catalog
    of catalogs
  ) {
    for (
      const fragrance
      of catalog
    ) {
      byId.set(
        fragrance.id,
        fragrance,
      );
    }
  }

  return [
    ...byId.values(),
  ];
}

export const bundledIntelligenceCatalog =
  mergeIntelligenceCatalogs(
    coreFragrances,
    globalDiscoveryFragrances,
  );
