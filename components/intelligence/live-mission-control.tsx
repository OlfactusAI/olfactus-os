"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useActiveFragranceCatalog,
} from "@/components/providers/active-catalog-provider";
import {
  useCollection,
} from "@/components/providers/collection-provider";
import {
  ContextPanel,
} from "@/components/intelligence/context-panel";
import {
  DashboardCustomizer,
} from "@/components/intelligence/dashboard-customizer";
import {
  ExplainedScoreCard,
} from "@/components/intelligence/explained-score";
import {
  IntelligenceEventFeed,
} from "@/components/intelligence/intelligence-event-feed";
import {
  MemoryInsights,
} from "@/components/intelligence/memory-insights";
import {
  RecommendationTraceView,
} from "@/components/intelligence/recommendation-trace";
import {
  defaultDashboardPreferences,
} from "@/lib/intelligence-everywhere/dashboard-preferences";
import type {
  DashboardPreferences,
} from "@/lib/intelligence-everywhere/dashboard-preferences";
import {
  buildCollectionHealthExplanation,
} from "@/lib/intelligence-everywhere/explain-score";
import {
  buildCollectionSignal,
  buildLiveCollectionSnapshot,
  chooseLiveWearRecommendation,
} from "@/lib/intelligence-everywhere/live-selectors";
import {
  synchronizeLiveIntelligenceEvents,
} from "@/lib/intelligence-everywhere/live-events";
import {
  buildRecommendationTrace,
} from "@/lib/intelligence-everywhere/recommendation-trace";

