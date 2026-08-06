"use client";

import type { DealAnalyzerOutput } from "@/lib/intelligence/deal-analyzer-engine";

export const DEAL_HISTORY_STORAGE_KEY =
  "olfactus.market.deal-history.v1";

export interface SavedDealAnalysis {
  id: string;
  createdAt: string;
  fragranceId: string;
  fragranceName: string;
  brand: string;
  seller: string;
  price: number;
  condition: "new" | "tester" | "used";
  purchaseScore: number;
  verdict: string;
  fairValue: number;
  buyWindowMinimum: number;
  buyWindowMaximum: number;
  projectedCostPerWear: number;
  strategicValue: number;
  overlap: number;
}

export function readDealHistory(): SavedDealAnalysis[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(
      DEAL_HISTORY_STORAGE_KEY,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDealAnalysis(
  analysis: DealAnalyzerOutput,
) {
  if (typeof window === "undefined") return null;

  const record: SavedDealAnalysis = {
    id: `deal-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    fragranceId: analysis.candidate.id,
    fragranceName: analysis.candidate.name,
    brand: analysis.candidate.brand,
    seller: analysis.bestOffer.seller,
    price: analysis.bestOffer.price,
    condition: analysis.bestOffer.condition,
    purchaseScore: analysis.purchaseScore,
    verdict: analysis.verdict,
    fairValue: analysis.fairValue,
    buyWindowMinimum:
      analysis.buyWindow.minimum,
    buyWindowMaximum:
      analysis.buyWindow.maximum,
    projectedCostPerWear:
      analysis.projectedCostPerWear,
    strategicValue:
      analysis.graph.strategicValue,
    overlap: analysis.graph.overlap,
  };

  const history = [
    record,
    ...readDealHistory().filter(
      (item) =>
        !(
          item.fragranceId === record.fragranceId &&
          item.seller === record.seller &&
          item.price === record.price
        ),
    ),
  ].slice(0, 100);

  window.localStorage.setItem(
    DEAL_HISTORY_STORAGE_KEY,
    JSON.stringify(history),
  );
  window.dispatchEvent(
    new CustomEvent(
      "olfactus:deal-history-updated",
    ),
  );

  return record;
}

export function clearDealHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(
    DEAL_HISTORY_STORAGE_KEY,
  );
  window.dispatchEvent(
    new CustomEvent(
      "olfactus:deal-history-updated",
    ),
  );
}
