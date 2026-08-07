import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import type { MemoryEvent } from "@/lib/memory/types";
import { buildPredictiveSnapshot } from "@/lib/predictive/prediction-engine";
import type { PredictiveSimulatorResult, ProjectionHorizon } from "@/lib/predictive/simulator-types";

export function simulatePredictiveAddition({
  fragranceId,
  horizonDays,
  collection,
  catalog,
  events,
  currentHealth,
}: {
  fragranceId: string;
  horizonDays: ProjectionHorizon;
  collection: CollectionItem[];
  catalog: FragranceRecord[];
  events: MemoryEvent[];
  currentHealth: number;
}): PredictiveSimulatorResult | null {
  const fragrance = catalog.find((item) => item.id === fragranceId);
  if (!fragrance) return null;

  const simulatedCollection = collection.some((item) => item.fragranceId === fragranceId)
    ? collection
    : [
        ...collection,
        {
          fragranceId,
          addedAt: new Date().toISOString(),
          wearCount: 0,
          daysSinceLastWear: 0,
          favorite: false,
        } satisfies CollectionItem,
      ];

  const predictive = buildPredictiveSnapshot({
    collection: simulatedCollection,
    catalog,
    events,
  });

  const familyAffinity =
    predictive.familyAffinities.find(
      (item) => item.id === fragrance.family.toLowerCase(),
    )?.score ?? 35;

  const accordScores = (fragrance.accords ?? []).map(
    (accord) =>
      predictive.accordAffinities.find(
        (item) => item.id === accord.toLowerCase(),
      )?.score ?? 25,
  );
  const accordAffinity = average(accordScores);

  const overlap = calculateOverlap(fragrance, collection, catalog);
  const roleNovelty = calculateRoleNovelty(fragrance, collection, catalog);
  const diversityNovelty = calculateDiversityNovelty(fragrance, collection, catalog);

  const driftSignals = predictive.tasteDrift.filter((item) => item.direction !== "stable");
  const driftFit = driftSignals.length
    ? average(
        driftSignals.map((signal) =>
          signal.direction === "rising"
            ? fragrance.dna[signal.dimension]
            : 100 - fragrance.dna[signal.dimension],
        ),
      )
    : 50;

  const performance = average([
    fragrance.performance.projection,
    fragrance.performance.longevity,
    fragrance.performance.consistency ?? 70,
  ]);

  const wearFit = clamp(
    familyAffinity * 0.28 +
      accordAffinity * 0.22 +
      roleNovelty * 0.14 +
      diversityNovelty * 0.12 +
      driftFit * 0.14 +
      performance * 0.10,
  );

  const horizonFactor = horizonDays / 365;
  const estimatedWearsPerMonth = round1(
    Math.max(0.2, 0.6 + wearFit / 32 - overlap / 80),
  );
  const signaturePotential = clamp(
    wearFit * 0.48 +
      familyAffinity * 0.18 +
      accordAffinity * 0.14 +
      (100 - overlap) * 0.20,
  );
  const neglectRisk = clamp(
    overlap * 0.52 +
      (100 - wearFit) * 0.30 +
      (100 - roleNovelty) * 0.10 +
      horizonFactor * 12,
  );
  const retentionProbability = clamp(
    100 - neglectRisk * 0.72 + signaturePotential * 0.18,
  );
  const immediateHealth = clamp(
    currentHealth +
      roleNovelty * 0.035 +
      diversityNovelty * 0.03 -
      overlap * 0.045,
  );

  const projectedCenter = clamp(
    immediateHealth -
      neglectRisk * horizonFactor * 0.06 +
      retentionProbability * horizonFactor * 0.025,
  );

  const evidenceCount =
    predictive.evidenceEvents +
    (predictive.familyAffinities.find(
      (item) => item.id === fragrance.family.toLowerCase(),
    )?.evidenceCount ?? 0);

  const confidence = clamp(
    42 + Math.sqrt(Math.max(0, evidenceCount)) * 13,
  );
  const uncertainty = Math.max(
    3,
    Math.round(14 - confidence / 10 + horizonFactor * 5),
  );

  const metrics = {
    currentHealth: clamp(currentHealth),
    immediateHealth,
    projectedHealthLow: clamp(projectedCenter - uncertainty),
    projectedHealthHigh: clamp(projectedCenter + uncertainty),
    redundancyDelta: Math.round(overlap / 10),
    diversityDelta: Math.round(diversityNovelty / 14),
    roleCoverageDelta: Math.round(roleNovelty / 16),
    estimatedWearsPerMonth,
    signaturePotential,
    neglectRisk,
    retentionProbability,
    confidence,
  };

  const verdict =
    overlap >= 78 && neglectRisk >= 60
      ? "HIGH REDUNDANCY RISK"
      : confidence < 52
        ? "UNCERTAIN OUTCOME"
        : signaturePotential >= 78 &&
            retentionProbability >= 78 &&
            neglectRisk <= 35
          ? "STRONG LONG-TERM FIT"
          : neglectRisk >= 65 || retentionProbability < 45
            ? "LIKELY TEMPORARY EXCITEMENT"
            : "PROMISING ADDITION";

  return {
    fragranceId,
    fragranceName: fragrance.name,
    brand: fragrance.brand,
    horizonDays,
    metrics,
    verdict,
    summary: `${fragrance.name}: ${verdict.toLowerCase()}. Projected Collection Health ${metrics.projectedHealthLow}–${metrics.projectedHealthHigh}, ${signaturePotential}% signature potential, ${neglectRisk}% neglect risk.`,
    evidence: [
      {
        kind: "verified",
        label: "Collection state",
        detail: `${collection.length} owned fragrances evaluated before this simulated addition.`,
      },
      {
        kind: predictive.familyAffinities.length ? "calculated" : "estimated",
        label: "Preference fit",
        detail: `${fragrance.family} family fit ${familyAffinity}/100; accord fit ${Math.round(accordAffinity)}/100.`,
      },
      {
        kind: "calculated",
        label: "Collection overlap",
        detail: `${Math.round(overlap)}/100 similarity pressure against the active collection.`,
      },
      {
        kind: predictive.tasteDrift.length ? "calculated" : "unavailable",
        label: "Taste drift",
        detail: predictive.tasteDrift.length
          ? `${Math.round(driftFit)}/100 alignment with detected preference drift.`
          : "Not enough longitudinal wear evidence to apply taste-drift adjustment.",
      },
      {
        kind: confidence >= 70 ? "calculated" : "estimated",
        label: "Projection confidence",
        detail: `${confidence}% confidence. Longer horizons widen the forecast range.`,
      },
    ],
  };
}

