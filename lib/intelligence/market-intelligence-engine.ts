import type {
  CollectionMarketSummary,
  DealQuality,
  MarketIntelligenceInput,
  MarketIntelligenceOutput,
  MarketRiskTier,
} from "@/lib/market/types";

export function analyzeMarketIntelligence(
  input: MarketIntelligenceInput,
): MarketIntelligenceOutput {
  const retail = normalizePrice(
    input.retailPrice,
    input.typicalMarketPrice,
    input.observedPrice,
    180,
  );

  const market = normalizePrice(
    input.typicalMarketPrice,
    input.observedPrice,
    input.retailPrice,
    retail,
  );

  const observed = normalizePrice(
    input.observedPrice,
    input.purchasePrice,
    input.typicalMarketPrice,
    market,
  );

  const baseValueScore =
    input.valueScore ?? 70;

  const availabilityMultiplier = {
    "widely-available": 0.96,
    limited: 1.04,
    discontinued: 1.12,
  }[input.availability ?? "widely-available"];

  const strategicMultiplier =
    0.82 + clamp(input.strategicValue) / 500;

  const overlapPenalty =
    1 - clamp(input.overlap) / 450;

  const riskPenalty =
    1 -
    clamp(input.blindBuyRisk ?? 45) / 650;

  const fairValuePrice = Math.round(
    market *
      availabilityMultiplier *
      strategicMultiplier *
      overlapPenalty *
      riskPenalty,
  );

  const normalizedFairValue =
    Math.max(35, fairValuePrice);

  const minimum = Math.round(
    normalizedFairValue * 0.9,
  );
  const maximum = Math.round(
    normalizedFairValue * 1.03,
  );
  const waitThreshold = Math.round(
    normalizedFairValue * 1.1,
  );

  const priceEfficiency =
    observed <= 0
      ? 0
      : clamp(
          (normalizedFairValue / observed) *
            100,
        );

  const fairValueScore = Math.round(
    clamp(
      priceEfficiency * 0.48 +
        baseValueScore * 0.22 +
        input.strategicValue * 0.2 +
        (100 - input.overlap) * 0.1,
    ),
  );

  const projectedAnnualWears =
    Math.max(
      1,
      Math.round(
        input.expectedAnnualWears ??
          8 +
            input.strategicValue * 0.18 +
            (100 - input.overlap) * 0.08 -
            (input.blindBuyRisk ?? 45) *
              0.05,
      ),
    );

  const projectedCostPerWear =
    roundCurrency(
      observed / projectedAnnualWears,
    );

  const currentCostPerWear =
    input.purchasePrice &&
    input.currentWearCount &&
    input.currentWearCount > 0
      ? roundCurrency(
          input.purchasePrice /
            input.currentWearCount,
        )
      : undefined;

  const replacementUrgency = Math.round(
    clamp(
      (input.availability ===
      "discontinued"
        ? 82
        : input.availability === "limited"
          ? 58
          : 22) +
        input.strategicValue * 0.16 -
        input.overlap * 0.12,
    ),
  );

  const marketRisk = Math.round(
    clamp(
      Math.max(
        0,
        ((observed - normalizedFairValue) /
          Math.max(1, normalizedFairValue)) *
          100,
      ) *
        0.38 +
        (input.blindBuyRisk ?? 45) * 0.28 +
        input.overlap * 0.18 +
        (100 - baseValueScore) * 0.16,
    ),
  );

  const marketRiskTier =
    getMarketRiskTier(marketRisk);

  const dealQuality = getDealQuality({
    fairValueScore,
    observed,
    minimum,
    maximum,
    waitThreshold,
    marketRisk,
  });

  const reasons = buildReasons({
    observed,
    fairValue: normalizedFairValue,
    dealQuality,
    strategicValue: input.strategicValue,
    overlap: input.overlap,
    availability:
      input.availability ??
      "widely-available",
    projectedAnnualWears,
    projectedCostPerWear,
  });

  return {
    modelVersion: "MIE-1.0.0",
    fairValueScore,
    dealQuality,
    marketRisk,
    marketRiskTier,
    observedPrice: observed,
    fairValuePrice:
      normalizedFairValue,
    recommendedBuyWindow: {
      minimum,
      maximum,
    },
    waitThreshold,
    projectedAnnualWears,
    projectedCostPerWear,
    currentCostPerWear,
    replacementUrgency,
    explanation: buildExplanation({
      fairValueScore,
      dealQuality,
      observed,
      minimum,
      maximum,
      projectedCostPerWear,
      projectedAnnualWears,
      strategicValue: input.strategicValue,
      overlap: input.overlap,
    }),
    reasons,
  };
}

