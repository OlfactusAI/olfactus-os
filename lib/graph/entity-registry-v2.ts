import type { FragranceRecord } from "@/lib/domain/fragrance";
import type { GlobalEntityType, GlobalGraphEntity } from "@/lib/graph/global-types";

export interface GlobalEntityRegistry {
  entities: GlobalGraphEntity[];
  byId: Map<string, GlobalGraphEntity>;
  byAlias: Map<string, GlobalGraphEntity[]>;
}

export function buildGlobalEntityRegistry(catalog: FragranceRecord[]): GlobalEntityRegistry {
  const byId = new Map<string, GlobalGraphEntity>();

  const register = (entity: GlobalGraphEntity) => {
    const existing = byId.get(entity.canonicalId);
    if (existing) {
      byId.set(entity.canonicalId, {
        ...existing,
        aliases: [...new Set([...existing.aliases, ...entity.aliases])],
        confidence: Math.max(existing.confidence, entity.confidence),
        metadata: { ...existing.metadata, ...entity.metadata },
      });
      return;
    }
    byId.set(entity.canonicalId, entity);
  };

  for (const fragrance of catalog) {
    register({
      id: fragrance.id,
      canonicalId: entityId("fragrance", fragrance.id),
      type: "fragrance",
      name: fragrance.name,
      aliases: [fragrance.id, fragrance.name, `${fragrance.brand} ${fragrance.name}`],
      confidence: fragrance.intelligence?.confidence ?? confidenceFromStatus(fragrance.intelligenceStatus),
      status: fragrance.intelligenceStatus,
      metadata: {
        brand: fragrance.brand,
        family: fragrance.family,
        concentration: fragrance.concentration,
        releaseYear: fragrance.releaseYear,
      },
    });

    registerSimple("brand", fragrance.brand, 96, "validated", register);
    registerSimple("family", fragrance.family, 84, "calibration", register);

    for (const perfumer of fragrance.perfumers ?? []) {
      registerSimple("perfumer", perfumer, 86, "calibration", register);
    }
    for (const accord of fragrance.accords ?? []) {
      registerSimple("accord", accord, 82, "calibration", register);
    }
    for (const note of flattenNotes(fragrance.notes)) {
      registerSimple("ingredient", note, 72, "calibration", register);
    }
    for (const dimension of dominantDna(fragrance)) {
      registerSimple("dna-family", dimension, 80, "calibration", register);
    }
  }

  const entities = [...byId.values()];
  const byAlias = new Map<string, GlobalGraphEntity[]>();

  for (const entity of entities) {
    for (const alias of [entity.name, ...entity.aliases]) {
      const key = normalize(alias);
      byAlias.set(key, [...(byAlias.get(key) ?? []), entity]);
    }
  }

  return { entities, byId, byAlias };
}

export function entityId(type: GlobalEntityType, raw: string) {
  return `${type}:${slug(raw)}`;
}

export function findRegistryEntities(registry: GlobalEntityRegistry, query: string) {
  const normalized = normalize(query);
  const exact = registry.byAlias.get(normalized);
  if (exact?.length) return exact;

  return registry.entities
    .filter((entity) =>
      normalize(entity.name).includes(normalized) ||
      entity.aliases.some((alias) => normalize(alias).includes(normalized)),
    )
    .slice(0, 30);
}

function registerSimple(
  type: GlobalEntityType,
  name: string,
  confidence: number,
  status: GlobalGraphEntity["status"],
  register: (entity: GlobalGraphEntity) => void,
) {
  register({
    id: slug(name),
    canonicalId: entityId(type, name),
    type,
    name,
    aliases: [name, slug(name)],
    confidence,
    status,
    metadata: {},
  });
}

function flattenNotes(notes: FragranceRecord["notes"]) {
  if (!notes) return [];
  return [...new Set(Object.values(notes).flat())];
}

function dominantDna(fragrance: FragranceRecord) {
  return Object.entries(fragrance.dna)
    .filter(([, value]) => value >= 68)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([key]) => key);
}

function confidenceFromStatus(status: FragranceRecord["intelligenceStatus"]) {
  return status === "validated" ? 94 : status === "calibration" ? 72 : 45;
}

function slug(value: string) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
