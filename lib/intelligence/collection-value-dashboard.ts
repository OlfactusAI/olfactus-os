import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import { getMarketCatalogEntry } from "@/lib/market/market-catalog";
import {
  analyzeMarketIntelligence,
  summarizeCollectionMarketValue,
} from "@/lib/intelligence/market-intelligence-engine";

export interface PortfolioHolding {
  fragranceId: string;
  brand: string;
  name: string;
  family: string;
  retailValue: number;
  marketValue: number;
  amountPaid: number;
  savings: number;
  wearCount: number;
  costPerWear: number;
  portfolioShare: number;
  strategicValue: number;
  replacementDifficulty: number;
  investmentRating: number;
  efficiency:
    | "Excellent"
    | "Good"
    | "Fair"
    | "Poor";
}

export interface PortfolioAllocation {
  label: string;
  marketValue: number;
  bottleCount: number;
  percentage: number;
  averageValue: number;
  averageCostPerWear: number;
}

export interface CollectionValueDashboardOutput {
  modelVersion: "CVD-1.0.0";
  estimatedMarketValue: number;
  retailReplacementValue: number;
  totalAmountPaid: number;
  unrealizedSavings: number;
  averageCostPerWear: number;
  marketHealth: number;
  portfolioGrade: "A+" | "A" | "B" | "C" | "D";
  confidence: number;
  holdings: PortfolioHolding[];
  byBrand: PortfolioAllocation[];
  byFamily: PortfolioAllocation[];
  bestPurchases: PortfolioHolding[];
  needsAttention: PortfolioHolding[];
  topHoldings: PortfolioHolding[];
  risk: {
    concentration: number;
    replacement: number;
    underuse: number;
    diversification: number;
    stability: number;
  };
  analystBriefing: string;
  projectedValue: number;
}

export function analyzeCollectionValueDashboard({
  collection,
  catalog,
}: {
  collection: CollectionItem[];
  catalog: FragranceRecord[];
}): CollectionValueDashboardOutput {
  const raw = collection
    .map((item) => {
      const fragrance = catalog.find(
        (candidate) =>
          candidate.id === item.fragranceId,
      );
      if (!fragrance) return null;

      const market = getMarketCatalogEntry(
        fragrance.id,
        fragrance.market?.retailPrice,
      );

      const amountPaid =
        item.purchasePrice ??
        Math.round(
          market.typicalMarketPrice *
            0.93,
        );

      const costPerWear =
        item.wearCount > 0
          ? round(
              amountPaid / item.wearCount,
            )
          : amountPaid;

      const strategicValue = Math.round(
        Math.min(
          100,
          average([
            fragrance.performance.longevity,
            fragrance.performance.projection,
            fragrance.intelligence?.confidence ??
              72,
            100 -
              Math.abs(
                fragrance.dna.artistic -
                  fragrance.dna.formal,
              ) /
                2,
          ]),
        ),
      );

      return {
        fragranceId: fragrance.id,
        brand: fragrance.brand,
        name: fragrance.name,
        family: fragrance.family,
        retailValue: market.retailPrice,
        marketValue:
          market.estimatedMarketValue,
        amountPaid,
        savings:
          market.retailPrice - amountPaid,
        wearCount: item.wearCount,
        costPerWear,
        portfolioShare: 0,
        strategicValue,
        replacementDifficulty:
          market.replacementDifficulty,
        investmentRating:
          market.investmentRating,
        efficiency:
          efficiency(costPerWear),
      } satisfies PortfolioHolding;
    })
    .filter(Boolean) as PortfolioHolding[];

  const summary =
    summarizeCollectionMarketValue(
      raw.map((holding) => ({
        fragranceId:
          holding.fragranceId,
        retailPrice:
          holding.retailValue,
        typicalMarketPrice:
          holding.marketValue,
        purchasePrice:
          holding.amountPaid,
        wearCount:
          holding.wearCount,
        valueScore:
          holding.strategicValue,
      })),
    );

  const holdings = raw.map((holding) => ({
    ...holding,
    portfolioShare:
      summary.estimatedMarketValue > 0
        ? Math.round(
            (holding.marketValue /
              summary.estimatedMarketValue) *
              1000,
          ) / 10
        : 0,
  }));

  const concentration =
    holdings
      .slice()
      .sort(
        (a, b) =>
          b.marketValue -
          a.marketValue,
      )
      .slice(0, 3)
      .reduce(
        (sum, item) =>
          sum + item.portfolioShare,
        0,
      );

  const replacement = Math.round(
    average(
      holdings.map(
        (item) =>
          item.replacementDifficulty,
      ),
    ),
  );

  const underuse = Math.round(
    average(
      holdings.map((item) =>
        Math.max(
          0,
          100 - item.wearCount * 6,
        ),
      ),
    ),
  );

  const diversification = Math.round(
    Math.min(
      100,
      new Set(
        holdings.map(
          (item) => item.family,
        ),
      ).size *
        14 +
        new Set(
          holdings.map(
            (item) => item.brand,
          ),
        ).size *
          8,
    ),
  );

  const stability = Math.round(
    Math.min(
      100,
      average(
        holdings.map(
          (item) =>
            item.investmentRating,
        ),
      ) *
        0.65 +
        (100 - replacement) * 0.35,
    ),
  );

  const savingsRate =
    summary.retailValue > 0
      ? clamp(
          (summary.unrealizedSavings /
            summary.retailValue) *
            100,
        )
      : 0;

  const marketHealth = Math.round(
    clamp(
      diversification * 0.24 +
        stability * 0.24 +
        (100 - underuse) * 0.2 +
        (100 - concentration) * 0.14 +
        savingsRate * 0.18 +
        34,
    ),
  );

  const confidence = Math.round(
    average(
      collection.map((item) =>
        getMarketCatalogEntry(
          item.fragranceId,
        ).confidence,
      ),
    ),
  );

  const projectedValue = Math.round(
    summary.estimatedMarketValue *
      (1 +
        (stability - 50) / 1000),
  );

  const topHoldings =
    [...holdings]
      .sort(
        (a, b) =>
          b.marketValue -
          a.marketValue,
      )
      .slice(0, 5);

  const bestPurchases =
    [...holdings]
      .sort(
        (a, b) =>
          scoreBestPurchase(b) -
          scoreBestPurchase(a),
      )
      .slice(0, 4);

  const needsAttention =
    [...holdings]
      .sort(
        (a, b) =>
          scoreAttention(b) -
          scoreAttention(a),
      )
      .slice(0, 4);

  return {
    modelVersion: "CVD-1.0.0",
    estimatedMarketValue:
      summary.estimatedMarketValue,
    retailReplacementValue:
      summary.retailValue,
    totalAmountPaid:
      summary.totalAmountPaid,
    unrealizedSavings:
      summary.unrealizedSavings,
    averageCostPerWear:
      summary.averageCostPerWear,
    marketHealth,
    portfolioGrade:
      grade(marketHealth),
    confidence,
    holdings,
    byBrand: allocation(
      holdings,
      (item) => item.brand,
      summary.estimatedMarketValue,
    ),
    byFamily: allocation(
      holdings,
      (item) => item.family,
      summary.estimatedMarketValue,
    ),
    bestPurchases,
    needsAttention,
    topHoldings,
    risk: {
      concentration:
        Math.round(concentration),
      replacement,
      underuse,
      diversification,
      stability,
    },
    analystBriefing:
      buildBriefing({
        marketValue:
          summary.estimatedMarketValue,
        retailValue:
          summary.retailValue,
        concentration,
        marketHealth,
        underuseCount:
          holdings.filter(
            (item) =>
              item.wearCount < 5,
          ).length,
        averageCostPerWear:
          summary.averageCostPerWear,
      }),
    projectedValue,
  };
}

