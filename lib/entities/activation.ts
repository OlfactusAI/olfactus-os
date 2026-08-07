import type { FragranceRecord } from "@/lib/domain/fragrance";
import { entitySlug } from "@/lib/entities/normalization";

export interface EntityActivationResult {
  fragrance: FragranceRecord;
  generatedAliases: string[];
  activatedAt: string;
  warnings: string[];
}

export function activateFragranceEntity(
  fragrance: FragranceRecord,
): EntityActivationResult {
  const aliases = [
    fragrance.id,
    fragrance.name,
    `${fragrance.brand} ${fragrance.name}`,
    entitySlug(fragrance.brand, fragrance.name),
  ].filter(Boolean);

  const warnings: string[] = [];
  if (!fragrance.brand) warnings.push("Missing brand.");
  if (!fragrance.name) warnings.push("Missing fragrance name.");
  if (!fragrance.family) warnings.push("Missing fragrance family.");

  return {
    fragrance,
    generatedAliases: [...new Set(aliases)],
    activatedAt: new Date().toISOString(),
    warnings,
  };
}

export function activateCatalogEntities(
  catalog: FragranceRecord[],
) {
  return catalog.map(activateFragranceEntity);
}