export function LiveMissionControl() {
  const {
    catalog,
  } =
    useActiveFragranceCatalog();
  const collectionContext =
    useCollection() as unknown as {
      collection?: Array<{
        fragranceId: string;
        wearCount?: number;
        lastWornAt?: string;
        acquiredAt?: string;
        purchasePrice?: number;
      }>;
      items?: Array<{
        fragranceId: string;
        wearCount?: number;
        lastWornAt?: string;
        acquiredAt?: string;
        purchasePrice?: number;
      }>;
      analysis?: {
        healthScore?: number;
        redundancy?: number;
        diversity?: number;
        rotationBalance?: number;
      };
    };

  const collection =
    collectionContext.collection ??
    collectionContext.items ??
    [];
  const analysis =
    collectionContext.analysis ??
    {};

  const [
    preferences,
    setPreferences,
  ] =
    useState<DashboardPreferences>(
      defaultDashboardPreferences,
    );

  const onPreferencesChange =
    useCallback(
      (
        next:
          DashboardPreferences,
      ) => {
        setPreferences(
          next,
        );
      },
      [],
    );

  const snapshot =
    useMemo(
      () =>
        buildLiveCollectionSnapshot({
          collection,
          catalog,
          healthScore:
            analysis.healthScore,
          redundancyScore:
            analysis.redundancy,
          diversityScore:
            analysis.diversity,
          rotationScore:
            analysis.rotationBalance,
        }),
      [
        collection,
        catalog,
        analysis.healthScore,
        analysis.redundancy,
        analysis.diversity,
        analysis.rotationBalance,
      ],
    );

  const recommendation =
    useMemo(
      () =>
        chooseLiveWearRecommendation({
          collection,
          catalog,
        }),
      [
        collection,
        catalog,
      ],
    );

  const signal =
    buildCollectionSignal(
      snapshot,
    );

  const catalogById =
    useMemo(
      () =>
        new Map(
          catalog.map(
            (item) => [
              item.id,
              item,
            ],
          ),
        ),
      [catalog],
    );

  const neglectedName =
    snapshot.neglectedFragranceId
      ? catalogById.get(
          snapshot.neglectedFragranceId,
        )?.name ??
        snapshot.neglectedFragranceId
      : undefined;

  useEffect(() => {
    synchronizeLiveIntelligenceEvents(
      snapshot,
    );
  }, [
    snapshot,
  ]);

  const modules =
    new Set(
      preferences.modules,
    );

  return (
    <section
      className={`mission-control-grid mt-6 dashboard-${preferences.density}`}
    >
      <div className="mission-control-main">
        <div className="mission-control-title-row">
          <div>
            <p className="layer3-kicker">
              Intelligence Dashboard 2.0
            </p>
            <h2 className="display-serif mt-3 text-5xl">
              Mission control for your fragrance life.
            </h2>
          </div>

          <DashboardCustomizer
            onChange={
              onPreferencesChange
            }
          />
        </div>

        {!collection.length ? (
          <div className="live-intelligence-empty">
            <strong>
              Live intelligence is waiting for collection data.
            </strong>
            <p>
              Add fragrances or activate imported records. OLFACTUS will not display demonstration scores as personal results.
            </p>
          </div>
        ) : null}

        <div className="mission-control-score-grid mt-5">
          {modules.has(
            "health",
          ) ? (
            <ExplainedScoreCard
              explanation={buildCollectionHealthExplanation({
                healthScore:
                  snapshot.healthScore,
                roleCoverage:
                  snapshot.roleCoverage,
                seasonalBalance:
                  snapshot.seasonalBalance,
                dnaDiversity:
                  snapshot.dnaDiversity,
                redundancy:
                  snapshot.redundancy,
                rotationBalance:
                  snapshot.rotationBalance,
              })}
            />
          ) : null}

          {modules.has(
            "wear",
          ) ||
          modules.has(
            "rotation",
          ) ? (
            <ContextPanel
              title="Live Collection"
              items={[
                modules.has(
                  "wear",
                )
                  ? {
                      label:
                        "Best Wear",
                      value:
                        recommendation?.fragranceName ??
                        "Unavailable",
                      note:
                        recommendation?.reason ??
                        "No active collection recommendation can be calculated.",
                    }
                  : null,
                modules.has(
                  "rotation",
                )
                  ? {
                      label:
                        "Next Rotation",
                      value:
                        neglectedName ??
                        "Unavailable",
                      note:
                        snapshot.neglectedDays !==
                        undefined
                          ? `${snapshot.neglectedDays} days since last wear.`
                          : "Wear history is not available.",
                    }
                  : null,
                {
                  label:
                    "Collection Signal",
                  value:
                    signal.label,
                  note:
                    signal.note,
                },
              ].filter(
                (
                  item,
                ): item is {
                  label: string;
                  value: string;
                  note: string;
                } =>
                  Boolean(item),
              )}
            />
          ) : null}
        </div>

        {modules.has(
          "recommendation-trace",
        ) &&
        recommendation ? (
          <RecommendationTraceView
            trace={buildRecommendationTrace({
              recommendation:
                recommendation.fragranceName,
              confidence:
                recommendation.confidence,
              weather:
                "Weather evidence unavailable",
              collection:
                `${snapshot.collectionSize} active bottles`,
              roleGap:
                signal.label,
              budget:
                "Owned fragrance",
              dnaDiversity:
                `${snapshot.dnaDiversity}% collection diversity`,
              performance:
                `${recommendation.score} live wear score`,
            })}
          />
        ) : null}

        {modules.has(
          "market",
        ) ? (
          <div className="live-evidence-unavailable">
            <strong>
              Market intelligence unavailable
            </strong>
            <p>
              No current price feed is connected. OLFACTUS will not fabricate value trends.
            </p>
          </div>
        ) : null}

        {modules.has(
          "simulator",
        ) ? (
          <div className="live-evidence-unavailable">
            <strong>
              No active simulator scenario
            </strong>
            <p>
              Create or load a scenario to display projected collection changes here.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mission-control-side">
        {modules.has(
          "events",
        ) ? (
          <IntelligenceEventFeed />
        ) : null}

        {modules.has(
          "memory",
        ) ? (
          <MemoryInsights />
        ) : null}

        {modules.has(
          "timeline",
        ) ? (
          <div className="live-evidence-unavailable">
            <strong>
              Timeline module
            </strong>
            <p>
              Timeline events remain available in the Timeline workspace.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
