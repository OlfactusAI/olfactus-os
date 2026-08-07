import type { CollectionItem } from "@/lib/domain/collection";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import { analyzeMarketIntelligence } from "@/lib/intelligence/market-intelligence-engine";
import { createUnifiedKnowledgeGraph, explainGraphRecommendation, getUnifiedGraphSignal } from "@/lib/intelligence/unified-graph-intelligence";
import { getMarketCatalogEntry } from "@/lib/market/market-catalog";
import { assertEligibleForEngine, filterCatalogForEngine } from "@/lib/intelligence/readiness-gateway";
import {
  calibrateIntelligenceScore,
  type CalibratedIntelligenceScore,
} from "@/lib/intelligence/confidence-calibration";

export interface DealOffer { id: string; seller: string; price: number; condition: "new" | "tester" | "used"; }
export interface DealAnalysisInput { candidateId: string; offers: DealOffer[]; collection: CollectionItem[]; catalog: FragranceRecord[]; }
export interface DealOfferAnalysis extends DealOffer { purchaseScore: number; verdict: string; fairValueScore: number; projectedCostPerWear: number; marketRisk: number; }
export interface DealAnalyzerOutput {
  modelVersion: "DLA-1.0.0";
  candidate: FragranceRecord;
  bestOffer: DealOfferAnalysis;
  offers: DealOfferAnalysis[];
  purchaseScore: number;
  calibration:
    CalibratedIntelligenceScore;
  verdict: string;
  fairValue: number;
  buyWindow: { minimum: number; maximum: number };
  typicalMarketPrice: number;
  retailPrice: number;
  graph: { overlap: number; expansionValue: number; bridgeValue: number; strategicValue: number };
  projectedAnnualWears: number;
  projectedCostPerWear: number;
  replacementUrgency: number;
  opportunity: "Exceptional" | "Strong" | "Fair" | "Weak";
  timeline: Array<{ label: string; estimatedPrice: number; savings: number; availabilityRisk: number; verdict: string }>;
  alternatives: Array<{ fragranceId: string; name: string; brand: string; strategicValue: number; expansionValue: number }>;
  analystVerdict: string;
}

function classifyOfferPrice({
  price,
  minimum,
  maximum,
  waitThreshold,
  severeCollectionRisk,
}: {
  price: number;
  minimum: number;
  maximum: number;
  waitThreshold: number;
  severeCollectionRisk: boolean;
}) {
  if (severeCollectionRisk) {
    return {
      verdict:
        price <= maximum
          ? "Exceptional Price · High Collection Risk"
          : "High Collection Risk",
      minimumScore:
        price <= minimum ? 74 : 58,
      maximumScoreFloor: 0,
    };
  }

  if (price <= minimum) {
    return {
      verdict: "Exceptional Deal",
      minimumScore: 90,
      maximumScoreFloor: 0,
    };
  }

  if (price <= maximum) {
    return {
      verdict: "Good Buy",
      minimumScore: 80,
      maximumScoreFloor: 0,
    };
  }

  if (price <= waitThreshold) {
    return {
      verdict: "Fair Price",
      minimumScore: 68,
      maximumScoreFloor: 0,
    };
  }

  if (price <= waitThreshold * 1.18) {
    return {
      verdict: "Wait for Sale",
      minimumScore: 52,
      maximumScoreFloor: 0,
    };
  }

  return {
    verdict: "Overpriced",
    minimumScore: 0,
    maximumScoreFloor: 0,
  };
}

