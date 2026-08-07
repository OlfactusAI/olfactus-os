import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  buildGlobalDatabaseSnapshot,
} from "@/lib/database/core/builder";
import type {
  FragranceLineEntity,
  IngredientEntity,
} from "@/lib/database/core/types";
import type {
  UniversalSearchDocument,
  UniversalSearchIndex,
} from "@/lib/search/types";
import {
  normalizeSearchText,
  tokenizeSearchText,
  uniqueSearchValues,
} from "@/lib/search/normalization";
import type {
  FragranceRatingAggregate,
} from "@/lib/database/schema";

export function buildUniversalSearchIndex({
  catalog,
  importedCatalog = [],
  ingredients = [],
  lines = [],
}: {
  catalog: FragranceRecord[];
  importedCatalog?: FragranceRecord[];
  ingredients?: IngredientEntity[];
  lines?: FragranceLineEntity[];
}): UniversalSearchIndex {
  const mergedCatalog =
    mergeCatalogs(
      catalog,
      importedCatalog,
    );
  const snapshot =
    buildGlobalDatabaseSnapshot({
      catalog: mergedCatalog,
      ingredients,
      lines,
    });

  const importedIds =
    new Set(
      importedCatalog.map(
        (item) => item.id,
      ),
    );

  const fragranceIdsByBrand =
    new Map<
      string,
      string[]
    >();
  const fragranceIdsByPerfumer =
    new Map<
      string,
      string[]
    >();

  for (const fragrance of snapshot.fragrances) {
    appendId(
      fragranceIdsByBrand,
      fragrance.brandId,
      fragrance.id,
    );

    for (const perfumerId of fragrance.perfumerIds) {
      appendId(
        fragranceIdsByPerfumer,
        perfumerId,
        fragrance.id,
      );
    }
  }

  const documents:
    UniversalSearchDocument[] = [
      ...snapshot.fragrances.map(
        (fragrance) => ({
          id:
            `fragrance:${fragrance.id}`,
          entityType:
            "fragrance" as const,
          label:
            fragrance.name,
          subtitle:
            `${fragrance.brand} · ${fragrance.concentration}`,
          aliases:
            uniqueSearchValues([
              fragrance.canonicalSlug,
              `${fragrance.name} ${fragrance.concentration}`,
              `${fragrance.brand} ${fragrance.name}`,
            ]),
          keywords:
            uniqueSearchValues([
              fragrance.brand,
              fragrance.family,
              fragrance.concentration,
              ...fragrance.roles,
              ...fragrance.moods,
              ...(fragrance.perfumers ?? []),
              ...(fragrance.notes?.top ?? []),
              ...(fragrance.notes?.heart ?? []),
              ...(fragrance.notes?.base ?? []),
              ...(fragrance.accords ?? []),
            ]),
          route:
            `/explorer?fragrance=${encodeURIComponent(
              fragrance.id,
            )}`,
          qualityScore:
            fragrance.dataQualityScore,
          popularityScore:
            fragrance.popularityScore ??
            popularityFromRatings(
              fragrance.ratings,
            ),
          source:
            importedIds.has(
              fragrance.id,
            )
              ? "imported" as const
              : "bundled" as const,
          metadata: {
            fragranceId:
              fragrance.id,
            brandId:
              fragrance.brandId,
            concentrationId:
              fragrance.concentrationId,
            releaseYear:
              fragrance.releaseYear,
          },
        }),
      ),
      ...snapshot.brands.map(
        (brand) => {
          const fragranceIds =
            fragranceIdsByBrand.get(
              brand.id,
            ) ?? [];

          return {
            id:
              `brand:${brand.id}`,
            entityType:
              "brand" as const,
            label:
              brand.canonicalName,
            subtitle:
              brand.countryCode
                ? `Brand · ${brand.countryCode}`
                : "Brand",
            aliases:
              brand.aliases,
            keywords:
              uniqueSearchValues([
                brand.countryCode ??
                  "",
                brand.parentCompany ??
                  "",
                brand.website ??
                  "",
                brand.status,
              ]),
            route:
              `/brands?brand=${encodeURIComponent(
                brand.id,
              )}`,
            qualityScore:
              brand.confidence,
            popularityScore:
              Math.min(
                100,
                50 +
                  fragranceIds.length *
                    3,
              ),
            source:
              fragranceIds.some(
                (id: string) =>
                  importedIds.has(id),
              )
                ? "imported" as const
                : "bundled" as const,
            metadata: {
              brandId:
                brand.id,
              fragranceCount:
                fragranceIds.length,
            },
          };
        },
      ),
      ...snapshot.perfumers.map(
        (perfumer) => {
          const fragranceIds =
            fragranceIdsByPerfumer.get(
              perfumer.id,
            ) ?? [];

          return {
            id:
              `perfumer:${perfumer.id}`,
            entityType:
              "perfumer" as const,
            label:
              perfumer.canonicalName,
            subtitle:
              perfumer.countryCode
                ? `Perfumer · ${perfumer.countryCode}`
                : "Perfumer",
            aliases:
              perfumer.aliases,
            keywords:
              uniqueSearchValues([
                perfumer.countryCode ??
                  "",
                perfumer.biography ??
                  "",
                perfumer.status,
              ]),
            route:
              `/perfumers?perfumer=${encodeURIComponent(
                perfumer.id,
              )}`,
            qualityScore:
              perfumer.confidence,
            popularityScore:
              Math.min(
                100,
                45 +
                  fragranceIds.length *
                    4,
              ),
            source:
              fragranceIds.some(
                (id: string) =>
                  importedIds.has(id),
              )
                ? "imported" as const
                : "bundled" as const,
            metadata: {
              perfumerId:
                perfumer.id,
              fragranceCount:
                fragranceIds.length,
            },
          };
        },
      ),
      ...snapshot.notes.map(
        (note) => ({
          id:
            `note:${note.id}`,
          entityType:
            "note" as const,
          label:
            note.canonicalName,
          subtitle:
            `Note · ${note.category}`,
          aliases:
            note.aliases,
          keywords:
            uniqueSearchValues([
              note.category,
              note.naturality,
              note.description ??
                "",
            ]),
          route:
            `/database?note=${encodeURIComponent(
              note.id,
            )}`,
          qualityScore:
            note.confidence,
          popularityScore: 50,
          source:
            "bundled" as const,
          metadata: {
            noteId:
              note.id,
            category:
              note.category,
            naturality:
              note.naturality,
          },
        }),
      ),
      ...snapshot.accords.map(
        (accord) => ({
          id:
            `accord:${accord.id}`,
          entityType:
            "accord" as const,
          label:
            accord.canonicalName,
          subtitle:
            "Accord",
          aliases:
            accord.aliases,
          keywords:
            uniqueSearchValues([
              accord.description ??
                "",
              ...accord.relatedNoteIds,
            ]),
          route:
            `/database?accord=${encodeURIComponent(
              accord.id,
            )}`,
          qualityScore:
            accord.confidence,
          popularityScore: 50,
          source:
            "bundled" as const,
          metadata: {
            accordId:
              accord.id,
          },
        }),
      ),
      ...snapshot.ingredients.map(
        (ingredient) => ({
          id:
            `ingredient:${ingredient.id}`,
          entityType:
            "ingredient" as const,
          label:
            ingredient.canonicalName,
          subtitle:
            `Ingredient · ${ingredient.category}`,
          aliases:
            ingredient.aliases,
          keywords:
            uniqueSearchValues([
              ingredient.category,
              ingredient.volatility,
              ...ingredient.odorProfile,
              ...ingredient.extractionMethods,
            ]),
          route:
            `/database?ingredient=${encodeURIComponent(
              ingredient.id,
            )}`,
          qualityScore:
            ingredient.confidence,
          popularityScore: 45,
          source:
            "bundled" as const,
          metadata: {
            ingredientId:
              ingredient.id,
          },
        }),
      ),
      ...snapshot.lines.map(
        (line) => ({
          id:
            `line:${line.id}`,
          entityType:
            "line" as const,
          label:
            line.canonicalName,
          subtitle:
            `${line.memberFragranceIds.length} releases`,
          aliases: [],
          keywords:
            line.memberFragranceIds,
          route:
            `/lineage?line=${encodeURIComponent(
              line.id,
            )}`,
          qualityScore:
            line.confidence,
          popularityScore:
            Math.min(
              100,
              45 +
                line.memberFragranceIds.length *
                  6,
            ),
          source:
            line.memberFragranceIds.some(
              (id: string) =>
                importedIds.has(id),
            )
              ? "imported" as const
              : "bundled" as const,
          metadata: {
            lineId:
              line.id,
            memberCount:
              line.memberFragranceIds.length,
          },
        }),
      ),
    ];

  const documentsById =
    new Map(
      documents.map(
        (document) => [
          document.id,
          document,
        ],
      ),
    );

  const tokenIndex =
    new Map<
      string,
      Set<string>
    >();

  for (const document of documents) {
    const values = [
      document.label,
      document.subtitle ?? "",
      ...document.aliases,
      ...document.keywords,
    ];

    for (const token of uniqueSearchValues(
      values.flatMap(
        tokenizeSearchText,
      ),
    )) {
      const normalized =
        normalizeSearchText(
          token,
        );
      const current =
        tokenIndex.get(
          normalized,
        ) ??
        new Set<string>();
      current.add(
        document.id,
      );
      tokenIndex.set(
        normalized,
        current,
      );
    }
  }

  return {
    version: "USE-2.0.0",
    generatedAt:
      new Date().toISOString(),
    documents,
    documentsById,
    tokenIndex,
  };
}

function appendId(
  index: Map<
    string,
    string[]
  >,
  key: string,
  value: string,
) {
  const current =
    index.get(key) ?? [];
  current.push(value);
  index.set(key, current);
}

function mergeCatalogs(
  catalog: FragranceRecord[],
  importedCatalog: FragranceRecord[],
) {
  const byId =
    new Map<
      string,
      FragranceRecord
    >();

  for (const item of [
    ...catalog,
    ...importedCatalog,
  ]) {
    byId.set(
      item.id,
      item,
    );
  }

  return [...byId.values()];
}

function popularityFromRatings(
  ratings:
    FragranceRatingAggregate[],
) {
  if (!ratings.length) {
    return 50;
  }

  const normalized =
    ratings.map(
      (rating) =>
        (rating.score /
          rating.scaleMaximum) *
          100,
    );
  const average =
    normalized.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / normalized.length;
  const votes =
    ratings.reduce(
      (sum, rating) =>
        sum +
        (rating.voteCount ??
          0),
      0,
    );

  return Math.min(
    100,
    Math.round(
      average * 0.8 +
        Math.min(
          20,
          Math.log10(
            votes + 1,
          ) * 4,
        ),
    ),
  );
}
