import type {
  CollectionItem,
  CollectorProfile,
} from "@/lib/domain/collection";
import {
  roles,
  type DnaDimension,
  type FragranceRecord,
  type FragranceRole,
} from "@/lib/domain/fragrance";
import type {
  CollectionEvolutionOutput,
  EvolutionDelta,
  EvolutionMilestone,
  EvolutionSnapshot,
  PurchaseImpactAnalysis,
} from "@/lib/evolution/types";
import { analyzeCollectionHealth } from "@/lib/intelligence/collection-health";

const dnaDimensions: DnaDimension[] = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
];

export function createEvolutionSnapshot({
  collection,
  catalog,
  profile,
  source = "automatic",
  captureReason,
  createdAt = new Date().toISOString(),
}: {
  collection: CollectionItem[];
  catalog: FragranceRecord[];
  profile: CollectorProfile;
  source?: EvolutionSnapshot["source"];
  captureReason?: EvolutionSnapshot["captureReason"];
  createdAt?: string;
}): EvolutionSnapshot {
  const owned = collection
    .map((item) => ({
      item,
      fragrance: catalog.find(
        (candidate) =>
          candidate.id ===
          item.fragranceId,
      ),
    }))
    .filter(
      (
        entry,
      ): entry is {
        item: CollectionItem;
        fragrance: FragranceRecord;
      } => Boolean(entry.fragrance),
    );

  const health =
    analyzeCollectionHealth({
      collection,
      catalog,
      profile,
    });

  const dna = Object.fromEntries(
    dnaDimensions.map(
      (dimension) => [
        dimension,
        Math.round(
          weightedAverage(
            owned.map((entry) => ({
              value:
                entry.fragrance.dna[
                  dimension
                ],
              weight:
                1 +
                entry.item.wearCount +
                (entry.item.favorite
                  ? 2
                  : 0),
            })),
          ),
        ),
      ],
    ),
  ) as Record<DnaDimension, number>;

  const roleDistribution =
    Object.fromEntries(
      roles.map((role) => [
        role,
        Math.round(
          percentage(
            owned.filter((entry) =>
              entry.fragrance.roles.includes(
                role,
              ),
            ).length,
            owned.length,
          ),
        ),
      ]),
    ) as Record<FragranceRole, number>;

  const brands = countBy(
    owned.map(
      (entry) =>
        entry.fragrance.brand,
    ),
  );

  const families = countBy(
    owned.map(
      (entry) =>
        entry.fragrance.family,
    ),
  );

  return {
    id: `evolution-${createdAt}-${hashIds(
      owned.map(
        (entry) =>
          entry.fragrance.id,
      ),
    )}`,
    createdAt,
    source,
    captureReason:
      captureReason ??
      defaultCaptureReason(source),
    collectionSize: owned.length,
    totalWears: owned.reduce(
      (sum, entry) =>
        sum + entry.item.wearCount,
      0,
    ),
    collectionHealth: health.score,
    roleCoverage:
      health.dimensions.roleCoverage,
    seasonalBalance:
      health.dimensions.seasonalBalance,
    diversity:
      health.dimensions.diversity,
    redundancy:
      health.dimensions.redundancy,
    rotation:
      health.dimensions.rotation,
    identity:
      health.dimensions.identity,
    dna,
    roles: roleDistribution,
    brands,
    families,
    ownedFragranceIds: owned.map(
      (entry) =>
        entry.fragrance.id,
    ),
  };
}