export function analyzeDeal(input: DealAnalysisInput): DealAnalyzerOutput {
  const candidate = input.catalog.find((item) => item.id === input.candidateId);
  if (!candidate) throw new Error(`Unknown fragrance: ${input.candidateId}`);
  const eligibility =
    assertEligibleForEngine(
      candidate,
      "deal-lab",
    );
  const eligibleCatalog = filterCatalogForEngine(input.catalog, "deal-lab");
  const ownedIds = new Set(input.collection.map((item) => item.fragranceId));
  const graph = createUnifiedKnowledgeGraph({ catalog: eligibleCatalog, ownedIds });
  const signal = getUnifiedGraphSignal({ graph, catalog: eligibleCatalog, fragranceId: candidate.id });
  const market = getMarketCatalogEntry(candidate.id, candidate.market?.retailPrice);
  const blindBuyRisk = Math.round(Math.min(100, signal.overlap * .48 + (100 - signal.strategicValue) * .28 + 18));

  const validOffers = input.offers.filter(
    (offer) =>
      Number.isFinite(offer.price) &&
      offer.price > 0,
  );

  const normalizedOffers: DealOffer[] =
    validOffers.length > 0
      ? validOffers
      : [
          {
            id: "fallback-market-offer",
            seller: "Typical Market Price",
            price: market.typicalMarketPrice,
            condition: "new",
          },
        ];

  const offers = normalizedOffers.map((offer) => {
    const conditionAdjustment =
      offer.condition === "tester"
        ? 4
        : offer.condition === "used"
          ? 12
          : 0;

    const analysis = analyzeMarketIntelligence({
      observedPrice: offer.price,
      retailPrice: market.retailPrice,
      typicalMarketPrice: market.typicalMarketPrice,
      valueScore: market.investmentRating,
      availability: market.availability,
      strategicValue: signal.strategicValue,
      overlap: signal.overlap,
      blindBuyRisk:
        blindBuyRisk + conditionAdjustment,
    });

    const severeCollectionRisk =
      signal.overlap >= 90 ||
      blindBuyRisk + conditionAdjustment >= 86;

    const priceClassification =
      classifyOfferPrice({
        price: offer.price,
        minimum:
          analysis.recommendedBuyWindow.minimum,
        maximum:
          analysis.recommendedBuyWindow.maximum,
        waitThreshold:
          analysis.waitThreshold,
        severeCollectionRisk,
      });

    const baseScore =
      analysis.fairValueScore * 0.5 +
      signal.strategicValue * 0.28 +
      (100 - analysis.marketRisk) * 0.22 -
      conditionAdjustment;

    const purchaseScore = Math.round(
      Math.max(
        priceClassification.maximumScoreFloor ?? 0,
        Math.min(
          100,
          Math.max(
            priceClassification.minimumScore,
            baseScore,
          ),
        ),
      ),
    );

    return {
      ...offer,
      purchaseScore,
      verdict: priceClassification.verdict,
      fairValueScore:
        analysis.fairValueScore,
      projectedCostPerWear:
        analysis.projectedCostPerWear,
      marketRisk: analysis.marketRisk,
    };
  }).sort(
    (a, b) =>
      b.purchaseScore -
        a.purchaseScore ||
      a.price - b.price,
  );

  const bestOffer = offers[0];
  const bestMarket = analyzeMarketIntelligence({
    observedPrice: bestOffer.price,
    retailPrice: market.retailPrice,
    typicalMarketPrice: market.typicalMarketPrice,
    valueScore: market.investmentRating,
    availability: market.availability,
    strategicValue: signal.strategicValue,
    overlap: signal.overlap,
    blindBuyRisk,
  });

  const alternatives = eligibleCatalog
    .filter((item) => !ownedIds.has(item.id) && item.id !== candidate.id)
    .map((item) => ({ item, signal: getUnifiedGraphSignal({ graph, catalog: eligibleCatalog, fragranceId: item.id }) }))
    .sort((a,b) => b.signal.strategicValue - a.signal.strategicValue)
    .slice(0,3)
    .map(({item, signal}) => ({ fragranceId:item.id, name:item.name, brand:item.brand, strategicValue:signal.strategicValue, expansionValue:signal.expansionValue }));

  const timeline = [
    { label:"Buy Today", estimatedPrice:bestOffer.price, savings:Math.max(0, market.retailPrice-bestOffer.price), availabilityRisk:bestMarket.replacementUrgency, verdict:bestOffer.verdict },
    { label:"Wait 30 Days", estimatedPrice:Math.round(bestOffer.price*.96), savings:Math.round(bestOffer.price*.04), availabilityRisk:Math.min(100,bestMarket.replacementUrgency+8), verdict:bestOffer.price > bestMarket.recommendedBuyWindow.maximum ? "Recommended" : "Optional" },
    { label:"Wait 90 Days", estimatedPrice:Math.round(bestOffer.price*.92), savings:Math.round(bestOffer.price*.08), availabilityRisk:Math.min(100,bestMarket.replacementUrgency+18), verdict:market.availability === "limited" ? "Higher Risk" : "Possible" },
    { label:"Skip Purchase", estimatedPrice:0, savings:bestOffer.price, availabilityRisk:0, verdict:signal.overlap >= 82 ? "Reasonable" : "Lost Expansion" },
  ];

  const opportunity = bestOffer.purchaseScore >= 90 ? "Exceptional" : bestOffer.purchaseScore >= 78 ? "Strong" : bestOffer.purchaseScore >= 62 ? "Fair" : "Weak";
  const calibration =
    calibrateIntelligenceScore({
      rawScore:
        bestOffer.purchaseScore,
      eligibility,
      evidenceSignals: [
        {
          id: "fair-value",
          strength:
            bestOffer.fairValueScore,
          source: "derived",
        },
        {
          id:
            "strategic-value",
          strength:
            signal.strategicValue,
          source: "derived",
        },
        {
          id: "market-risk",
          strength:
            100 -
            bestOffer.marketRisk,
          source: "derived",
        },
        {
          id: "offer-quality",
          strength:
            Math.max(
              0,
              Math.min(
                100,
                100 -
                  Math.abs(
                    bestOffer.price -
                      bestMarket.fairValuePrice,
                  ) /
                    Math.max(
                      1,
                      bestMarket.fairValuePrice,
                    ) *
                    100,
              ),
            ),
          source: "explicit",
        },
        {
          id: "graph-overlap",
          strength:
            100 -
            signal.overlap,
          source: "inferred",
        },
      ],
      warnings:
        input.offers.length < 2
          ? [
              "Only one live offer was available for comparison.",
            ]
          : [],
    });

  return {
    modelVersion:"DLA-1.0.0", candidate, bestOffer, offers,
    purchaseScore:bestOffer.purchaseScore, calibration, verdict:bestOffer.verdict,
    fairValue:bestMarket.fairValuePrice, buyWindow:bestMarket.recommendedBuyWindow,
    typicalMarketPrice:market.typicalMarketPrice, retailPrice:market.retailPrice,
    graph:{ overlap:signal.overlap, expansionValue:signal.expansionValue, bridgeValue:signal.bridgeValue, strategicValue:signal.strategicValue },
    projectedAnnualWears:bestMarket.projectedAnnualWears, projectedCostPerWear:bestMarket.projectedCostPerWear,
    replacementUrgency:bestMarket.replacementUrgency, opportunity, timeline, alternatives,
    analystVerdict:`${bestOffer.seller}'s $${bestOffer.price} offer receives a ${bestOffer.purchaseScore}/100 Purchase Score and a ${bestOffer.verdict} verdict. The recommended buy window is $${bestMarket.recommendedBuyWindow.minimum}–$${bestMarket.recommendedBuyWindow.maximum}. ${explainGraphRecommendation(signal)} Projected use is ${bestMarket.projectedAnnualWears} wears per year at approximately $${bestMarket.projectedCostPerWear.toFixed(2)} per wear.`,
  };
}
