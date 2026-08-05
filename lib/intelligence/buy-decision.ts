import type { CollectionItem, CollectorProfile } from "@/lib/domain/collection";
import type { BuyDecision, DecisionEvidence } from "@/lib/domain/decision";
import { roles, type DnaDimension, type FragranceRecord } from "@/lib/domain/fragrance";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";

const dnaKeys: DnaDimension[] = ["fresh", "green", "woody", "amber", "sweet", "dark", "artistic", "formal"];
const clamp = (value: number) => Math.max(0, Math.min(100, value));
const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;

function similarity(a: FragranceRecord, b: FragranceRecord) {
  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (const key of dnaKeys) {
    dot += a.dna[key] * b.dna[key];
    magnitudeA += a.dna[key] ** 2;
    magnitudeB += b.dna[key] ** 2;
  }
  const dnaSimilarity = dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB) || 1);
  const sharedRoles = a.roles.filter((role) => b.roles.includes(role)).length;
  const roleUnion = new Set([...a.roles, ...b.roles]).size;
  return dnaSimilarity * 0.65 + (sharedRoles / Math.max(1, roleUnion)) * 0.35;
}

function climateFit(candidate: FragranceRecord, profile: CollectorProfile) {
  if (profile.climate === "hot-humid") return Math.round(average([candidate.seasons.spring, candidate.seasons.summer, candidate.dna.fresh, 100 - candidate.dna.dark]));
  if (profile.climate === "hot-dry") return Math.round(average([candidate.seasons.spring, candidate.seasons.summer, candidate.dna.woody, 100 - candidate.dna.sweet]));
  if (profile.climate === "cold") return Math.round(average([candidate.seasons.fall, candidate.seasons.winter, candidate.dna.amber, candidate.dna.dark]));
  return Math.round(average(Object.values(candidate.seasons)));
}

export function analyzeBuyDecision(input: {
  candidateFragranceId: string;
  collection: CollectionItem[];
  profile: CollectorProfile;
  catalog: FragranceRecord[];
  price?: number;
}): BuyDecision {
  const candidate = input.catalog.find((fragrance) => fragrance.id === input.candidateFragranceId);
  if (!candidate) throw new Error(`Unknown fragrance: ${input.candidateFragranceId}`);
  if (input.collection.some((item) => item.fragranceId === candidate.id)) throw new Error("Candidate is already owned");

  const owned = input.collection
    .map((item) => input.catalog.find((fragrance) => fragrance.id === item.fragranceId))
    .filter((fragrance): fragrance is FragranceRecord => Boolean(fragrance));

  const currentHealth = analyzeCollectionHealth({ collection: input.collection, profile: input.profile, catalog: input.catalog });
  const simulatedCollection = [...input.collection, { fragranceId: candidate.id, wearCount: 0, daysSinceLastWear: 0 }];
  const projectedHealth = analyzeCollectionHealth({ collection: simulatedCollection, profile: input.profile, catalog: input.catalog });
  const healthDelta = projectedHealth.score - currentHealth.score;

  const overlaps = owned
    .map((fragrance) => ({ fragrance, similarity: similarity(candidate, fragrance) }))
    .sort((a, b) => b.similarity - a.similarity);
  const closest = overlaps[0];
  const overlapScore = Math.round((closest?.similarity ?? 0) * 100);
  const redundancySafety = clamp(100 - overlapScore);

  const currentRoles = new Set(owned.flatMap((fragrance) => fragrance.roles));
  const newRoles = candidate.roles.filter((role) => !currentRoles.has(role));
  const roleContribution = clamp(newRoles.length * 24 + candidate.roles.filter((role) => currentRoles.has(role)).length * 5);
  const environmentFit = climateFit(candidate, input.profile);
  const qualitySignal = Math.round(average([candidate.performance.longevity, candidate.performance.projection, candidate.dna.artistic, candidate.dna.formal]));
  const intelligenceReadiness = candidate.intelligenceStatus === "validated" ? 100 : candidate.intelligenceStatus === "calibration" ? 90 : 55;
  const priceRisk = input.price && input.price > 500 ? 75 : input.price && input.price > 300 ? 52 : input.price && input.price > 180 ? 32 : 18;

  const score = Math.round(clamp(
    environmentFit * 0.24 +
    roleContribution * 0.20 +
    redundancySafety * 0.22 +
    qualitySignal * 0.14 +
    clamp(50 + healthDelta * 12) * 0.15 +
    intelligenceReadiness * 0.05,
  ));

  const risk = Math.round(clamp(
    overlapScore * 0.38 +
    priceRisk * 0.24 +
    (100 - environmentFit) * 0.16 +
    (100 - intelligenceReadiness) * 0.22,
  ));

  const verdict = score >= 78 && risk <= 42 ? "buy" : score >= 62 && risk <= 65 ? "sample" : "skip";
  const evidence: DecisionEvidence[] = [
    { key: "collection-impact", label: "Collection impact", value: clamp(50 + healthDelta * 12), interpretation: healthDelta > 0 ? `Projected health improves by ${healthDelta} point${healthDelta === 1 ? "" : "s"}.` : "The candidate does not materially improve Collection Health.", direction: healthDelta > 1 ? "positive" : healthDelta < 0 ? "negative" : "neutral" },
    { key: "redundancy", label: "Redundancy safety", value: redundancySafety, interpretation: overlapScore < 65 ? "Low functional overlap with the current collection." : overlapScore < 80 ? "Moderate overlap requires comparison before buying." : "High overlap limits strategic value.", direction: overlapScore < 65 ? "positive" : overlapScore < 80 ? "neutral" : "negative" },
    { key: "climate", label: "Climate fit", value: environmentFit, interpretation: `Suitability for your ${input.profile.climate.replace("-", " ")} climate.`, direction: environmentFit >= 75 ? "positive" : environmentFit >= 58 ? "neutral" : "negative" },
    { key: "roles", label: "Role contribution", value: roleContribution, interpretation: newRoles.length ? `Adds ${newRoles.join(", ")} coverage.` : "Strengthens roles that are already represented.", direction: newRoles.length ? "positive" : "neutral" },
    { key: "quality", label: "Fragrance signal", value: qualitySignal, interpretation: "Combined performance, artistry, and formality signal.", direction: qualitySignal >= 75 ? "positive" : "neutral" },
  ];

  const strongestEvidence = [...evidence].sort((a, b) => b.value - a.value)[0];
  const confidence = Math.round(clamp(72 + owned.length * 2 + intelligenceReadiness * 0.08));

  return {
    analysisType: "buy_decision",
    candidateFragranceId: candidate.id,
    verdict,
    score,
    risk,
    confidence,
    summary: verdict === "buy"
      ? `${candidate.name} is a strategically strong addition with manageable risk.`
      : verdict === "sample"
        ? `${candidate.name} shows potential, but sampling is the smarter next step.`
        : `${candidate.name} adds too little new value for the current risk and overlap.`,
    evidence,
    projectedImpact: {
      currentHealth: currentHealth.score,
      projectedHealth: projectedHealth.score,
      healthDelta,
      newRoles,
      strongestImprovement: strongestEvidence.interpretation,
    },
    closestOverlap: closest ? { fragranceId: closest.fragrance.id, fragranceName: closest.fragrance.name, similarity: overlapScore } : undefined,
    modelVersion: "BDE-1.0.0",
  };
}
