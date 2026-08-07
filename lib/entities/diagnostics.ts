import type { EntityRegistry } from "@/lib/entities/types";

export function diagnoseEntityRegistry(
  registry: EntityRegistry,
) {
  const byType = registry.entities.reduce<Record<string, number>>(
    (counts, entity) => {
      counts[entity.type] = (counts[entity.type] ?? 0) + 1;
      return counts;
    },
    {},
  );

  const aliasOwners = new Map<string, string>();
  const duplicateAliases: string[] = [];

  for (const entity of registry.entities) {
    for (const alias of [entity.slug, ...entity.aliases]) {
      const key = `${entity.type}:${alias.toLowerCase()}`;
      const owner = aliasOwners.get(key);
      if (owner && owner !== entity.canonicalId) {
        duplicateAliases.push(key);
      } else {
        aliasOwners.set(key, entity.canonicalId);
      }
    }
  }

  const brokenRelationships = registry.relationships.filter(
    (relationship) =>
      !registry.byCanonicalId.has(relationship.sourceId) ||
      !registry.byCanonicalId.has(relationship.targetId),
  );

  return {
    entityCount: registry.entities.length,
    relationshipCount: registry.relationships.length,
    byType,
    orphanCount: registry.entities.filter(
      (entity) => entity.relationships.length === 0,
    ).length,
    duplicateAliasCount: new Set(duplicateAliases).size,
    brokenRelationshipCount: brokenRelationships.length,
    missingConfidenceCount: registry.entities.filter(
      (entity) => !Number.isFinite(entity.confidence),
    ).length,
  };
}
