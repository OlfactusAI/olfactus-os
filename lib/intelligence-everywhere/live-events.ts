import {
  appendIntelligenceEvent,
  generateCollectionHealthEvent,
} from "@/lib/intelligence-everywhere/events";
import type {
  LiveCollectionSnapshot,
} from "@/lib/intelligence-everywhere/live-selectors";

const healthStorageKey =
  "olfactus.intelligence.previous-health.v1";

export function synchronizeLiveIntelligenceEvents(
  snapshot:
    LiveCollectionSnapshot,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const previous =
    Number(
      window.localStorage.getItem(
        healthStorageKey,
      ),
    );

  if (
    Number.isFinite(
      previous,
    )
  ) {
    const event =
      generateCollectionHealthEvent({
        previousScore:
          previous,
        nextScore:
          snapshot.healthScore,
      });

    if (event) {
      appendIntelligenceEvent(
        event,
      );
    }
  }

  window.localStorage.setItem(
    healthStorageKey,
    String(
      snapshot.healthScore,
    ),
  );

  if (
    snapshot.neglectedFragranceId &&
    (snapshot.neglectedDays ??
      0) >=
      45
  ) {
    appendIntelligenceEvent({
      id:
        `neglected:${snapshot.neglectedFragranceId}:${Math.floor(
          (snapshot.neglectedDays ??
            0) /
            15,
        )}`,
      type:
        "rotation-streak",
      title:
        "Rotation Attention Needed",
      summary:
        `${snapshot.neglectedFragranceId} has not been worn for ${snapshot.neglectedDays} days.`,
      createdAt:
        new Date().toISOString(),
      severity:
        "warning",
      metadata: {
        fragranceId:
          snapshot.neglectedFragranceId,
        days:
          snapshot.neglectedDays,
      },
    });
  }

  if (
    snapshot.collectionSize > 0 &&
    snapshot.collectionSize %
      10 ===
      0
  ) {
    appendIntelligenceEvent({
      id:
        `collection-milestone:${snapshot.collectionSize}`,
      type:
        "collection-milestone",
      title:
        `${snapshot.collectionSize}-Bottle Milestone`,
      summary:
        `Your active collection reached ${snapshot.collectionSize} bottles.`,
      createdAt:
        new Date().toISOString(),
      severity:
        "positive",
      metadata: {
        collectionSize:
          snapshot.collectionSize,
      },
    });
  }
}
