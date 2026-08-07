import type { FragranceRecord } from "@/lib/domain/fragrance";
import { entityId, type GlobalEntityRegistry } from "@/lib/graph/entity-registry-v2";
import type { GlobalGraphRelationship, GlobalRelationshipType } from "@/lib/graph/global-types";

export function buildGlobalRelationships({
  catalog,
  registry,
}: {
  catalog: FragranceRecord[];
  registry: GlobalEntityRegistry;
}): GlobalGraphRelationship[] {
  const relationships = new Map<string, GlobalGraphRelationship>();

  const add = (input: Omit<GlobalGraphRelationship, "id">) => {
    if (!registry.byId.has(input.sourceId) || !registry.byId.has(input.targetId)) return;
    const id = `${input.type}:${input.sourceId}:${input.targetId}`;
    const existing = relationships.get(id);
    relationships.set(id, existing ? {
      ...existing,
      weight: Math.max(existing.weight, input.weight),
      confidence: Math.max(existing.confidence, input.confidence),
    } : { id, ...input });
  };

  for (const fragrance of catalog) {
    const fid = entityId("fragrance", fragrance.id);

    edge(add, fid, entityId("brand", fragrance.brand), "belongs-to-brand", 100, 98,
      `${fragrance.name} belongs to ${fragrance.brand}.`, "catalog");
    edge(add, fid, entityId("family", fragrance.family), "belongs-to-family", 92, 88,
      `${fragrance.name} is classified in the ${fragrance.family} family.`, "catalog");

    for (const perfumer of fragrance.perfumers ?? []) {
      edge(add, fid, entityId("perfumer", perfumer), "created-by", 100, 88,
        `${fragrance.name} is credited to ${perfumer}.`, "catalog");
    }
    for (const accord of fragrance.accords ?? []) {
      edge(add, fid, entityId("accord", accord), "uses-accord", 88, 82,
        `${fragrance.name} expresses the ${accord} accord.`, "catalog");
    }
    for (const ingredient of flattenNotes(fragrance.notes)) {
      edge(add, fid, entityId("ingredient", ingredient), "uses-ingredient", 78, 72,
        `${ingredient} appears in the note structure for ${fragrance.name}.`, "catalog");
    }
    for (const dna of dominantDna(fragrance)) {
      edge(add, fid, entityId("dna-family", dna), "shares-dna",
        Math.round(fragrance.dna[dna as keyof typeof fragrance.dna]), 80,
        `${fragrance.name} strongly expresses ${dna} DNA.`, "calculated");
    }
  }

  for (let i = 0; i < catalog.length; i += 1) {
    for (let j = i + 1; j < catalog.length; j += 1) {
      const a = catalog[i];
      const b = catalog[j];
      const similarity = fragranceSimilarity(a, b);

      if (similarity >= 76) {
        edge(add, entityId("fragrance", a.id), entityId("fragrance", b.id),
          "similar-to", similarity, 74,
          `${a.name} and ${b.name} share high calculated fragrance-space similarity.`, "calculated");
        edge(add, entityId("fragrance", b.id), entityId("fragrance", a.id),
          "similar-to", similarity, 74,
          `${b.name} and ${a.name} share high calculated fragrance-space similarity.`, "calculated");
      }

      if (similarity >= 68 && a.roles.some((role) => b.roles.includes(role))) {
        edge(add, entityId("fragrance", a.id), entityId("fragrance", b.id),
          "competes-with", Math.round(similarity * 0.92), 68,
          `${a.name} and ${b.name} compete for overlapping collection roles.`, "calculated");
      }

      addRelativeEdge(add, a, b, "projection", "more-intense-than", 18);
      addRelativeEdge(add, a, b, "fresh", "more-fresh-than", 24);
      addRelativeEdge(add, a, b, "formal", "more-formal-than", 24);
    }
  }

  return [...relationships.values()];
}

function addRelativeEdge(
  add: (input: Omit<GlobalGraphRelationship, "id">) => void,
  a: FragranceRecord,
  b: FragranceRecord,
  dimension: "projection" | "fresh" | "formal",
  type: GlobalRelationshipType,
  minimumDelta: number,
) {
  const aValue = dimension === "projection" ? a.performance.projection : a.dna[dimension];
  const bValue = dimension === "projection" ? b.performance.projection : b.dna[dimension];
  const delta = aValue - bValue;
  if (Math.abs(delta) < minimumDelta) return;

  const source = delta > 0 ? a : b;
  const target = delta > 0 ? b : a;

  edge(add, entityId("fragrance", source.id), entityId("fragrance", target.id), type,
    Math.min(100, 58 + Math.abs(delta)), 76,
    `${source.name} is materially ${dimension === "projection" ? "more intense" : `more ${dimension}`} than ${target.name}.`,
    "calculated");
}

function edge(
  add: (input: Omit<GlobalGraphRelationship, "id">) => void,
  sourceId: string,
  targetId: string,
  type: GlobalRelationshipType,
  weight: number,
  confidence: number,
  explanation: string,
  source: GlobalGraphRelationship["source"],
) {
  add({
    sourceId,
    targetId,
    type,
    weight: clamp(weight),
    confidence: clamp(confidence),
    explanation,
    source,
  });
}

function fragranceSimilarity(a: FragranceRecord, b: FragranceRecord) {
  const dimensions = Object.keys(a.dna) as Array<keyof typeof a.dna>;
  const distance = dimensions.reduce((sum, key) => sum + Math.abs(a.dna[key] - b.dna[key]), 0) / dimensions.length;
  const dnaScore = 100 - distance;
  const roleUnion = new Set([...a.roles, ...b.roles]);
  const sharedRoles = a.roles.filter((role) => b.roles.includes(role)).length;
  const roleScore = roleUnion.size ? (sharedRoles / roleUnion.size) * 100 : 0;
  const familyScore = a.family === b.family ? 100 : 35;
  return clamp(dnaScore * 0.68 + roleScore * 0.2 + familyScore * 0.12);
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

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
