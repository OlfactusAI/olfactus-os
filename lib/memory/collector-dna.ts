import type {
  CollectorDnaTrait,
  MemoryEvent,
} from "@/lib/memory/types";
import {
  summarizeMemory,
} from "@/lib/memory/queries";

export function calculateCollectorDna(
  events:
    MemoryEvent[],
): CollectorDnaTrait[] {
  const summary =
    summarizeMemory(
      events,
    );

  const comparisons =
    events.filter(
      (event) =>
        event.type ===
        "comparison-executed",
    ).length;
  const searches =
    events.filter(
      (event) =>
        event.type ===
        "search-executed",
    ).length;
  const additions =
    events.filter(
      (event) =>
        event.type ===
        "collection-added",
    ).length;
  const removals =
    events.filter(
      (event) =>
        event.type ===
        "collection-removed",
    ).length;
  const favoriteChanges =
    events.filter(
      (event) =>
        event.type ===
        "favorite-changed",
    ).length;
  const simulations =
    events.filter(
      (event) =>
        event.type ===
        "simulation-created",
    ).length;

  const evidenceTotal =
    Math.max(
      1,
      events.length,
    );

  const traits:
    CollectorDnaTrait[] = [
    trait({
      id: "explorer",
      label: "Explorer",
      score:
        searches * 8 +
        comparisons * 10 +
        additions * 3,
      evidenceCount:
        searches +
        comparisons +
        additions,
      total:
        evidenceTotal,
      explanation:
        "Driven by searches, comparisons, and new additions.",
    }),
    trait({
      id: "curator",
      label: "Curator",
      score:
        removals * 12 +
        comparisons * 6 +
        favoriteChanges * 4,
      evidenceCount:
        removals +
        comparisons +
        favoriteChanges,
      total:
        evidenceTotal,
      explanation:
        "Strengthens when the collection is refined through removal, comparison, and prioritization.",
    }),
    trait({
      id:
        "daily-wearer",
      label:
        "Daily Wearer",
      score:
        summary.wearCount *
        6,
      evidenceCount:
        summary.wearCount,
      total:
        evidenceTotal,
      explanation:
        "Based on recorded wear activity.",
    }),
    trait({
      id:
        "signature-loyalist",
      label:
        "Signature Loyalist",
      score:
        summary.mostWornCount *
        12,
      evidenceCount:
        summary.mostWornCount,
      total:
        evidenceTotal,
      explanation:
        "Increases when one fragrance repeatedly leads the wear history.",
    }),
    trait({
      id:
        "safe-buyer",
      label:
        "Safe Buyer",
      score:
        simulations * 11 +
        comparisons * 8,
      evidenceCount:
        simulations +
        comparisons,
      total:
        evidenceTotal,
      explanation:
        "Reflects comparison and simulation before collection changes.",
    }),
    trait({
      id: "minimalist",
      label: "Minimalist",
      score:
        removals * 10 -
        additions * 2,
      evidenceCount:
        removals +
        additions,
      total:
        evidenceTotal,
      explanation:
        "Rises when removals and refinement outweigh expansion.",
    }),
    trait({
      id: "maximalist",
      label: "Maximalist",
      score:
        additions * 9 -
        removals * 3,
      evidenceCount:
        additions +
        removals,
      total:
        evidenceTotal,
      explanation:
        "Rises when collection expansion consistently exceeds removal.",
    }),
  ];

  return traits
    .filter(
      (item) =>
        item.evidenceCount >
        0,
    )
    .sort(
      (a, b) =>
        b.score -
        a.score,
    );
}

function trait({
  id,
  label,
  score,
  evidenceCount,
  total,
  explanation,
}: {
  id:
    CollectorDnaTrait["id"];
  label: string;
  score: number;
  evidenceCount: number;
  total: number;
  explanation: string;
}): CollectorDnaTrait {
  const normalized =
    Math.max(
      0,
      Math.min(
        100,
        Math.round(score),
      ),
    );

  return {
    id,
    label,
    score:
      normalized,
    confidence:
      Math.min(
        96,
        Math.round(
          45 +
            Math.sqrt(
              evidenceCount,
            ) *
              14 +
            Math.min(
              12,
              total / 20,
            ),
        ),
      ),
    evidenceCount,
    direction:
      evidenceCount >=
      5
        ? "rising"
        : "stable",
    explanation,
  };
}