export function summarizeCollectionMarketValue(
  entries: Array<{
    fragranceId: string;
    retailPrice?: number;
    typicalMarketPrice?: number;
    purchasePrice?: number;
    wearCount: number;
    valueScore?: number;
  }>,
): CollectionMarketSummary {
  const retailValue = sum(
    entries.map(
      (entry) =>
        entry.retailPrice ??
        entry.typicalMarketPrice ??
        0,
    ),
  );

  const estimatedMarketValue = sum(
    entries.map(
      (entry) =>
        entry.typicalMarketPrice ??
        entry.retailPrice ??
        0,
    ),
  );

  const totalAmountPaid = sum(
    entries.map(
      (entry) =>
        entry.purchasePrice ??
        entry.typicalMarketPrice ??
        entry.retailPrice ??
        0,
    ),
  );

  const totalWears = sum(
    entries.map(
      (entry) => entry.wearCount,
    ),
  );

  const highestValue =
    [...entries].sort(
      (a, b) =>
        (b.typicalMarketPrice ??
          b.retailPrice ??
          0) -
        (a.typicalMarketPrice ??
          a.retailPrice ??
          0),
    )[0];

  const highestUse =
    [...entries].sort(
      (a, b) =>
        b.wearCount - a.wearCount,
    )[0];

  const lowestValue =
    [...entries].sort(
      (a, b) =>
        (a.valueScore ?? 50) -
        (b.valueScore ?? 50),
    )[0];

  return {
    retailValue:
      roundCurrency(retailValue),
    estimatedMarketValue:
      roundCurrency(
        estimatedMarketValue,
      ),
    totalAmountPaid:
      roundCurrency(totalAmountPaid),
    unrealizedSavings:
      roundCurrency(
        retailValue - totalAmountPaid,
      ),
    averageCostPerWear:
      totalWears > 0
        ? roundCurrency(
            totalAmountPaid / totalWears,
          )
        : 0,
    highestValueFragranceId:
      highestValue?.fragranceId,
    highestUseFragranceId:
      highestUse?.fragranceId,
    lowestValueFragranceId:
      lowestValue?.fragranceId,
  };
}

export function formatDealQuality(
  value: DealQuality,
) {
  return {
    "exceptional-deal": "Exceptional Deal",
    "good-buy": "Good Buy",
    "fair-price": "Fair Price",
    "wait-for-sale": "Wait for Sale",
    overpriced: "Overpriced",
    avoid: "Avoid",
  }[value];
}

function getDealQuality({
  fairValueScore,
  observed,
  minimum,
  maximum,
  waitThreshold,
  marketRisk,
}: {
  fairValueScore: number;
  observed: number;
  minimum: number;
  maximum: number;
  waitThreshold: number;
  marketRisk: number;
}): DealQuality {
  if (
    observed <= minimum &&
    fairValueScore >= 88 &&
    marketRisk <= 35
  ) {
    return "exceptional-deal";
  }

  if (
    observed <= maximum &&
    fairValueScore >= 75 &&
    marketRisk <= 48
  ) {
    return "good-buy";
  }

  if (
    observed <= waitThreshold &&
    fairValueScore >= 60
  ) {
    return "fair-price";
  }

  if (
    observed <= waitThreshold * 1.18 &&
    marketRisk < 70
  ) {
    return "wait-for-sale";
  }

  if (marketRisk < 82) {
    return "overpriced";
  }

  return "avoid";
}

function getMarketRiskTier(
  value: number,
): MarketRiskTier {
  if (value <= 29) return "low";
  if (value <= 54) return "moderate";
  if (value <= 74) return "high";
  return "very-high";
}

function buildReasons({
  observed,
  fairValue,
  dealQuality,
  strategicValue,
  overlap,
  availability,
  projectedAnnualWears,
  projectedCostPerWear,
}: {
  observed: number;
  fairValue: number;
  dealQuality: DealQuality;
  strategicValue: number;
  overlap: number;
  availability:
    | "widely-available"
    | "limited"
    | "discontinued";
  projectedAnnualWears: number;
  projectedCostPerWear: number;
}) {
  const reasons = [
    `Observed price is $${observed}, compared with an estimated fair value of $${fairValue}.`,
    `Strategic collection value is ${strategicValue}/100.`,
    `Maximum collection overlap is ${overlap}%.`,
    `Projected use is ${projectedAnnualWears} wears per year at approximately $${projectedCostPerWear.toFixed(
      2,
    )} per wear.`,
  ];

  if (availability === "limited") {
    reasons.push(
      "Limited availability increases replacement urgency and slightly raises fair value.",
    );
  }

  if (availability === "discontinued") {
    reasons.push(
      "Discontinued status materially increases replacement urgency and price volatility.",
    );
  }

  if (
    dealQuality === "wait-for-sale"
  ) {
    reasons.push(
      "The fragrance is strategically viable, but the current price is outside the recommended buy window.",
    );
  }

  return reasons;
}

function buildExplanation({
  fairValueScore,
  dealQuality,
  observed,
  minimum,
  maximum,
  projectedCostPerWear,
  projectedAnnualWears,
  strategicValue,
  overlap,
}: {
  fairValueScore: number;
  dealQuality: DealQuality;
  observed: number;
  minimum: number;
  maximum: number;
  projectedCostPerWear: number;
  projectedAnnualWears: number;
  strategicValue: number;
  overlap: number;
}) {
  return `This purchase receives a ${fairValueScore}/100 Fair Value score and a ${formatDealQuality(
    dealQuality,
  )} verdict. The current price is $${observed}, while the recommended buy window is $${minimum}–$${maximum}. OLFACTUS projects ${projectedAnnualWears} annual wears at approximately $${projectedCostPerWear.toFixed(
    2,
  )} per wear. Strategic value is ${strategicValue}/100 and collection overlap is ${overlap}%.`;
}

function normalizePrice(
  ...values: Array<
    number | undefined
  >
) {
  return Math.round(
    values.find(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        value > 0,
    ) ?? 0,
  );
}

function sum(values: number[]) {
  return values.reduce(
    (total, value) =>
      total + value,
    0,
  );
}

function roundCurrency(
  value: number,
) {
  return (
    Math.round(value * 100) / 100
  );
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.min(
    maximum,
    Math.max(minimum, value),
  );
}
