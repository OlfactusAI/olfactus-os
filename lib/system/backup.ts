export interface OlfactusBackup {
  format: "OLFACTUS_BACKUP_V1";
  exportedAt: string;
  appVersion: string;
  data: Record<string, string>;
}

const backedUpKeys = [
  "olfactus.collection.v1",
  "olfactus:imported-catalog:v1",
  "olfactus.simulator.scenarios.v1",
  "olfactus.timeline.ledger.v1",
  "olfactus.search.recent-queries.v1",
  "olfactus.search.recent-entities.v1",
  "olfactus.assistant.feedback.v1",
  "olfactus.graph.selected-node.v1",
  "olfactus.graph.comparison-node.v1",
  "olfactus.recovery.ledger.v1",
];

export function createOlfactusBackup(appVersion: string): OlfactusBackup {
  const data: Record<string, string> = {};
  if (typeof window !== "undefined") {
    for (const key of backedUpKeys) {
      const value = window.localStorage.getItem(key);
      if (value !== null) data[key] = value;
    }
  }
  return {
    format: "OLFACTUS_BACKUP_V1",
    exportedAt: new Date().toISOString(),
    appVersion,
    data,
  };
}

export function downloadOlfactusBackup(appVersion: string) {
  const backup = createOlfactusBackup(appVersion);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `olfactus-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function restoreOlfactusBackup(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid backup.");
  const backup = value as Partial<OlfactusBackup>;
  if (backup.format !== "OLFACTUS_BACKUP_V1" || !backup.data) {
    throw new Error("Unsupported OLFACTUS backup format.");
  }
  for (const [key, storedValue] of Object.entries(backup.data)) {
    if (typeof storedValue === "string") window.localStorage.setItem(key, storedValue);
  }
  window.dispatchEvent(new Event("olfactus:active-catalog-refresh"));
  window.dispatchEvent(new Event("olfactus:timeline-updated"));
  return Object.keys(backup.data).length;
}

export function estimateLocalStorageUsage() {
  if (typeof window === "undefined") return { bytes: 0, kilobytes: 0, keys: 0 };
  let bytes = 0;
  let keys = 0;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key) continue;
    const value = window.localStorage.getItem(key) ?? "";
    bytes += (key.length + value.length) * 2;
    keys += 1;
  }
  return { bytes, kilobytes: Math.round(bytes / 102.4) / 10, keys };
}

export function clearOlfactusCaches() {
  if (typeof window === "undefined") return;
  const preserved = createOlfactusBackup("local");
  window.localStorage.clear();
  for (const [key, value] of Object.entries(preserved.data)) {
    window.localStorage.setItem(key, value);
  }
}
