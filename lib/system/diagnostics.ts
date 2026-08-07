import { olfactusSystemManifest } from "@/lib/os/system-manifest";
import { readRecoveryLedger } from "@/lib/recovery/action-ledger";
import { estimateLocalStorageUsage } from "@/lib/system/backup";
import { readTimelineLedger } from "@/lib/timeline/event-ledger";
import { loadSimulationScenarios } from "@/lib/simulator/scenario-storage";
import { loadImportedCatalog } from "@/lib/database/import/storage";
import { assessImportedFragranceReadiness } from "@/lib/database/imported-readiness";

export function collectSystemDiagnostics() {
  const imported = loadImportedCatalog();
  const readiness = imported.reduce(
    (counts, item) => {
      const level = assessImportedFragranceReadiness(item).level;
      counts[level] += 1;
      return counts;
    },
    { ready: 0, partial: 0, "search-only": 0, blocked: 0 },
  );
  const recovery = readRecoveryLedger();
  return {
    version: olfactusSystemManifest.version,
    release: olfactusSystemManifest.release,
    engineCount: olfactusSystemManifest.engines.length,
    importedCount: imported.length,
    timelineEvents: readTimelineLedger().events.length,
    savedScenarios: loadSimulationScenarios().length,
    localStorage: estimateLocalStorageUsage(),
    readiness,
    undoCount: recovery.past.length,
    redoCount: recovery.future.length,
  };
}