function allocation(
  holdings: PortfolioHolding[],
  key: (holding: PortfolioHolding) => string,
  totalValue: number,
): PortfolioAllocation[] {
  const grouped = new Map<
    string,
    PortfolioHolding[]
  >();

  for (const holding of holdings) {
    const label = key(holding);
    grouped.set(label, [
      ...(grouped.get(label) ?? []),
      holding,
    ]);
  }

  return [...grouped.entries()]
    .map(([label, entries]) => {
      const marketValue = sum(
        entries.map(
          (entry) =>
            entry.marketValue,
        ),
      );
      const totalPaid = sum(
        entries.map(
          (entry) =>
            entry.amountPaid,
        ),
      );
      const totalWears = sum(
        entries.map(
          (entry) =>
            entry.wearCount,
        ),
      );

      return {
        label,
        marketValue,
        bottleCount:
          entries.length,
        percentage:
          totalValue > 0
            ? Math.round(
                (marketValue /
                  totalValue) *
                  1000,
              ) / 10
            : 0,
        averageValue:
          round(
            marketValue /
              entries.length,
          ),
        averageCostPerWear:
          totalWears > 0
            ? round(
                totalPaid /
                  totalWears,
              )
            : totalPaid,
      };
    })
    .sort(
      (a, b) =>
        b.marketValue -
        a.marketValue,
    );
}

function scoreBestPurchase(
  item: PortfolioHolding,
) {
  return (
    item.savings * 0.25 +
    item.strategicValue * 0.5 +
    Math.max(
      0,
      30 - item.costPerWear,
    ) *
      2
  );
}

function scoreAttention(
  item: PortfolioHolding,
) {
  return (
    item.costPerWear * 2 +
    Math.max(
      0,
      10 - item.wearCount,
    ) *
      4 +
    (100 - item.strategicValue) *
      0.6
  );
}

function efficiency(
  costPerWear: number,
): PortfolioHolding["efficiency"] {
  if (costPerWear <= 8) return "Excellent";
  if (costPerWear <= 15) return "Good";
  if (costPerWear <= 28) return "Fair";
  return "Poor";
}

function grade(
  value: number,
): CollectionValueDashboardOutput["portfolioGrade"] {
  if (value >= 94) return "A+";
  if (value >= 85) return "A";
  if (value >= 72) return "B";
  if (value >= 58) return "C";
  return "D";
}

function buildBriefing({
  marketValue,
  retailValue,
  concentration,
  marketHealth,
  underuseCount,
  averageCostPerWear,
}: {
  marketValue: number;
  retailValue: number;
  concentration: number;
  marketHealth: number;
  underuseCount: number;
  averageCostPerWear: number;
}) {
  const discount =
    retailValue > 0
      ? Math.round(
          (1 -
            marketValue /
              retailValue) *
            100,
        )
      : 0;

  return `Your collection is currently valued at approximately $${marketValue.toLocaleString()}, ${discount}% below retail replacement cost. The three largest holdings represent ${Math.round(
    concentration,
  )}% of portfolio value. Market Health is ${marketHealth}/100, with an average acquisition cost of $${averageCostPerWear.toFixed(
    2,
  )} per recorded wear. ${underuseCount} bottle${underuseCount === 1 ? "" : "s"} currently show underuse risk and could improve portfolio efficiency through more frequent rotation.`;
}

function average(
  values: number[],
) {
  if (!values.length) return 0;
  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length
  );
}

function sum(values: number[]) {
  return values.reduce(
    (sum, value) =>
      sum + value,
    0,
  );
}

function round(value: number) {
  return (
    Math.round(value * 100) /
    100
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
