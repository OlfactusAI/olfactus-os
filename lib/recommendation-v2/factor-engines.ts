import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
  Season,
} from "@/lib/domain/fragrance";
import {
  readDnaScore,
  readMarketPrice,
} from "@/lib/recommendation-v2/schema-adapters";
import type {
  RecommendationTraceStep,
} from "@/lib/recommendation-v2/types";

export function scorePreference({
  fragrance,
}: {
  fragrance: FragranceRecord;
}): RecommendationTraceStep {
  const dna =
    Object.values(
      fragrance.dna,
    ).filter(
      (value): value is number =>
        typeof value === "number",
    );

  const average =
    dna.length
      ? dna.reduce(
          (sum, value) =>
            sum + value,
          0,
        ) / dna.length
      : 50;

  return step(
    "preference",
    "Preference fit",
    normalize(
      average,
      55,
    ),
    72,
    "Candidate DNA was evaluated against the active fragrance preference space.",
  );
}

export function scoreRoleGap({
  fragrance,
  collection,
  catalog,
}: {
  fragrance: FragranceRecord;
  collection: CollectionItem[];
  catalog: FragranceRecord[];
}): RecommendationTraceStep {
  const byId =
    new Map(
      catalog.map(
        (item) => [
          item.id,
          item,
        ],
      ),
    );

  const ownedRoles =
    new Set(
      collection.flatMap(
        (item) =>
          byId.get(
            item.fragranceId,
          )?.roles ??
          [],
      ),
    );

  const newRoles =
    fragrance.roles.filter(
      (role) =>
        !ownedRoles.has(
          role,
        ),
    );

  return step(
    "role-gap",
    "Role gap",
    Math.min(
      18,
      newRoles.length * 6,
    ),
    82,
    newRoles.length
      ? `Adds ${newRoles.join(", ")} coverage.`
      : "Does not add a major new collection role.",
  );
}

export function scoreOverlap({
  fragrance,
  collection,
  catalog,
}: {
  fragrance: FragranceRecord;
  collection: CollectionItem[];
  catalog: FragranceRecord[];
}): RecommendationTraceStep {
  const byId =
    new Map(
      catalog.map(
        (item) => [
          item.id,
          item,
        ],
      ),
    );

  let closest = 0;

  for (const item of collection) {
    const owned =
      byId.get(
        item.fragranceId,
      );

    if (!owned) {
      continue;
    }

    const dimensions =
      Object.keys(
        fragrance.dna,
      ) as Array<
        keyof typeof fragrance.dna
      >;

    const distance =
      dimensions.reduce(
        (sum, key) =>
          sum +
          Math.abs(
            fragrance.dna[key] -
              owned.dna[key],
          ),
        0,
      ) /
      Math.max(
        1,
        dimensions.length,
      );

    closest =
      Math.max(
        closest,
        100 - distance,
      );
  }

  const penalty =
    closest >= 85
      ? -14
      : closest >= 75
        ? -9
        : closest >= 65
          ? -4
          : 2;

  return step(
    "overlap",
    "Collection overlap",
    penalty,
    80,
    closest
      ? `Closest owned DNA similarity is approximately ${Math.round(closest)}%.`
      : "No owned-fragrance overlap could be calculated.",
  );
}

export function scoreWeather({
  fragrance,
  temperatureF,
}: {
  fragrance: FragranceRecord;
  temperatureF?: number;
}): RecommendationTraceStep {
  if (
    temperatureF === undefined
  ) {
    return step(
      "weather",
      "Weather fit",
      0,
      45,
      "No live temperature context was available.",
    );
  }

  const warmWeather =
    temperatureF >= 78;

  const fit =
    warmWeather
      ? average([
          readDnaScore(
            fragrance,
            [
              "fresh",
              "citrus",
              "green",
              "aquatic",
              "clean",
            ],
          ),
          readDnaScore(
            fragrance,
            [
              "bright",
              "versatile",
              "casual",
            ],
          ),
        ])
      : average([
          readDnaScore(
            fragrance,
            [
              "dark",
              "amber",
              "spicy",
              "sweet",
              "woody",
            ],
          ),
          readDnaScore(
            fragrance,
            [
              "formal",
              "intense",
              "rich",
            ],
          ),
        ]);

  return step(
    "weather",
    "Weather fit",
    normalize(
      fit,
      58,
    ),
    76,
    warmWeather
      ? "Warm-weather suitability uses the fresh/bright dimensions available in the current DNA schema."
      : "Cool-weather suitability uses the darker/richer dimensions available in the current DNA schema.",
  );
}

export function scoreSeason({
  fragrance,
  season,
}: {
  fragrance: FragranceRecord;
  season?: Season;
}): RecommendationTraceStep {
  if (!season) {
    return step(
      "season",
      "Season fit",
      0,
      45,
      "No explicit seasonal context was available.",
    );
  }

  const keys =
    season === "summer"
      ? [
          "fresh",
          "citrus",
          "green",
          "aquatic",
          "versatile",
        ]
      : season === "winter"
        ? [
            "dark",
            "sweet",
            "spicy",
            "amber",
            "formal",
          ]
        : season === "fall"
          ? [
              "woody",
              "spicy",
              "dark",
              "formal",
            ]
          : [
              "fresh",
              "green",
              "floral",
              "versatile",
            ];

  const value =
    readDnaScore(
      fragrance,
      keys,
    );

  return step(
    "season",
    "Season fit",
    normalize(
      value,
      58,
    ),
    74,
    `${season} suitability was evaluated using dimensions present in the current DNA schema.`,
  );
}

export function scoreBlindBuyRisk({
  fragrance,
}: {
  fragrance: FragranceRecord;
}): RecommendationTraceStep {
  const distinctive =
    readDnaScore(
      fragrance,
      [
        "unique",
        "unusual",
        "experimental",
        "challenging",
        "dark",
      ],
      55,
    );

  const penalty =
    distinctive >= 80
      ? -9
      : distinctive >= 68
        ? -5
        : -2;

  return step(
    "blind-buy-risk",
    "Blind-buy risk",
    penalty,
    66,
    distinctive >= 80
      ? "Distinctive DNA increases blind-buy uncertainty."
      : "Blind-buy uncertainty is modeled as moderate to low.",
  );
}

export function scoreBudget({
  fragrance,
  budget,
}: {
  fragrance: FragranceRecord;
  budget?: number;
}): RecommendationTraceStep {
  const price =
    readMarketPrice(
      fragrance,
    );

  if (
    !budget ||
    !price
  ) {
    return step(
      "budget",
      "Budget fit",
      0,
      45,
      "The active market schema does not provide enough normalized price context for this candidate.",
    );
  }

  const ratio =
    price /
    budget;

  const contribution =
    ratio <= 0.7
      ? 8
      : ratio <= 1
        ? 4
        : ratio <= 1.2
          ? -3
          : -8;

  return step(
    "budget",
    "Budget fit",
    contribution,
    82,
    `Available market price is modeled at ${Math.round(ratio * 100)}% of the stated budget.`,
  );
}

function step(
  factor: RecommendationTraceStep["factor"],
  label: string,
  contribution: number,
  confidence: number,
  explanation: string,
): RecommendationTraceStep {
  return {
    factor,
    label,
    contribution:
      Math.round(
        contribution,
      ),
    confidence,
    explanation,
  };
}

function normalize(
  value: number,
  baseline: number,
) {
  return Math.max(
    -12,
    Math.min(
      18,
      Math.round(
        (value - baseline) / 3,
      ),
    ),
  );
}

function average(
  values: number[],
) {
  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    Math.max(
      1,
      values.length,
    )
  );
}