export function analyzeCollectionEvolution({
  snapshots,
}: {
  snapshots: EvolutionSnapshot[];
}): CollectionEvolutionOutput {
  const ordered = [...snapshots].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime(),
  );

  const first = ordered[0] ?? null;
  const latest =
    ordered.at(-1) ?? null;

  if (!first || !latest) {
    return {
      modelVersion: "CEE-1.0.0",
      generatedAt:
        new Date().toISOString(),
      snapshotCount: ordered.length,
      firstSnapshot: first,
      latestSnapshot: latest,
      healthChange: 0,
      diversityChange: 0,
      rotationChange: 0,
      roleCoverageChange: 0,
      strongestRisingDna: null,
      strongestFallingDna: null,
      dominantBrandShift: {},
      dominantFamilyShift: {},
      milestones: buildMilestones(
        ordered,
      ),
      briefing:
        "OLFACTUS needs at least two collection snapshots before it can describe evolution.",
      metricDeltas: [],
    };
  }

  const dnaChanges =
    dnaDimensions.map(
      (dimension) => ({
        dimension,
        change:
          latest.dna[dimension] -
          first.dna[dimension],
      }),
    );

  const strongestRisingDna =
    [...dnaChanges].sort(
      (a, b) =>
        b.change - a.change,
    )[0] ?? null;

  const strongestFallingDna =
    [...dnaChanges].sort(
      (a, b) =>
        a.change - b.change,
    )[0] ?? null;

  const metricDeltas = [
    delta(
      "Collection Health",
      first.collectionHealth,
      latest.collectionHealth,
    ),
    delta(
      "Diversity",
      first.diversity,
      latest.diversity,
    ),
    delta(
      "Rotation",
      first.rotation,
      latest.rotation,
    ),
    delta(
      "Role Coverage",
      first.roleCoverage,
      latest.roleCoverage,
    ),
    delta(
      "Seasonal Balance",
      first.seasonalBalance,
      latest.seasonalBalance,
    ),
    delta(
      "Redundancy",
      first.redundancy,
      latest.redundancy,
    ),
  ];

  const dominantBrandShift = {
    before:
      dominantKey(first.brands),
    after:
      dominantKey(latest.brands),
  };

  const dominantFamilyShift = {
    before:
      dominantKey(first.families),
    after:
      dominantKey(latest.families),
  };

  return {
    modelVersion: "CEE-1.0.0",
    generatedAt:
      new Date().toISOString(),
    snapshotCount: ordered.length,
    firstSnapshot: first,
    latestSnapshot: latest,
    healthChange:
      latest.collectionHealth -
      first.collectionHealth,
    diversityChange:
      latest.diversity -
      first.diversity,
    rotationChange:
      latest.rotation -
      first.rotation,
    roleCoverageChange:
      latest.roleCoverage -
      first.roleCoverage,
    strongestRisingDna:
      strongestRisingDna &&
      strongestRisingDna.change > 0
        ? strongestRisingDna
        : null,
    strongestFallingDna:
      strongestFallingDna &&
      strongestFallingDna.change < 0
        ? strongestFallingDna
        : null,
    dominantBrandShift,
    dominantFamilyShift,
    milestones: buildMilestones(
      ordered,
    ),
    briefing: buildBriefing({
      first,
      latest,
      strongestRisingDna,
      strongestFallingDna,
      dominantBrandShift,
      dominantFamilyShift,
    }),
    metricDeltas,
  };
}

export function compareEvolutionSnapshots(
  before: EvolutionSnapshot,
  after: EvolutionSnapshot,
) {
  return {
    collectionSize:
      after.collectionSize -
      before.collectionSize,
    totalWears:
      after.totalWears -
      before.totalWears,
    health:
      after.collectionHealth -
      before.collectionHealth,
    diversity:
      after.diversity -
      before.diversity,
    redundancy:
      after.redundancy -
      before.redundancy,
    rotation:
      after.rotation -
      before.rotation,
    roleCoverage:
      after.roleCoverage -
      before.roleCoverage,
    dna: Object.fromEntries(
      dnaDimensions.map(
        (dimension) => [
          dimension,
          after.dna[dimension] -
            before.dna[dimension],
        ],
      ),
    ) as Record<DnaDimension, number>,
  };
}

