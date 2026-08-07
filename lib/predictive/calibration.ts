import type {
  MemoryEvent,
} from "@/lib/memory/types";

export interface PredictionCalibration {
  shown: number;
  accepted: number;
  ignored: number;
  acceptanceRate?: number;
  calibrationConfidence: number;
  state:
    | "insufficient"
    | "learning"
    | "calibrated";
}

export function calculatePredictionCalibration(
  events:
    MemoryEvent[],
): PredictionCalibration {
  const shown =
    events.filter(
      (event) =>
        event.type ===
        "recommendation-shown",
    ).length;
  const accepted =
    events.filter(
      (event) =>
        event.type ===
        "recommendation-accepted",
    ).length;
  const ignored =
    events.filter(
      (event) =>
        event.type ===
        "recommendation-ignored",
    ).length;
  const outcomes =
    accepted +
    ignored;

  return {
    shown,
    accepted,
    ignored,
    acceptanceRate:
      outcomes
        ? Math.round(
            accepted /
              outcomes *
              100,
          )
        : undefined,
    calibrationConfidence:
      Math.min(
        96,
        Math.round(
          40 +
            Math.sqrt(
              outcomes,
            ) *
              18,
        ),
      ),
    state:
      outcomes >=
      12
        ? "calibrated"
        : outcomes >=
            3
          ? "learning"
          : "insufficient",
  };
}
