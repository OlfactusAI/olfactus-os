"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  usePathname,
} from "next/navigation";

import type {
  CollectorDnaTrait,
  MemoryEvent,
  MemoryInsight,
  MemoryQuerySummary,
} from "@/lib/memory/types";
import {
  appendMemoryEvent,
  clearMemoryLedger,
  exportMemoryLedger,
  importMemoryLedger,
  readMemoryLedger,
  subscribeMemoryLedger,
} from "@/lib/memory/store";
import {
  summarizeMemory,
} from "@/lib/memory/queries";
import {
  generateMemoryInsights,
} from "@/lib/memory/learning";
import {
  calculateCollectorDna,
} from "@/lib/memory/collector-dna";

interface MemoryContextValue {
  hydrated: boolean;
  events:
    MemoryEvent[];
  summary:
    MemoryQuerySummary;
  insights:
    MemoryInsight[];
  collectorDna:
    CollectorDnaTrait[];
  record:
    typeof appendMemoryEvent;
  clear: () =>
    void;
  exportLedger: () =>
    string;
  importLedger:
    (raw: string) =>
      void;
}

const MemoryContext =
  createContext<MemoryContextValue | null>(
    null,
  );

export function MemoryProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const pathname =
    usePathname();
  const [
    hydrated,
    setHydrated,
  ] =
    useState(false);
  const [
    events,
    setEvents,
  ] =
    useState<MemoryEvent[]>(
      [],
    );
  const previousPath =
    useRef<string | null>(
      null,
    );

  function refresh() {
    setEvents(
      readMemoryLedger()
        .events,
    );
  }

  useEffect(() => {
    refresh();
    setHydrated(true);

    return subscribeMemoryLedger(
      refresh,
    );
  }, []);

  useEffect(() => {
    if (
      !hydrated ||
      previousPath.current ===
        pathname
    ) {
      return;
    }

    previousPath.current =
      pathname;

    appendMemoryEvent({
      type:
        "navigation",
      source:
        "navigation",
      entity: {
        type:
          "workspace",
        id:
          pathname,
        label:
          pathname,
      },
      confidence: 100,
      metadata: {
        pathname,
      },
      id:
        `memory:navigation:${pathname}:${new Date()
          .toISOString()
          .slice(0, 16)}`,
    });
  }, [
    hydrated,
    pathname,
  ]);

  const summary =
    useMemo(
      () =>
        summarizeMemory(
          events,
        ),
      [events],
    );
  const insights =
    useMemo(
      () =>
        generateMemoryInsights(
          events,
        ),
      [events],
    );
  const collectorDna =
    useMemo(
      () =>
        calculateCollectorDna(
          events,
        ),
      [events],
    );

  const value =
    useMemo<MemoryContextValue>(
      () => ({
        hydrated,
        events,
        summary,
        insights,
        collectorDna,
        record:
          appendMemoryEvent,
        clear:
          clearMemoryLedger,
        exportLedger:
          exportMemoryLedger,
        importLedger: (
          raw,
        ) => {
          importMemoryLedger(
            raw,
          );
        },
      }),
      [
        hydrated,
        events,
        summary,
        insights,
        collectorDna,
      ],
    );

  return (
    <MemoryContext.Provider
      value={value}
    >
      {children}
    </MemoryContext.Provider>
  );
}

export function useMemoryEngine() {
  const context =
    useContext(
      MemoryContext,
    );

  if (!context) {
    throw new Error(
      "useMemoryEngine must be used within MemoryProvider",
    );
  }

  return context;
}
