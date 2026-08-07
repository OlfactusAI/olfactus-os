import type {
  GlobalDatabaseIndex,
  GlobalDatabaseSnapshot,
  GlobalEntityType,
  GlobalRelationship,
} from "@/lib/database/core/types";
import {
  validateGlobalDatabase,
  type DatabaseValidationResult,
} from "@/lib/database/core/validator";

export class GlobalDatabaseRepository {
  readonly snapshot:
    GlobalDatabaseSnapshot;
  readonly index:
    GlobalDatabaseIndex;
  readonly validation:
    DatabaseValidationResult;

  constructor(
    snapshot: GlobalDatabaseSnapshot,
  ) {
    this.snapshot = snapshot;
    this.validation =
      validateGlobalDatabase(
        snapshot,
      );

    if (!this.validation.valid) {
      const first =
        this.validation.issues.find(
          (issue) =>
            issue.severity ===
            "error",
        );

      throw new Error(
        first?.message ??
          "Invalid global database snapshot.",
      );
    }

    this.index =
      buildGlobalDatabaseIndex(
        snapshot,
      );
  }

  getFragrance(id: string) {
    return (
      this.index.fragranceById.get(
        id,
      ) ?? null
    );
  }

  getBrand(id: string) {
    return (
      this.index.brandById.get(
        id,
      ) ?? null
    );
  }

  getPerfumer(id: string) {
    return (
      this.index.perfumerById.get(
        id,
      ) ?? null
    );
  }

  getNote(id: string) {
    return (
      this.index.noteById.get(
        id,
      ) ?? null
    );
  }

  getAccord(id: string) {
    return (
      this.index.accordById.get(
        id,
      ) ?? null
    );
  }

  getIngredient(id: string) {
    return (
      this.index.ingredientById.get(
        id,
      ) ?? null
    );
  }

  getLine(id: string) {
    return (
      this.index.lineById.get(
        id,
      ) ?? null
    );
  }

  getRelationshipsFrom({
    type,
    id,
  }: {
    type: GlobalEntityType;
    id: string;
  }) {
    return (
      this.index.relationshipsBySource.get(
        entityKey(type, id),
      ) ?? []
    );
  }

  getRelationshipsTo({
    type,
    id,
  }: {
    type: GlobalEntityType;
    id: string;
  }) {
    return (
      this.index.relationshipsByTarget.get(
        entityKey(type, id),
      ) ?? []
    );
  }

  getConnectedEntities({
    type,
    id,
  }: {
    type: GlobalEntityType;
    id: string;
  }) {
    const outgoing =
      this.getRelationshipsFrom({
        type,
        id,
      });
    const incoming =
      this.getRelationshipsTo({
        type,
        id,
      });

    return [
      ...outgoing.map(
        (relationship) => ({
          direction:
            "outgoing" as const,
          relationship,
        }),
      ),
      ...incoming.map(
        (relationship) => ({
          direction:
            "incoming" as const,
          relationship,
        }),
      ),
    ];
  }

  searchFragrances(
    query: string,
  ) {
    const normalized =
      query.trim().toLowerCase();

    if (!normalized) {
      return [
        ...this.snapshot.fragrances,
      ];
    }

    return this.snapshot.fragrances
      .map((fragrance) => {
        const brand =
          this.getBrand(
            fragrance.brandId,
          );

        const fields = [
          fragrance.name,
          fragrance.brand,
          brand?.canonicalName ??
            "",
          fragrance.family,
          fragrance.concentration,
          ...fragrance.roles,
          ...fragrance.moods,
        ].map((value) =>
          value.toLowerCase(),
        );

        const score =
          fields.reduce(
            (total, field) => {
              if (
                field === normalized
              ) {
                return total + 100;
              }
              if (
                field.startsWith(
                  normalized,
                )
              ) {
                return total + 50;
              }
              if (
                field.includes(
                  normalized,
                )
              ) {
                return total + 20;
              }
              return total;
            },
            0,
          );

        return {
          fragrance,
          score,
        };
      })
      .filter(
        (result) =>
          result.score > 0,
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.fragrance.name.localeCompare(
            b.fragrance.name,
          ),
      )
      .map(
        (result) =>
          result.fragrance,
      );
  }
}

export function buildGlobalDatabaseIndex(
  snapshot: GlobalDatabaseSnapshot,
): GlobalDatabaseIndex {
  const relationshipsBySource =
    new Map<
      string,
      GlobalRelationship[]
    >();
  const relationshipsByTarget =
    new Map<
      string,
      GlobalRelationship[]
    >();

  for (const relationship of snapshot.relationships) {
    appendRelationship(
      relationshipsBySource,
      entityKey(
        relationship.sourceType,
        relationship.sourceId,
      ),
      relationship,
    );
    appendRelationship(
      relationshipsByTarget,
      entityKey(
        relationship.targetType,
        relationship.targetId,
      ),
      relationship,
    );
  }

  return {
    fragranceById:
      new Map(
        snapshot.fragrances.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    brandById:
      new Map(
        snapshot.brands.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    perfumerById:
      new Map(
        snapshot.perfumers.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    noteById:
      new Map(
        snapshot.notes.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    accordById:
      new Map(
        snapshot.accords.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    concentrationById:
      new Map(
        snapshot.concentrations.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    countryByCode:
      new Map(
        snapshot.countries.map(
          (item) => [
            item.code,
            item,
          ],
        ),
      ),
    ingredientById:
      new Map(
        snapshot.ingredients.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    lineById:
      new Map(
        snapshot.lines.map(
          (item) => [
            item.id,
            item,
          ],
        ),
      ),
    relationshipsBySource,
    relationshipsByTarget,
  };
}

function appendRelationship(
  index: Map<
    string,
    GlobalRelationship[]
  >,
  key: string,
  relationship: GlobalRelationship,
) {
  const current =
    index.get(key) ?? [];
  current.push(relationship);
  index.set(key, current);
}

function entityKey(
  type: GlobalEntityType,
  id: string,
) {
  return `${type}:${id}`;
}
