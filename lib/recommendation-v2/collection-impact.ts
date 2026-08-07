import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

export interface CollectionImpactPreview {
  healthDelta: number;
  diversityDelta: number;
  redundancyDelta: number;
  roleCoverageDelta: number;
  projectedRotation:
    | "improves"
    | "stable"
    | "declines";
  explanation: string[];
}

export function calculateCollectionImpactPreview({
  candidate,
  collection,
  catalog,
}: {
  candidate: FragranceRecord;
  collection: CollectionItem[];
  catalog: FragranceRecord[];
}): CollectionImpactPreview {
  const byId =
    new Map(
      catalog.map(
        (item) => [
          item.id,
          item,
        ],
      ),
    );

  const owned =
    collection
      .map(
        (item) =>
          byId.get(
            item.fragranceId,
          ),
      )
      .filter(
        (
          item,
        ): item is FragranceRecord =>
          Boolean(item),
      );

  const ownedRoles =
    new Set(
      owned.flatMap(
        (item) =>
          item.roles,
      ),
    );

  const newRoles =
    candidate.roles.filter(
      (role) =>
        !ownedRoles.has(
          role,
        ),
    );

  const similarity =
    highestSimilarity(
      candidate,
      owned,
    );

  const diversityDelta =
    Math.max(
      -6,
      Math.min(
        8,
        Math.round(
          (100 - similarity) /
            12 +
          newRoles.length *
            2,
        ),
      ),
    );

  const redundancyDelta =
    similarity >= 85
      ? 6
      : similarity >= 75
        ? 3
        : similarity >= 65
          ? 0
          : -3;

  const roleCoverageDelta =
    newRoles.length;

  const healthDelta =
    Math.max(
      -8,
      Math.min(
        10,
        diversityDelta +
          roleCoverageDelta * 2 -
          Math.max(
            0,
            redundancyDelta,
          ),
      ),
    );

  const projectedRotation =
    healthDelta >= 4
      ? "improves"
      : healthDelta <= -2
        ? "declines"
        : "stable";

  const explanation = [
    newRoles.length
      ? `Adds ${newRoles.join(", ")} role coverage.`
      : "Adds no major new collection role.",
    similarity
      ? `Closest collection-space similarity is approximately ${similarity}%.`
      : "No owned-fragrance similarity could be calculated.",
    projectedRotation ===
      "improves"
      ? "Expected to improve rotation utility."
      : projectedRotation ===
          "declines"
        ? "Expected to increase redundancy pressure."
        : "Expected to leave rotation broadly stable.",
  ];

  return {
    healthDelta,
    diversityDelta,
    redundancyDelta,
    roleCoverageDelta,
    projectedRotation,
    explanation,
  };
}

function highestSimilarity(
  candidate:
    FragranceRecord,
  owned:
    FragranceRecord[],
) {
  if (!owned.length) {
    return 0;
  }

  let highest = 0;

  for (
    const fragrance
    of owned
  ) {
    const dimensions =
      Object.keys(
        candidate.dna,
      ) as Array<
        keyof typeof candidate.dna
      >;

    const distance =
      dimensions.reduce(
        (
          sum,
          key,
        ) =>
          sum +
          Math.abs(
            candidate.dna[key] -
              fragrance.dna[key],
          ),
        0,
      ) /
      Math.max(
        1,
        dimensions.length,
      );

    highest =
      Math.max(
        highest,
        Math.round(
          100 - distance,
        ),
      );
  }

  return highest;
}
