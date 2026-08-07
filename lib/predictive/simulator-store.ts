import type { ProjectionHorizon } from "@/lib/predictive/simulator-types";

const key = "olfactus.predictive-simulator.scenario.v1";

export interface SavedPredictiveScenario {
  fragranceId: string;
  horizonDays: ProjectionHorizon;
  createdAt: string;
}

export function readPredictiveScenario(): SavedPredictiveScenario | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SavedPredictiveScenario) : null;
  } catch {
    return null;
  }
}

export function writePredictiveScenario(
  scenario: Omit<SavedPredictiveScenario, "createdAt">,
) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    key,
    JSON.stringify({
      ...scenario,
      createdAt: new Date().toISOString(),
    }),
  );
}

export function clearPredictiveScenario() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(key);
  }
}
