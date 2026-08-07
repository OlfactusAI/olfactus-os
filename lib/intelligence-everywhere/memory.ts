import type {
  MemoryInsight,
} from "@/lib/intelligence-everywhere/types";

const storageKey =
  "olfactus.memory.insights.v1";

export function readMemoryInsights() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [] as MemoryInsight[];
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      );
    return raw
      ? JSON.parse(raw)
      : [];
  } catch {
    return [];
  }
}

export function writeMemoryInsights(
  insights:
    MemoryInsight[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(
      insights.slice(0, 250),
    ),
  );
  window.dispatchEvent(
    new Event(
      "olfactus:memory-updated",
    ),
  );
}

export function inferWearContextMemory({
  fragranceName,
  context,
  evidenceCount,
}: {
  fragranceName: string;
  context: string;
  evidenceCount: number;
}) {
  if (
    evidenceCount < 3
  ) {
    return null;
  }

  const now =
    new Date().toISOString();

  return {
    id:
      `wear-context:${fragranceName.toLowerCase()}:${context.toLowerCase()}`,
    pattern:
      "wear-context",
    statement:
      `You often wear ${fragranceName} before ${context}.`,
    confidence:
      Math.min(
        96,
        58 +
          evidenceCount *
            7,
      ),
    evidenceCount,
    firstObservedAt: now,
    lastObservedAt: now,
  } satisfies MemoryInsight;
}

export function inferFamilyPreferenceMemory({
  family,
  ownedCount,
  wearShare,
}: {
  family: string;
  ownedCount: number;
  wearShare: number;
}) {
  if (
    ownedCount < 3 ||
    wearShare < 0.25
  ) {
    return null;
  }

  const now =
    new Date().toISOString();

  return {
    id:
      `family-preference:${family.toLowerCase()}`,
    pattern:
      "family-preference",
    statement:
      `${family} is becoming a dominant preference in your collection.`,
    confidence:
      Math.min(
        95,
        Math.round(
          55 +
            ownedCount *
              4 +
            wearShare *
              25,
        ),
      ),
    evidenceCount:
      ownedCount,
    firstObservedAt: now,
    lastObservedAt: now,
  } satisfies MemoryInsight;
}
