export type DealQuality =
  | "exceptional-deal"
  | "good-buy"
  | "fair-price"
  | "wait-for-sale"
  | "overpriced"
  | "avoid";

export type MarketRiskTier =
  | "low"
  | "moderate"
  | "high"
  | "very-high";

export interface MarketPriceObservation {
  fragranceId: string;
  observedAt: string;
  price: number;
  currency: string;
  source?: string;
  condition?: "new" | "used" | "tester";
}

export interface MarketIntelligenceInput {
  observedPrice?: number;
  retailPrice?: number;
  typicalMarketPrice?: number;
  valueScore?: number;
  availability?: "widely-available" | "limited" | "discontinued";
  strategicValue: number;
  overlap: number;
  blindBuyRisk?: number;
  expectedAnnualWears?: number;
  purchasePrice?: number;
  currentWearCount?: number;
}

export interface MarketIntelligenceOutput {
  modelVersion: "MIE-1.0.0";
  fairValueScore: number;
  dealQuality: DealQuality;
  marketRisk: number;
  marketRiskTier: MarketRiskTier;
  observedPrice: number;
  fairValuePrice: number;
  recommendedBuyWindow: {
    minimum: number;
    maximum: number;
  };
  waitThreshold: number;
  projectedAnnualWears: number;
  projectedCostPerWear: number;
  currentCostPerWear?: number;
  replacementUrgency: number;
  explanation: string;
  reasons: string[];
}

export interface CollectionMarketSummary {
  retailValue: number;
  estimatedMarketValue: number;
  totalAmountPaid: number;
  unrealizedSavings: number;
  averageCostPerWear: number;
  highestValueFragranceId?: string;
  highestUseFragranceId?: string;
  lowestValueFragranceId?: string;
}
