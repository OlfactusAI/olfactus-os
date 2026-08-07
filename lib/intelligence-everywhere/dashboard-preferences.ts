export type DashboardModule =
  | "wear"
  | "health"
  | "rotation"
  | "events"
  | "memory"
  | "recommendation-trace"
  | "market"
  | "timeline"
  | "simulator";

export interface DashboardPreferences {
  modules:
    DashboardModule[];
  density:
    | "compact"
    | "expanded";
}

export const defaultDashboardPreferences:
  DashboardPreferences = {
    modules: [
      "wear",
      "health",
      "rotation",
      "recommendation-trace",
      "events",
      "memory",
    ],
    density:
      "expanded",
  };

const storageKey =
  "olfactus.dashboard.preferences.v1";

export function readDashboardPreferences(): DashboardPreferences {
  if (
    typeof window ===
    "undefined"
  ) {
    return defaultDashboardPreferences;
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      );
    if (!raw) {
      return defaultDashboardPreferences;
    }

    const parsed =
      JSON.parse(
        raw,
      ) as Partial<DashboardPreferences>;

    return {
      modules:
        Array.isArray(
          parsed.modules,
        )
          ? parsed.modules
          : defaultDashboardPreferences.modules,
      density:
        parsed.density ===
        "compact"
          ? "compact"
          : "expanded",
    };
  } catch {
    return defaultDashboardPreferences;
  }
}

export function writeDashboardPreferences(
  preferences:
    DashboardPreferences,
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
      preferences,
    ),
  );
  window.dispatchEvent(
    new Event(
      "olfactus:dashboard-preferences-updated",
    ),
  );
}
