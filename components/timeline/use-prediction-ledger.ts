"use client";

import { useCallback, useEffect, useState } from "react";

import {
  readPredictionLedger,
} from "@/lib/predictions/prediction-ledger";
import type {
  PurchasePredictionRecord,
} from "@/lib/predictions/types";

export function usePredictionLedger() {
  const [records, setRecords] = useState<
    PurchasePredictionRecord[]
  >([]);
  const [hydrated, setHydrated] =
    useState(false);

  const refresh = useCallback(() => {
    setRecords(readPredictionLedger());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);

    window.addEventListener(
      "olfactus:predictions-updated",
      refresh,
    );
    window.addEventListener(
      "storage",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "olfactus:predictions-updated",
        refresh,
      );
      window.removeEventListener(
        "storage",
        refresh,
      );
    };
  }, [refresh]);

  return {
    records,
    hydrated,
    refresh,
  };
}