function calculateOverlap(
  candidate: FragranceRecord,
  collection: CollectionItem[],
  catalog: FragranceRecord[],
) {
  const scores = collection
    .map((item) => catalog.find((f) => f.id === item.fragranceId))
    .filter((f): f is FragranceRecord => Boolean(f))
    .map((owned) => {
      const family = owned.family === candidate.family ? 38 : 0;
      const ownedAccords = new Set(
        (owned.accords ?? []).map((value) => value.toLowerCase()),
      );
      const candidateAccords = candidate.accords ?? [];
      const shared = candidateAccords.filter((value) =>
        ownedAccords.has(value.toLowerCase()),
      ).length;
      const accord = candidateAccords.length
        ? (shared / candidateAccords.length) * 34
        : 0;
      const dna = average(
        Object.keys(candidate.dna).map((key) =>
          100 -
          Math.abs(
            candidate.dna[key as keyof typeof candidate.dna] -
              owned.dna[key as keyof typeof owned.dna],
          ),
        ),
      ) * 0.28;
      return clamp(family + accord + dna);
    });

  return scores.length ? Math.max(...scores) : 0;
}

function calculateRoleNovelty(
  candidate: FragranceRecord,
  collection: CollectionItem[],
  catalog: FragranceRecord[],
) {
  const existing = new Set(
    collection.flatMap(
      (item) =>
        catalog.find((f) => f.id === item.fragranceId)?.roles ?? [],
    ),
  );
  const roles = candidate.roles ?? [];
  if (!roles.length) return 50;
  return clamp(
    (roles.filter((role) => !existing.has(role)).length / roles.length) * 100,
  );
}

function calculateDiversityNovelty(
  candidate: FragranceRecord,
  collection: CollectionItem[],
  catalog: FragranceRecord[],
) {
  const sameFamily = collection.filter(
    (item) =>
      catalog.find((f) => f.id === item.fragranceId)?.family ===
      candidate.family,
  ).length;
  return sameFamily === 0 ? 100 : clamp(65 - sameFamily * 12);
}

function average(values: number[]) {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return 0;
  return finite.reduce((sum, value) => sum + value, 0) / finite.length;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number) {
  return Math.max(
    0,
    Math.min(100, Math.round(Number.isFinite(value) ? value : 0)),
  );
}
