"use client";

import type {
  PurchasePredictionRecord,
} from "@/lib/predictions/types";

export const PREDICTION_STORAGE_KEY =
  "olfactus.predictions.ledger.v1";

export function readPredictionLedger(): PurchasePredictionRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(
      PREDICTION_STORAGE_KEY,
    );
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writePredictionLedger(
  records: PurchasePredictionRecord[],
) {
  if (typeof window === "undefined") return;

  const deduped = Array.from(
    new Map(
      records.map((record) => [record.id, record]),
    ).values(),
  )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    )
    .slice(-500);

  window.localStorage.setItem(
    PREDICTION_STORAGE_KEY,
    JSON.stringify(deduped),
  );

  window.dispatchEvent(
    new CustomEvent(
      "olfactus:predictions-updated",
    ),
  );
}

export function upsertPrediction(
  record: PurchasePredictionRecord,
) {
  const records = readPredictionLedger();
  const next = records.filter(
    (item) => item.id !== record.id,
  );
  next.push(record);
  writePredictionLedger(next);
  return record;
}

export function markPredictionPurchased(
  predictionId: string,
  purchasePrice?: number,
  currency = "USD",
) {
  const records = readPredictionLedger();
  const next = records.map((record) =>
    record.id === predictionId
      ? {
          ...record,
          purchaseConfirmedAt:
            new Date().toISOString(),
          purchasePrice,
          currency,
          maturity: "pending" as const,
        }
      : record,
  );
  writePredictionLedger(next);
}
