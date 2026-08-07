import {
  houseCoverageTargets,
} from "@/lib/catalog-v2/data/house-coverage-targets";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import {
  normalizeCatalogText,
} from "@/lib/catalog-v2/normalize";

export function calculateCatalogCoverage(
  records:
    CatalogV2Record[],
) {
  const brands =
    new Map<
      string,
      number
    >();

  for (
    const record
    of records
  ) {
    const key =
      normalizeCatalogText(
        record.brand,
      );

    brands.set(
      key,
      (
        brands.get(
          key,
        ) ??
        0
      ) + 1,
    );
  }

  const tiers =
    Object.entries(
      houseCoverageTargets,
    ).map(
      ([
        tier,
        houses,
      ]) => {
        const covered =
          houses.filter(
            (house) =>
              brands.has(
                normalizeCatalogText(
                  house,
                ),
              ),
          );

        return {
          tier,
          targetHouses:
            houses.length,
          coveredHouses:
            covered.length,
          missingHouses:
            houses.filter(
              (house) =>
                !covered.includes(
                  house,
                ),
            ),
          coveragePercent:
            Math.round(
              (
                covered.length /
                Math.max(
                  1,
                  houses.length,
                )
              ) *
                100,
            ),
        };
      },
    );

  return {
    fragranceCount:
      records.length,
    brandCount:
      brands.size,
    validatedCount:
      records.filter(
        (record) =>
          record.validationStatus ===
          "validated",
      ).length,
    reviewCount:
      records.filter(
        (record) =>
          record.validationStatus ===
          "review",
      ).length,
    sourceCount:
      new Set(
        records.flatMap(
          (record) =>
            record.provenance.map(
              (source) =>
                source.sourceId,
            ),
        ),
      ).size,
    tiers,
  };
}
