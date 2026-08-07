"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";

import {
  useActiveFragranceCatalog,
} from "@/components/providers/active-catalog-provider";
import {
  useCollection,
} from "@/components/providers/collection-provider";
import {
  useMemoryEngine,
} from "@/components/providers/memory-provider";
import {
  calculatePredictionCalibration,
} from "@/lib/predictive/calibration";
import { demoProfile } from "@/lib/data/demo";
import { forecastCollection } from "@/lib/prediction/collection-forecast";
import {
  buildPredictiveSnapshot,
} from "@/lib/predictive/prediction-engine";

type PredictiveContextValue = {
  hydrated: boolean;
  snapshot:
    ReturnType<
      typeof buildPredictiveSnapshot
    >;
  calibration:
    ReturnType<
      typeof calculatePredictionCalibration
    >;
  collectionForecast:
    ReturnType<
      typeof forecastCollection
    >;
};

const PredictiveContext =
  createContext<PredictiveContextValue | null>(
    null,
  );

export function PredictiveProvider({
  children,
}: {
  children:
    React.ReactNode;
}) {
  const {
    catalog,
  } =
    useActiveFragranceCatalog();
  const {
    items,
    hydrated:
      collectionHydrated,
  } =
    useCollection();
  const {
    events,
    hydrated:
      memoryHydrated,
  } =
    useMemoryEngine();

  const snapshot =
    useMemo(
      () =>
        buildPredictiveSnapshot({
          collection:
            items,
          catalog,
          events,
        }),
      [
        items,
        catalog,
        events,
      ],
    );

  const calibration =
    useMemo(
      () =>
        calculatePredictionCalibration(
          events,
        ),
      [events],
    );

  const collectionForecast =
    useMemo(
      () =>
        forecastCollection({
          collection:
            items,
          catalog,
          profile:
            demoProfile,
          events,
        }),
      [
        items,
        catalog,
        events,
      ],
    );

  const value =
    useMemo(
      () => ({
        hydrated:
          collectionHydrated &&
          memoryHydrated,
        snapshot,
        calibration,
        collectionForecast,
      }),
      [
        collectionHydrated,
        memoryHydrated,
        snapshot,
        calibration,
        collectionForecast,
      ],
    );

  return (
    <PredictiveContext.Provider
      value={value}
    >
      {children}
    </PredictiveContext.Provider>
  );
}

export function usePredictiveIntelligence() {
  const context =
    useContext(
      PredictiveContext,
    );

  if (!context) {
    throw new Error(
      "usePredictiveIntelligence must be used within PredictiveProvider",
    );
  }

  return context;
}
