import type { FragranceRecord } from "@/lib/domain/fragrance";

export interface CalculatedFragranceRelationship {
  targetFragranceId: string;
  relationship:
    | "similar-dna"
    | "same-family"
    | "shared-notes"
    | "shared-accords"
    | "same-perfumer"
    | "same-brand";
  strength: number;
  confidence: number;
  explanation: string;
  evidence: string[];
}

function stringSet(values: unknown) {
  return new Set(
    Array.isArray(values)
      ? values.map(String)
      : [],
  );
}

function noteSet(fragrance: FragranceRecord) {
  return new Set(
    Object.values(fragrance.notes ?? {}).flatMap(
      (notes) => Array.isArray(notes) ? notes.map(String) : [],
    ),
  );
}

export function calculateFragranceRelationships(
  source: FragranceRecord,
  catalog: FragranceRecord[],
) {
  const output: CalculatedFragranceRelationship[] = [];

  for (const target of catalog) {
    if (target.id === source.id) continue;

    const sourceAccords = stringSet(source.accords);
    const targetAccords = stringSet(target.accords);
    const sharedAccords = [...sourceAccords].filter(
      (value) => targetAccords.has(value),
    );

    const sourceNotes = noteSet(source);
    const targetNotes = noteSet(target);
    const sharedNotes = [...sourceNotes].filter(
      (value) => targetNotes.has(value),
    );

    const sourcePerfumers = stringSet(source.perfumers);
    const targetPerfumers = stringSet(target.perfumers);
    const sharedPerfumers = [...sourcePerfumers].filter(
      (value) => targetPerfumers.has(value),
    );

    const sourceDna = (source.dna ?? {}) as Record<string, number>;
    const targetDna = (target.dna ?? {}) as Record<string, number>;
    const keys = [...new Set([
      ...Object.keys(sourceDna),
      ...Object.keys(targetDna),
    ])];
    const averageDistance = keys.length
      ? keys.reduce(
          (sum, key) =>
            sum + Math.abs(
              Number(sourceDna[key] ?? 0) -
              Number(targetDna[key] ?? 0),
            ),
          0,
        ) / keys.length
      : 100;
    const similarity = Math.max(
      0,
      Math.round(100 - averageDistance),
    );

    if (similarity >= 72) {
      output.push({
        targetFragranceId: target.id,
        relationship: "similar-dna",
        strength: similarity,
        confidence: Math.min(94, 70 + sharedAccords.length * 3),
        explanation:
          `${target.name} has a ${similarity}% calculated DNA similarity to ${source.name}.`,
        evidence: [
          `${sharedAccords.length} shared accord(s)`,
          `${sharedNotes.length} shared note(s)`,
        ],
      });
    }

    if (source.family && target.family === source.family) {
      output.push({
        targetFragranceId: target.id,
        relationship: "same-family",
        strength: 86,
        confidence: 90,
        explanation:
          `${source.name} and ${target.name} share the ${source.family} family.`,
        evidence: [`Family: ${source.family}`],
      });
    }

    if (sharedAccords.length >= 2) {
      output.push({
        targetFragranceId: target.id,
        relationship: "shared-accords",
        strength: Math.min(94, 55 + sharedAccords.length * 8),
        confidence: 84,
        explanation:
          `${source.name} and ${target.name} share ${sharedAccords.length} accords.`,
        evidence: sharedAccords,
      });
    }

    if (sharedNotes.length >= 2) {
      output.push({
        targetFragranceId: target.id,
        relationship: "shared-notes",
        strength: Math.min(92, 50 + sharedNotes.length * 7),
        confidence: 82,
        explanation:
          `${source.name} and ${target.name} share ${sharedNotes.length} listed notes.`,
        evidence: sharedNotes,
      });
    }

    if (sharedPerfumers.length) {
      output.push({
        targetFragranceId: target.id,
        relationship: "same-perfumer",
        strength: 88,
        confidence: 92,
        explanation:
          `${source.name} and ${target.name} share perfumer credit.`,
        evidence: sharedPerfumers,
      });
    }

    if (source.brand === target.brand) {
      output.push({
        targetFragranceId: target.id,
        relationship: "same-brand",
        strength: 82,
        confidence: 98,
        explanation:
          `${source.name} and ${target.name} are both released by ${source.brand}.`,
        evidence: [source.brand],
      });
    }
  }

  return output
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 36);
}
