"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  clearEvolutionLedger,
  readEvolutionLedger,
} from "@/lib/evolution/evolution-ledger";
import type {
  EvolutionLedger,
} from "@/lib/evolution/types";

export function useEvolutionLedger() {
  const [ledger, setLedger] =
    useState<EvolutionLedger>(() => ({
      schemaVersion: 1,
      createdAt:
        new Date().toISOString(),
      snapshots: [],
    }));
  const [hydrated, setHydrated] =
    useState(false);

  const refresh = useCallback(() => {
    setLedger(readEvolutionLedger());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);

    window.addEventListener(
      "olfactus:evolution-updated",
      refresh,
    );
    window.addEventListener(
      "storage",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "olfactus:evolution-updated",
        refresh,
      );
      window.removeEventListener(
        "storage",
        refresh,
      );
    };
  }, [refresh]);

  function clear() {
    clearEvolutionLedger();
    refresh();
  }

  return {
    ledger,
    hydrated,
    refresh,
    clear,
  };
}
