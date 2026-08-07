import type {
  EntityRegistry,
  EntityType,
  RegisteredEntity,
} from "@/lib/entities/types";
import { normalizeEntityLookup } from "@/lib/entities/normalization";

export interface EntitySearchResult {
  id: string;
  type: EntityType;
  label: string;
  subtitle?: string;
  href: string;
  score: number;
  confidence: number;
  matchedBy: "label" | "alias" | "slug" | "metadata";
}

export function searchEntityRegistry({
  registry,
  query,
  limit = 30,
}: {
  registry: EntityRegistry;
  query: string;
  limit?: number;
}) {
  const normalized = normalizeEntityLookup(query);
  if (!normalized) return [] as EntitySearchResult[];

  return registry.entities
    .map((entity) => scoreEntity(entity, normalized))
    .filter(
      (result): result is EntitySearchResult => Boolean(result),
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function scoreEntity(
  entity: RegisteredEntity,
  query: string,
): EntitySearchResult | null {
  const label = normalizeEntityLookup(entity.label);
  const slug = normalizeEntityLookup(entity.slug);
  const aliases = entity.aliases.map(normalizeEntityLookup);
  const metadata = normalizeEntityLookup(
    JSON.stringify(entity.metadata),
  );

  let score = 0;
  let matchedBy: EntitySearchResult["matchedBy"] = "metadata";

  if (label === query) {
    score = 100;
    matchedBy = "label";
  } else if (aliases.includes(query)) {
    score = 96;
    matchedBy = "alias";
  } else if (slug === query) {
    score = 94;
    matchedBy = "slug";
  } else if (label.includes(query)) {
    score = 84;
    matchedBy = "label";
  } else if (aliases.some((alias) => alias.includes(query))) {
    score = 78;
    matchedBy = "alias";
  } else if (metadata.includes(query)) {
    score = 58;
  } else {
    return null;
  }

  return {
    id: entity.canonicalId,
    type: entity.type,
    label: entity.label,
    subtitle: entity.subtitle,
    href: `/entity/${entity.type}/${entity.id}`,
    score: score + Math.round(entity.confidence / 20),
    confidence: entity.confidence,
    matchedBy,
  };
}
