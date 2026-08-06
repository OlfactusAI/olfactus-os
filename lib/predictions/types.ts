export type PredictionMaturity =
  | "pending"
  | "early-signal"
  | "matured"
  | "verified"
  | "insufficient-data";

export type PurchasePredictionVerdict =
  | "strong-buy"
  | "buy"
  | "sample"
  | "skip"
  | "avoid";

export interface PurchasePredictionRecord {
  id: string;
  fragranceId: string;
  fragranceName: string;
  brand: string;
  createdAt: string;
  purchaseConfirmedAt?: string;
  originalVerdict: PurchasePredictionVerdict;
  originalConfidence: number;
  originalBlindBuyRisk: number;
  predictedHealthGain: number;
  predictedLongTermValue: number;
  purchasePrice?: number;
  currency?: string;
  baselineWearCount: number;
  baselineCollectionHealth: number;
  baselineRedundancy: number;
  maturity: PredictionMaturity;
  verifiedAt?: string;
}

export interface PurchasePredictionOutcome {
  predictionId: string;
  currentWearCount: number;
  wearsSincePurchase: number;
  personalRating?: number;
  actualHealthGain: number;
  currentRedundancy: number;
  costPerWear?: number;
  satisfactionScore: number;
  verdictCorrect: boolean;
  riskAccuracy: number;
  healthImpactAccuracy: number;
  longTermValueAccuracy: number;
  overallAccuracy: number;
}
