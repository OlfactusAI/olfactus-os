import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

export interface LiveCollectionItem {
  fragranceId: string;
  wearCount?: number;
  lastWornAt?: string;
  acquiredAt?: string;
  purchasePrice?: number;
  role?: string;
}

export interface LiveCollectionSnapshot {
  collectionSize: number;
  healthScore: number;
  roleCoverage: number;
  seasonalBalance: number;
  dnaDiversity: number;
  redundancy: number;
  rotationBalance: number;
  dominantFamily?: string;
  neglectedFragranceId?: string;
  neglectedDays?: number;
  topWearFragranceId?: string;
}

export function buildLiveCollectionSnapshot({
  collection,
  catalog,
  healthScore,
  redundancyScore,
  diversityScore,
  rotationScore,
}: {
  collection: LiveCollectionItem[];
  catalog: FragranceRecord[];
  healthScore?: number;
  redundancyScore?: number;
  diversityScore?: number;
  rotationScore?: number;
}): LiveCollectionSnapshot {
  const itemById =
    new Map(
      catalog.map(
        (item) => [
          item.id,
          item,
        ],
      ),
    );

  const familyCounts =
    new Map<
      string,
      number
    >();
  const roleSet =
    new Set<string>();
  const seasonSet =
    new Set<string>();

  for (const item of collection) {
    const fragrance =
      itemById.get(
        item.fragranceId,
      );
    if (!fragrance) {
      continue;
    }

    if (fragrance.family) {
      familyCounts.set(
        fragrance.family,
        (familyCounts.get(
          fragrance.family,
        ) ?? 0) + 1,
      );
    }

    for (
      const role
      of fragrance.roles ??
        []
    ) {
      roleSet.add(
        role,
      );
    }

    for (const [
      season,
      value,
    ] of Object.entries(
      fragrance.seasons ??
        {},
    )) {
      if (
        Number(value) >=
        60
      ) {
        seasonSet.add(
          season,
        );
      }
    }
  }

  const dominantFamily =
    [...familyCounts.entries()]
      .sort(
        (a, b) =>
          b[1] -
          a[1],
      )[0]?.[0];

  const now =
    Date.now();
  const wearRows =
    collection.map(
      (item) => ({
        ...item,
        days:
          item.lastWornAt
            ? Math.max(
                0,
                Math.floor(
                  (
                    now -
                    new Date(
                      item.lastWornAt,
                    ).getTime()
                  ) /
                    86_400_000,
                ),
              )
            : Number.POSITIVE_INFINITY,
      }),
    );

  const neglected =
    [...wearRows].sort(
      (a, b) =>
        b.days -
        a.days,
    )[0];

  const topWear =
    [...collection].sort(
      (a, b) =>
        (b.wearCount ??
          0) -
        (a.wearCount ??
          0),
    )[0];

  return {
    collectionSize:
      collection.length,
    healthScore:
      clamp(
        healthScore ??
          deriveHealth({
            collectionSize:
              collection.length,
            roleCount:
              roleSet.size,
            seasonCount:
              seasonSet.size,
            familyCount:
              familyCounts.size,
          }),
      ),
    roleCoverage:
      clamp(
        Math.min(
          100,
          roleSet.size *
            14,
        ),
      ),
    seasonalBalance:
      clamp(
        Math.min(
          100,
          seasonSet.size *
            25,
        ),
      ),
    dnaDiversity:
      clamp(
        diversityScore ??
          Math.min(
            100,
            familyCounts.size *
              18,
          ),
      ),
    redundancy:
      clamp(
        redundancyScore ??
          deriveRedundancy(
            collection.length,
            familyCounts,
          ),
      ),
    rotationBalance:
      clamp(
        rotationScore ??
          deriveRotationBalance(
            collection,
          ),
      ),
    dominantFamily,
    neglectedFragranceId:
      neglected?.fragranceId,
    neglectedDays:
      Number.isFinite(
        neglected?.days,
      )
        ? neglected?.days
        : undefined,
    topWearFragranceId:
      topWear?.fragranceId,
  };
}

