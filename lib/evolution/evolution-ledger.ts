import type {
  EvolutionLedger,
  EvolutionSnapshot,
} from "@/lib/evolution/types";

export const EVOLUTION_STORAGE_KEY =
  "olfactus.evolution.ledger.v1";

export function createEmptyEvolutionLedger(): EvolutionLedger {
  return {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    snapshots: [],
  };
}

export function readEvolutionLedger(): EvolutionLedger {
  if (typeof window === "undefined") {
    return createEmptyEvolutionLedger();
  }

  try {
    const raw = window.localStorage.getItem(
      EVOLUTION_STORAGE_KEY,
    );

    if (!raw) {
      return createEmptyEvolutionLedger();
    }

    const parsed =
      JSON.parse(raw) as EvolutionLedger;

    if (
      parsed.schemaVersion !== 1 ||
      !Array.isArray(parsed.snapshots)
    ) {
      return createEmptyEvolutionLedger();
    }

    return {
      ...parsed,
      snapshots: parsed.snapshots.map(
        migrateSnapshot,
      ),
    };
  } catch {
    return createEmptyEvolutionLedger();
  }
}

export function writeEvolutionLedger(
  ledger: EvolutionLedger,
) {
  if (typeof window === "undefined") return;

  const snapshots = retainSnapshots(
    deduplicateSnapshots(
      ledger.snapshots.map(
        migrateSnapshot,
      ),
    ),
  );

  window.localStorage.setItem(
    EVOLUTION_STORAGE_KEY,
    JSON.stringify({
      ...ledger,
      snapshots,
    }),
  );

  window.dispatchEvent(
    new CustomEvent(
      "olfactus:evolution-updated",
    ),
  );
}

export function appendEvolutionSnapshot(
  snapshot: EvolutionSnapshot,
) {
  const ledger =
    readEvolutionLedger();

  ledger.snapshots.push(snapshot);
  writeEvolutionLedger(ledger);

  return snapshot;
}

export function clearEvolutionLedger() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(
    EVOLUTION_STORAGE_KEY,
  );

  window.dispatchEvent(
    new CustomEvent(
      "olfactus:evolution-updated",
    ),
  );
}

function deduplicateSnapshots(
  snapshots: EvolutionSnapshot[],
) {
  const byId = new Map<
    string,
    EvolutionSnapshot
  >();

  for (const snapshot of snapshots) {
    byId.set(snapshot.id, snapshot);
  }

  const ordered = [...byId.values()].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() -
      new Date(b.createdAt).getTime(),
  );

  const retained: EvolutionSnapshot[] = [];

  for (const snapshot of ordered) {
    const previous = retained.at(-1);

    if (
      previous &&
      snapshotFingerprint(previous) ===
        snapshotFingerprint(snapshot) &&
      new Date(snapshot.createdAt).getTime() -
        new Date(previous.createdAt).getTime() <
        21_600_000
    ) {
      continue;
    }

    retained.push(snapshot);
  }

  return retained;
}

function retainSnapshots(
  snapshots: EvolutionSnapshot[],
) {
  if (snapshots.length <= 500) {
    return snapshots;
  }

  const protectedSnapshots =
    snapshots.filter(
      (snapshot) =>
        snapshot.source === "baseline" ||
        snapshot.source === "manual" ||
        snapshot.source === "purchase" ||
        snapshot.captureReason ===
          "annual-review",
    );

  const recentAutomatic = snapshots
    .filter(
      (snapshot) =>
        !protectedSnapshots.some(
          (protectedSnapshot) =>
            protectedSnapshot.id ===
            snapshot.id,
        ),
    )
    .slice(-Math.max(
      0,
      500 - protectedSnapshots.length,
    ));

  return [
    ...protectedSnapshots,
    ...recentAutomatic,
  ]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    )
    .slice(-500);
}

function snapshotFingerprint(
  snapshot: EvolutionSnapshot,
) {
  return JSON.stringify({
    ownedFragranceIds:
      [...snapshot.ownedFragranceIds].sort(),
    totalWears: snapshot.totalWears,
    collectionHealth:
      snapshot.collectionHealth,
    diversity: snapshot.diversity,
    rotation: snapshot.rotation,
    roleCoverage:
      snapshot.roleCoverage,
  });
}

function migrateSnapshot(
  snapshot: EvolutionSnapshot,
): EvolutionSnapshot {
  if (snapshot.captureReason) {
    return snapshot;
  }

  return {
    ...snapshot,
    captureReason:
      snapshot.source === "baseline"
        ? "tracking-started"
        : snapshot.source === "manual"
          ? "manual-capture"
          : snapshot.source === "purchase"
            ? "purchase-impact"
            : "collection-changed",
  };
}
