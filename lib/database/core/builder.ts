import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  buildGlobalFragranceDatabase,
} from "@/lib/database/database-foundation";
import type {
  GlobalDatabaseSnapshot,
  GlobalRelationship,
  IngredientEntity,
  FragranceLineEntity,
} from "@/lib/database/core/types";

export function buildGlobalDatabaseSnapshot({
  catalog,
  ingredients = [],
  lines = [],
  relationships = [],
  datasetId =
    "olfactus-local-catalog",
  datasetVersion =
    "2.0.0-alpha.1",
}: {
  catalog: FragranceRecord[];
  ingredients?: IngredientEntity[];
  lines?: FragranceLineEntity[];
  relationships?: GlobalRelationship[];
  datasetId?: string;
  datasetVersion?: string;
}): GlobalDatabaseSnapshot {
  const foundation =
    buildGlobalFragranceDatabase({
      catalog,
    });

  const generatedRelationships =
    generateFoundationRelationships(
      foundation,
    );

  const allRelationships =
    deduplicateRelationships([
      ...generatedRelationships,
      ...relationships,
    ]);

  const availableCount = {
    "widely-available": 0,
    limited: 0,
    discontinued: 0,
    unknown: 0,
  };

  for (const fragrance of foundation.fragrances) {
    availableCount[
      fragrance.availability
    ] += 1;
  }

  const concentrations =
    completeConcentrations(
      foundation,
    );

  return {
    schemaVersion:
      "GFD-2.0.0",
    generatedAt:
      new Date().toISOString(),
    datasetId,
    datasetVersion,
    fragrances:
      foundation.fragrances,
    brands:
      foundation.brands,
    perfumers:
      foundation.perfumers,
    notes:
      foundation.notes,
    accords:
      foundation.accords,
    concentrations,
    countries:
      foundation.countries,
    ingredients,
    lines,
    relationships:
      allRelationships,
    assets:
      foundation.assets,
    ratings:
      foundation.fragrances.flatMap(
        (fragrance) =>
          fragrance.ratings,
      ),
    metadata: {
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
      ingredientCount:
        ingredients.length,
      lineCount:
        lines.length,
      relationshipCount:
        allRelationships.length,
      availableCount,
    },
  };
}

function generateFoundationRelationships(
  foundation: ReturnType<
    typeof buildGlobalFragranceDatabase
  >,
) {
  const relationships:
    GlobalRelationship[] = [];

  for (const fragrance of foundation.fragrances) {
    relationships.push({
      id:
        `relationship:${fragrance.id}:brand:${fragrance.brandId}`,
      sourceType:
        "fragrance",
      sourceId:
        fragrance.id,
      targetType:
        "brand",
      targetId:
        fragrance.brandId,
      type:
        "belongs-to-brand",
      strength: 100,
      confidence:
        fragrance.dataQualityScore,
      sources: [],
    });

    relationships.push({
      id:
        `relationship:${fragrance.id}:concentration:${fragrance.concentrationId}`,
      sourceType:
        "fragrance",
      sourceId:
        fragrance.id,
      targetType:
        "concentration",
      targetId:
        fragrance.concentrationId,
      type:
        "has-concentration",
      strength: 100,
      confidence:
        fragrance.dataQualityScore,
      sources: [],
    });

    for (const perfumerId of fragrance.perfumerIds) {
      relationships.push({
        id:
          `relationship:${fragrance.id}:perfumer:${perfumerId}`,
        sourceType:
          "fragrance",
        sourceId:
          fragrance.id,
        targetType:
          "perfumer",
        targetId:
          perfumerId,
        type:
          "created-by",
        strength: 100,
        confidence:
          fragrance.dataQualityScore,
        sources: [],
      });
    }

    for (const noteId of [
      ...fragrance.noteIds.top,
      ...fragrance.noteIds.heart,
      ...fragrance.noteIds.base,
    ]) {
      relationships.push({
        id:
          `relationship:${fragrance.id}:note:${noteId}`,
        sourceType:
          "fragrance",
        sourceId:
          fragrance.id,
        targetType:
          "note",
        targetId:
          noteId,
        type:
          "contains-note",
        strength: 88,
        confidence:
          fragrance.dataQualityScore,
        sources: [],
      });
    }

    for (const accordId of fragrance.accordIds) {
      relationships.push({
        id:
          `relationship:${fragrance.id}:accord:${accordId}`,
        sourceType:
          "fragrance",
        sourceId:
          fragrance.id,
        targetType:
          "accord",
        targetId:
          accordId,
        type:
          "has-accord",
        strength: 90,
        confidence:
          fragrance.dataQualityScore,
        sources: [],
      });
    }
  }

  return relationships;
}

function deduplicateRelationships(
  values: GlobalRelationship[],
) {
  const byId =
    new Map<
      string,
      GlobalRelationship
    >();

  for (const value of values) {
    const current =
      byId.get(value.id);

    if (
      !current ||
      value.confidence >=
        current.confidence
    ) {
      byId.set(
        value.id,
        value,
      );
    }
  }

  return [...byId.values()];
}


function completeConcentrations(
  foundation: ReturnType<
    typeof buildGlobalFragranceDatabase
  >,
) {
  const byId =
    new Map(
      foundation.concentrations.map(
        (concentration) => [
          concentration.id,
          concentration,
        ],
      ),
    );

  for (const fragrance of foundation.fragrances) {
    if (
      !byId.has(
        fragrance.concentrationId,
      )
    ) {
      byId.set(
        fragrance.concentrationId,
        {
          id:
            fragrance.concentrationId,
          canonicalName:
            fragrance.concentration,
          aliases: [],
        },
      );
    }
  }

  return [...byId.values()].sort(
    (a, b) =>
      a.canonicalName.localeCompare(
        b.canonicalName,
      ),
  );
}
