"use client";

import { useCallback, useEffect, useState } from "react";

import {
  clearTimelineLedger,
  readTimelineLedger,
} from "@/lib/timeline/event-ledger";
import type { TimelineLedger } from "@/lib/timeline/types";

export function useTimelineLedger() {
  const [ledger, setLedger] =
    useState<TimelineLedger>(() => ({
      schemaVersion: 1,
      createdAt: new Date().toISOString(),
      events: [],
    }));
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(() => {
    setLedger(readTimelineLedger());
  }, []);

  useEffect(() => {
    refresh();
    setHydrated(true);

    window.addEventListener(
      "olfactus:timeline-updated",
      refresh,
    );
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        "olfactus:timeline-updated",
        refresh,
      );
      window.removeEventListener("storage", refresh);
    };
  }, [refresh]);

  function clear() {
    clearTimelineLedger();
    refresh();
  }

  return {
    ledger,
    hydrated,
    refresh,
    clear,
  };
}
