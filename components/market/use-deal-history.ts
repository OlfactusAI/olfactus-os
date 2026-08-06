"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  clearDealHistory,
  readDealHistory,
  type SavedDealAnalysis,
} from "@/lib/market/deal-history";

export function useDealHistory() {
  const [history, setHistory] = useState<
    SavedDealAnalysis[]
  >([]);
  const [hydrated, setHydrated] =
    useState(false);

  const refresh = useCallback(() => {
    setHistory(readDealHistory());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);

    window.addEventListener(
      "olfactus:deal-history-updated",
      refresh,
    );
    window.addEventListener(
      "storage",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "olfactus:deal-history-updated",
        refresh,
      );
      window.removeEventListener(
        "storage",
        refresh,
      );
    };
  }, [refresh]);

  return {
    history,
    hydrated,
    refresh,
    clear: clearDealHistory,
  };
}
