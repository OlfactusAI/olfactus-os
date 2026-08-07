import type {
  CollectionItem,
  CollectorProfile,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  simulateCollectionChange,
  type CollectionSimulationResult,
  type SimulationAction,
} from "@/lib/intelligence/neural-collection-simulator";

export interface SimulationStep {
  id: string;
  action: SimulationAction;
  candidateId: string;
  replaceId?: string;
}

export interface SimulationScenarioResult {
  steps:
    Array<{
      step: SimulationStep;
      result:
        CollectionSimulationResult;
    }>;
  projectedCollection:
    CollectionItem[];
  aggregate: {
    healthDelta: number;
    diversityDelta: number;
    redundancyDelta: number;
    rotationDelta: number;
    seasonalDelta: number;
    roleCoverageDelta: number;
    valueDelta: number;
  };
  risk: {
    score: number;
    label: string;
  };
  warnings: string[];
}

export function simulateCollectionScenario({
  steps,
  collection,
  catalog,
  profile,
}: {
  steps: SimulationStep[];
  collection: CollectionItem[];
  catalog: FragranceRecord[];
  profile: CollectorProfile;
}): SimulationScenarioResult {
  let workingCollection =
    collection.map(
      (item) => ({
        ...item,
      }),
    );
  const results:
    SimulationScenarioResult["steps"] =
      [];

  for (const step of steps) {
    const result =
      simulateCollectionChange({
        action:
          step.action,
        candidateId:
          step.candidateId,
        replaceId:
          step.replaceId,
        collection:
          workingCollection,
        catalog,
        profile,
      });

    workingCollection =
      result.projectedCollection;
    results.push({
      step,
      result,
    });
  }

  const first =
    results[0]?.result;
  const last =
    results.at(-1)?.result;

  const metric = (
    key:
      keyof CollectionSimulationResult["metrics"],
  ) => {
    if (!first || !last) {
      return 0;
    }

    return (
      last.metrics[key]
        .projected -
      first.metrics[key]
        .current
    );
  };

  const riskScore =
    results.length
      ? Math.round(
          results.reduce(
            (sum, item) =>
              sum +
              item.result.risk
                .score,
            0,
          ) /
            results.length,
        )
      : 0;

  return {
    steps: results,
    projectedCollection:
      workingCollection,
    aggregate: {
      healthDelta:
        metric("health"),
      diversityDelta:
        metric("diversity"),
      redundancyDelta:
        metric("redundancy"),
      rotationDelta:
        metric("rotation"),
      seasonalDelta:
        metric(
          "seasonCoverage",
        ),
      roleCoverageDelta:
        metric(
          "roleCoverage",
        ),
      valueDelta:
        metric("value"),
    },
    risk: {
      score: riskScore,
      label:
        riskScore < 25
          ? "Low"
          : riskScore < 50
            ? "Moderate"
            : riskScore < 75
              ? "High"
              : "Very high",
    },
    warnings: [
      ...new Set(
        results.flatMap(
          (item) =>
            item.result
              .warnings,
        ),
      ),
    ],
  };
}