export function analyzePurchaseImpact({
  before,
  after,
  fragrance,
}: {
  before: EvolutionSnapshot;
  after: EvolutionSnapshot;
  fragrance: FragranceRecord;
}): PurchaseImpactAnalysis {
  const dnaChanges =
    dnaDimensions.map(
      (dimension) => ({
        dimension,
        change:
          after.dna[dimension] -
          before.dna[dimension],
      }),
    );

  const strongestDnaChange =
    [...dnaChanges].sort(
      (a, b) =>
        Math.abs(b.change) -
        Math.abs(a.change),
    )[0];

  const addedRoles =
    roles.filter(
      (role) =>
        after.roles[role] >
        before.roles[role],
    );

  return {
    fragranceId: fragrance.id,
    beforeSnapshotId: before.id,
    afterSnapshotId: after.id,
    collectionHealthChange:
      after.collectionHealth -
      before.collectionHealth,
    diversityChange:
      after.diversity -
      before.diversity,
    redundancyChange:
      after.redundancy -
      before.redundancy,
    roleCoverageChange:
      after.roleCoverage -
      before.roleCoverage,
    strongestDnaChange,
    addedRoles,
    addedBrand:
      !before.brands[fragrance.brand] &&
      after.brands[fragrance.brand]
        ? fragrance.brand
        : undefined,
    addedFamily:
      !before.families[
        fragrance.family
      ] &&
      after.families[
        fragrance.family
      ]
        ? fragrance.family
        : undefined,
    summary: `${fragrance.name} changed Collection Health by ${signed(
      after.collectionHealth -
        before.collectionHealth,
    )}, Diversity by ${signed(
      after.diversity -
        before.diversity,
    )}, and Role Coverage by ${signed(
      after.roleCoverage -
        before.roleCoverage,
    )}. Its strongest DNA effect was ${capitalize(
      strongestDnaChange.dimension,
    )} ${signed(
      strongestDnaChange.change,
    )}.`,
  };
}

function buildMilestones(
  snapshots: EvolutionSnapshot[],
): EvolutionMilestone[] {
  const latest =
    snapshots.at(-1);
  const first =
    snapshots[0];

  const firstNicheSnapshot =
    snapshots.find(
      (snapshot) =>
        Object.keys(
          snapshot.brands,
        ).length >= 2,
    );

  const health90Snapshot =
    snapshots.find(
      (snapshot) =>
        snapshot.collectionHealth >= 90,
    );

  const redundancy80Snapshot =
    snapshots.find(
      (snapshot) =>
        snapshot.redundancy >= 80,
    );

  const diversity80Snapshot =
    snapshots.find(
      (snapshot) =>
        snapshot.diversity >= 80,
    );

  return [
    milestone(
      "evolution-started",
      "Evolution Tracking Activated",
      "OLFACTUS recorded the first longitudinal collection snapshot.",
      snapshots.length > 0,
      Math.min(
        100,
        snapshots.length * 100,
      ),
      first?.createdAt,
    ),
    milestone(
      "three-snapshots",
      "Meaningful Trend History",
      "Three collection snapshots are available for longitudinal analysis.",
      snapshots.length >= 3,
      Math.min(
        100,
        Math.round(
          (snapshots.length / 3) *
            100,
        ),
      ),
      snapshots[2]?.createdAt,
    ),
    milestone(
      "brand-expansion",
      "Brand Universe Expanded",
      "The collection developed meaningful multi-brand breadth.",
      Boolean(firstNicheSnapshot),
      latest
        ? Math.min(
            100,
            Object.keys(
              latest.brands,
            ).length * 25,
          )
        : 0,
      firstNicheSnapshot?.createdAt,
    ),
    milestone(
      "health-90",
      "A-Grade Collection Health",
      "Collection Health reached 90 or higher.",
      Boolean(health90Snapshot),
      Math.min(
        100,
        Math.round(
          ((latest?.collectionHealth ??
            0) /
            90) *
            100,
        ),
      ),
      health90Snapshot?.createdAt,
    ),
    milestone(
      "redundancy-control",
      "Redundancy Under Control",
      "The anti-redundancy score reached 80 or higher.",
      Boolean(redundancy80Snapshot),
      Math.min(
        100,
        Math.round(
          ((latest?.redundancy ??
            0) /
            80) *
            100,
        ),
      ),
      redundancy80Snapshot?.createdAt,
    ),
    milestone(
      "diversity-80",
      "High DNA Diversity",
      "Collection Diversity reached 80 or higher.",
      Boolean(diversity80Snapshot),
      Math.min(
        100,
        Math.round(
          ((latest?.diversity ??
            0) /
            80) *
            100,
        ),
      ),
      diversity80Snapshot?.createdAt,
    ),
  ];
}

