export interface MarketCatalogEntry {
  fragranceId: string;
  retailPrice: number;
  typicalMarketPrice: number;
  estimatedMarketValue: number;
  currency: "USD";
  availability:
    | "widely-available"
    | "limited"
    | "discontinued";
  confidence: number;
  replacementDifficulty: number;
  investmentRating: number;
}

const marketCatalog: Record<
  string,
  MarketCatalogEntry
> = {
  imagination: {
    fragranceId: "imagination",
    retailPrice: 350,
    typicalMarketPrice: 335,
    estimatedMarketValue: 325,
    currency: "USD",
    availability: "widely-available",
    confidence: 88,
    replacementDifficulty: 28,
    investmentRating: 72,
  },
  ganymede: {
    fragranceId: "ganymede",
    retailPrice: 245,
    typicalMarketPrice: 225,
    estimatedMarketValue: 218,
    currency: "USD",
    availability: "widely-available",
    confidence: 86,
    replacementDifficulty: 38,
    investmentRating: 75,
  },
  "grand-soir": {
    fragranceId: "grand-soir",
    retailPrice: 325,
    typicalMarketPrice: 285,
    estimatedMarketValue: 278,
    currency: "USD",
    availability: "widely-available",
    confidence: 89,
    replacementDifficulty: 34,
    investmentRating: 78,
  },
  "prada-lhomme": {
    fragranceId: "prada-lhomme",
    retailPrice: 130,
    typicalMarketPrice: 105,
    estimatedMarketValue: 98,
    currency: "USD",
    availability: "widely-available",
    confidence: 84,
    replacementDifficulty: 24,
    investmentRating: 58,
  },
  terre: {
    fragranceId: "terre",
    retailPrice: 145,
    typicalMarketPrice: 112,
    estimatedMarketValue: 106,
    currency: "USD",
    availability: "widely-available",
    confidence: 87,
    replacementDifficulty: 18,
    investmentRating: 61,
  },
  naxos: {
    fragranceId: "naxos",
    retailPrice: 250,
    typicalMarketPrice: 205,
    estimatedMarketValue: 198,
    currency: "USD",
    availability: "widely-available",
    confidence: 86,
    replacementDifficulty: 32,
    investmentRating: 73,
  },
  "un-air": {
    fragranceId: "un-air",
    retailPrice: 190,
    typicalMarketPrice: 145,
    estimatedMarketValue: 138,
    currency: "USD",
    availability: "limited",
    confidence: 76,
    replacementDifficulty: 67,
    investmentRating: 69,
  },
  "bottled-absolu": {
    fragranceId: "bottled-absolu",
    retailPrice: 145,
    typicalMarketPrice: 118,
    estimatedMarketValue: 110,
    currency: "USD",
    availability: "widely-available",
    confidence: 80,
    replacementDifficulty: 25,
    investmentRating: 59,
  },
};

export function getMarketCatalogEntry(
  fragranceId: string,
  fallbackPrice = 180,
): MarketCatalogEntry {
  return (
    marketCatalog[fragranceId] ?? {
      fragranceId,
      retailPrice: fallbackPrice,
      typicalMarketPrice:
        Math.round(fallbackPrice * 0.84),
      estimatedMarketValue:
        Math.round(fallbackPrice * 0.8),
      currency: "USD",
      availability:
        "widely-available",
      confidence: 62,
      replacementDifficulty: 35,
      investmentRating: 60,
    }
  );
}
