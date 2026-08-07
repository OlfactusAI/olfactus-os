import type {
  MemoryEvent,
  MemoryInsight,
} from "@/lib/memory/types";
import {
  countEntityEvents,
  summarizeMemory,
} from "@/lib/memory/queries";

export function generateMemoryInsights(
  events:
    MemoryEvent[],
): MemoryInsight[] {
  const insights:
    MemoryInsight[] = [];
  const now =
    new Date().toISOString();
  const summary =
    summarizeMemory(
      events,
    );

  if (
    summary.mostWornFragranceId &&
    summary.mostWornCount >=
      3
  ) {
    insights.push({
      id:
        `memory-insight:most-worn:${summary.mostWornFragranceId}`,
      category:
        "rotation",
      title:
        "Rotation leader",
      statement:
        `${summary.mostWornFragranceId} is your most frequently recorded wear with ${summary.mostWornCount} memory events.`,
      confidence:
        confidenceFromEvidence(
          summary.mostWornCount,
        ),
      evidenceCount:
        summary.mostWornCount,
      generatedAt: now,
      relatedEntityIds: [
        summary.mostWornFragranceId,
      ],
    });
  }

  if (
    summary.recommendationShownCount >=
      3 &&
    summary.recommendationAcceptanceRate !==
      undefined
  ) {
    insights.push({
      id:
        "memory-insight:recommendation-acceptance",
      category:
        "recommendation",
      title:
        "Recommendation behavior",
      statement:
        `You accepted ${summary.recommendationAcceptanceRate}% of recorded recommendations.`,
      confidence:
        confidenceFromEvidence(
          summary.recommendationShownCount,
        ),
      evidenceCount:
        summary.recommendationShownCount,
      generatedAt: now,
      relatedEntityIds: [],
    });
  }

  const viewed =
    countEntityEvents({
      events,
      type:
        "fragrance-viewed",
      entityType:
        "fragrance",
    })[0];

  if (
    viewed &&
    viewed[1] >=
      4
  ) {
    insights.push({
      id:
        `memory-insight:repeated-view:${viewed[0]}`,
      category:
        "behavior",
      title:
        "Repeated consideration",
      statement:
        `${viewed[0]} has been opened ${viewed[1]} times, suggesting sustained interest.`,
      confidence:
        confidenceFromEvidence(
          viewed[1],
        ),
      evidenceCount:
        viewed[1],
      generatedAt: now,
      relatedEntityIds: [
        viewed[0],
      ],
    });
  }

  const additions =
    countEntityEvents({
      events,
      type:
        "collection-added",
      entityType:
        "fragrance",
    });

  if (
    additions.length >=
    5
  ) {
    insights.push({
      id:
        "memory-insight:collection-expansion",
      category:
        "collection",
      title:
        "Collection expansion pattern",
      statement:
        `Memory has recorded ${additions.length} distinct fragrance additions.`,
      confidence:
        confidenceFromEvidence(
          additions.length,
        ),
      evidenceCount:
        additions.length,
      generatedAt: now,
      relatedEntityIds:
        additions
          .slice(
            0,
            8,
          )
          .map(
            ([id]) =>
              id,
          ),
    });
  }

  return insights.sort(
    (a, b) =>
      b.confidence -
      a.confidence,
  );
}

function confidenceFromEvidence(
  evidenceCount: number,
) {
  return Math.min(
    96,
    Math.round(
      48 +
        Math.sqrt(
          evidenceCount,
        ) *
          14,
    ),
  );
}