function buildBriefing({
  first,
  latest,
  strongestRisingDna,
  strongestFallingDna,
  dominantBrandShift,
  dominantFamilyShift,
}: {
  first: EvolutionSnapshot;
  latest: EvolutionSnapshot;
  strongestRisingDna: {
    dimension: DnaDimension;
    change: number;
  };
  strongestFallingDna: {
    dimension: DnaDimension;
    change: number;
  };
  dominantBrandShift: {
    before?: string;
    after?: string;
  };
  dominantFamilyShift: {
    before?: string;
    after?: string;
  };
}) {
  const healthChange =
    latest.collectionHealth -
    first.collectionHealth;

  return `Across ${latest.collectionSize - first.collectionSize >= 0 ? "an expanding" : "a contracting"} collection, Collection Health changed by ${signed(
    healthChange,
  )}. ${capitalize(
    strongestRisingDna.dimension,
  )} is the strongest rising DNA dimension at ${signed(
    strongestRisingDna.change,
  )}, while ${capitalize(
    strongestFallingDna.dimension,
  )} changed by ${signed(
    strongestFallingDna.change,
  )}. The dominant brand shifted from ${dominantBrandShift.before ?? "none"} to ${dominantBrandShift.after ?? "none"}, and the dominant family shifted from ${dominantFamilyShift.before ?? "none"} to ${dominantFamilyShift.after ?? "none"}.`;
}

function delta(
  metric: string,
  before: number,
  after: number,
): EvolutionDelta {
  const change =
    after - before;

  return {
    metric,
    before,
    after,
    change,
    direction:
      change > 0
        ? "up"
        : change < 0
          ? "down"
          : "unchanged",
  };
}

function milestone(
  id: string,
  title: string,
  description: string,
  achieved: boolean,
  progress: number,
  achievedAt?: string,
): EvolutionMilestone {
  return {
    id,
    title,
    description,
    achieved,
    achievedAt:
      achieved
        ? achievedAt
        : undefined,
    progress:
      Math.max(
        0,
        Math.min(100, progress),
      ),
  };
}

function defaultCaptureReason(
  source: EvolutionSnapshot["source"],
): EvolutionSnapshot["captureReason"] {
  if (source === "baseline") {
    return "tracking-started";
  }
  if (source === "manual") {
    return "manual-capture";
  }
  if (source === "purchase") {
    return "purchase-impact";
  }
  return "collection-changed";
}

function weightedAverage(
  values: Array<{
    value: number;
    weight: number;
  }>,
) {
  const totalWeight =
    values.reduce(
      (sum, item) =>
        sum + item.weight,
      0,
    );

  if (!totalWeight) return 0;

  return values.reduce(
    (sum, item) =>
      sum +
      item.value * item.weight,
    0,
  ) / totalWeight;
}

function percentage(
  value: number,
  total: number,
) {
  if (!total) return 0;
  return (value / total) * 100;
}

function countBy(
  values: string[],
) {
  return values.reduce<
    Record<string, number>
  >((result, value) => {
    result[value] =
      (result[value] ?? 0) + 1;
    return result;
  }, {});
}

function dominantKey(
  values: Record<string, number>,
) {
  return Object.entries(values).sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0]),
  )[0]?.[0];
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function hashIds(ids: string[]) {
  return [...ids]
    .sort()
    .join("-")
    .split("")
    .reduce(
      (hash, character) =>
        ((hash << 5) - hash +
          character.charCodeAt(0)) |
        0,
      0,
    )
    .toString(36);
}
