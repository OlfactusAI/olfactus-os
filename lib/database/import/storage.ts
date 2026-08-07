import type { FragranceRecord } from "@/lib/domain/fragrance";
import type { ImportCommitReport } from "@/lib/database/import/types";

const catalogKey = "olfactus:imported-catalog:v1";
const reportKey = "olfactus:last-import-report:v1";

export function loadImportedCatalog() {
  if (typeof window === "undefined") return [] as FragranceRecord[];
  try {
    const raw = window.localStorage.getItem(catalogKey);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as FragranceRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveImportedCatalog(catalog: FragranceRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(catalogKey, JSON.stringify(catalog));
  window.dispatchEvent(new Event("olfactus:active-catalog-refresh"));
}

export function clearImportedCatalog() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(catalogKey);
  window.dispatchEvent(new Event("olfactus:active-catalog-refresh"));
}

export function loadLastImportReport() {
  if (typeof window === "undefined") return null as ImportCommitReport | null;
  try {
    const raw = window.localStorage.getItem(reportKey);
    return raw ? (JSON.parse(raw) as ImportCommitReport) : null;
  } catch {
    return null;
  }
}

export function saveLastImportReport(report: ImportCommitReport) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(reportKey, JSON.stringify(report));
}