export function chooseLiveWearRecommendation({
  collection,
  catalog,
}: {
  collection: LiveCollectionItem[];
  catalog: FragranceRecord[];
}) {
  if (!collection.length) {
    return null;
  }

  const itemById =
    new Map(
      catalog.map(
        (item) => [
          item.id,
          item,
        ],
      ),
    );

  const now =
    Date.now();

  return collection
    .map(
      (item) => {
        const fragrance =
          itemById.get(
            item.fragranceId,
          );
        if (!fragrance) {
          return null;
        }

        const daysSinceWear =
          item.lastWornAt
            ? Math.max(
                0,
                Math.floor(
                  (
                    now -
                    new Date(
                      item.lastWornAt,
                    ).getTime()
                  ) /
                    86_400_000,
                ),
              )
            : 90;

        const performance =
          fragrance.performance ??
          {};
        const performanceScore =
          average(
            Object.values(
              performance,
            ).map(Number),
          );

        const score =
          clamp(
            58 +
              Math.min(
                25,
                daysSinceWear /
                  2,
              ) +
              performanceScore /
                8,
          );

        return {
          fragranceId:
            fragrance.id,
          fragranceName:
            fragrance.name,
          brand:
            fragrance.brand,
          score,
          daysSinceWear,
          confidence:
            fragrance.intelligence
              ?.confidence ??
            72,
          reason:
            daysSinceWear >=
            30
              ? `${daysSinceWear} days since last wear.`
              : "Strong current rotation fit.",
        };
      },
    )
    .filter(
      (
        item,
      ): item is
        NonNullable<
          typeof item
        > =>
        Boolean(item),
    )
    .sort(
      (a, b) =>
        b.score -
        a.score,
    )[0];
}

export function buildCollectionSignal(
  snapshot:
    LiveCollectionSnapshot,
) {
  if (
    snapshot.collectionSize ===
    0
  ) {
    return {
      label:
        "Collection empty",
      note:
        "Add fragrances to begin live intelligence.",
    };
  }

  if (
    snapshot.redundancy >=
    65
  ) {
    return {
      label:
        "High overlap",
      note:
        "Redundancy has crossed the warning threshold.",
    };
  }

  if (
    snapshot.rotationBalance <
    55
  ) {
    return {
      label:
        "Rotation imbalance",
      note:
        "Wear activity is concentrated in too few bottles.",
    };
  }

  if (
    snapshot.dnaDiversity <
    55
  ) {
    return {
      label:
        "Low DNA diversity",
      note:
        "The collection is clustering around a narrow scent profile.",
    };
  }

  return {
    label:
      "Collection balanced",
    note:
      "No major collection warning is active.",
  };
}

function deriveHealth({
  collectionSize,
  roleCount,
  seasonCount,
  familyCount,
}: {
  collectionSize: number;
  roleCount: number;
  seasonCount: number;
  familyCount: number;
}) {
  if (!collectionSize) {
    return 0;
  }

  return (
    35 +
    Math.min(
      20,
      roleCount * 4,
    ) +
    Math.min(
      20,
      seasonCount * 5,
    ) +
    Math.min(
      25,
      familyCount * 4,
    )
  );
}

function deriveRedundancy(
  collectionSize: number,
  familyCounts:
    Map<
      string,
      number
    >,
) {
  if (
    collectionSize <=
    1
  ) {
    return 0;
  }

  const largest =
    Math.max(
      0,
      ...familyCounts.values(),
    );

  return (
    largest /
    collectionSize
  ) * 100;
}

function deriveRotationBalance(
  collection:
    LiveCollectionItem[],
) {
  if (!collection.length) {
    return 0;
  }

  const wears =
    collection.map(
      (item) =>
        item.wearCount ??
        0,
    );
  const total =
    wears.reduce(
      (sum, value) =>
        sum + value,
      0,
    );

  if (!total) {
    return 50;
  }

  const maximum =
    Math.max(
      ...wears,
    );

  return (
    100 -
    maximum /
      total *
      65
  );
}

function average(
  values: number[],
) {
  if (!values.length) {
    return 50;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum +
        (Number.isFinite(
          value,
        )
          ? value
          : 0),
      0,
    ) /
    values.length
  );
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Number.isFinite(
          value,
        )
          ? value
          : 0,
      ),
    ),
  );
}
