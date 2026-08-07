import type {
  SimulationAction,
} from "@/lib/intelligence/neural-collection-simulator";

export interface StoredSimulationAction {
  id: string;
  action: SimulationAction;
  candidateId: string;
  replaceId?: string;
}

export interface StoredSimulationScenario {
  id: string;
  name: string;
  actions:
    StoredSimulationAction[];
  createdAt: string;
  updatedAt: string;
}

const storageKey =
  "olfactus.simulator.scenarios.v1";

export function loadSimulationScenarios() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [] as StoredSimulationScenario[];
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      );
    const parsed:
      unknown = raw
      ? JSON.parse(raw)
      : [];

    return Array.isArray(parsed)
      ? (parsed as StoredSimulationScenario[])
      : [];
  } catch {
    return [];
  }
}

export function saveSimulationScenario(
  scenario:
    StoredSimulationScenario,
) {
  const existing =
    loadSimulationScenarios();
  const next = [
    scenario,
    ...existing.filter(
      (item) =>
        item.id !==
        scenario.id,
    ),
  ].slice(0, 20);

  write(next);
  return next;
}

export function deleteSimulationScenario(
  scenarioId: string,
) {
  const next =
    loadSimulationScenarios().filter(
      (item) =>
        item.id !==
        scenarioId,
    );
  write(next);
  return next;
}

function write(
  scenarios:
    StoredSimulationScenario[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(scenarios),
  );
}
