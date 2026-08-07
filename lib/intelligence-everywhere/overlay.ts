import type {
  IntelligenceOverlayData,
} from "@/lib/intelligence-everywhere/types";

export function buildIntelligenceOverlay({
  entityId,
  confidence,
  overlap,
  wearScoreToday,
  collectionRank,
  lastWornDays,
  valueTrend = "unknown",
}: {
  entityId: string;
  confidence: number;
  overlap: number;
  wearScoreToday: number;
  collectionRank: number;
  lastWornDays?: number;
  valueTrend?:
    IntelligenceOverlayData["valueTrend"];
}): IntelligenceOverlayData {
  return {
    entityId,
    confidence:
      clamp(confidence),
    overlap:
      clamp(overlap),
    wearScoreToday:
      clamp(wearScoreToday),
    collectionRank:
      Math.max(
        1,
        Math.round(
          collectionRank,
        ),
      ),
    lastWornDays:
      typeof lastWornDays ===
      "number"
        ? Math.max(
            0,
            Math.round(
              lastWornDays,
            ),
          )
        : undefined,
    recommendation:
      wearScoreToday >= 88
        ? "excellent"
        : wearScoreToday >= 75
          ? "strong"
          : wearScoreToday >= 58
            ? "conditional"
            : "skip",
    valueTrend,
  };
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
