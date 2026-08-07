"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  readIntelligenceEvents,
} from "@/lib/intelligence-everywhere/events";
import {
  readMemoryInsights,
} from "@/lib/intelligence-everywhere/memory";
import type {
  IntelligenceEvent,
  MemoryInsight,
} from "@/lib/intelligence-everywhere/types";

interface IntelligenceEverywhereContextValue {
  events:
    IntelligenceEvent[];
  memories:
    MemoryInsight[];
  refresh: () =>
    void;
}

const IntelligenceEverywhereContext =
  createContext<IntelligenceEverywhereContextValue | null>(
    null,
  );

export function IntelligenceEverywhereProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const [
    events,
    setEvents,
  ] =
    useState<IntelligenceEvent[]>(
      [],
    );
  const [
    memories,
    setMemories,
  ] =
    useState<MemoryInsight[]>(
      [],
    );

  function refresh() {
    setEvents(
      readIntelligenceEvents(),
    );
    setMemories(
      readMemoryInsights(),
    );
  }

  useEffect(() => {
    refresh();

    window.addEventListener(
      "olfactus:intelligence-events-updated",
      refresh,
    );
    window.addEventListener(
      "olfactus:memory-updated",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "olfactus:intelligence-events-updated",
        refresh,
      );
      window.removeEventListener(
        "olfactus:memory-updated",
        refresh,
      );
    };
  }, []);

  const value =
    useMemo(
      () => ({
        events,
        memories,
        refresh,
      }),
      [
        events,
        memories,
      ],
    );

  return (
    <IntelligenceEverywhereContext.Provider
      value={value}
    >
      {children}
    </IntelligenceEverywhereContext.Provider>
  );
}

export function useIntelligenceEverywhere() {
  const context =
    useContext(
      IntelligenceEverywhereContext,
    );

  if (!context) {
    throw new Error(
      "useIntelligenceEverywhere must be used within IntelligenceEverywhereProvider",
    );
  }

  return context;
}
