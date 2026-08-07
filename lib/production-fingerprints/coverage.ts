import type {
  ProductionFingerprintBundle,
  ProductionFingerprintKind,
} from "@/lib/production-fingerprints/types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";
import {
  updateRegistryCoverage,
} from "@/lib/reference-registry/registry";

export function synchronizeRegistryCoverageFromFingerprints({
  record,
  bundle,
  timestamp,
}: {
  record:
    ReferenceRegistryRecord;
  bundle:
    ProductionFingerprintBundle;
  timestamp: string;
}) {
  if (
    record.referenceId !==
      bundle.referenceId ||
    record.currentVersionId !==
      bundle.versionId
  ) {
    throw new Error(
      "Fingerprint bundle does not belong to the current registry reference/version.",
    );
  }

  const coverage = {
    similarity:
      completeness(
        bundle,
        "similarity",
      ),
    recommendation:
      completeness(
        bundle,
        "recommendation",
      ),
    collectionTwin:
      completeness(
        bundle,
        "collection-twin",
      ),
    decisionLab:
      completeness(
        bundle,
        "decision-lab",
      ),
    weather:
      completeness(
        bundle,
        "season-weather",
      ),
    blindBuy:
      completeness(
        bundle,
        "blind-buy",
      ),
    globalIntelligence:
      completeness(
        bundle,
        "global-intelligence",
      ),
  };

  return updateRegistryCoverage({
    record,
    coverage,
    timestamp,
  });
}

function completeness(
  bundle:
    ProductionFingerprintBundle,
  kind:
    ProductionFingerprintKind,
) {
  return bundle
    .fingerprints
    .find(
      (fingerprint) =>
        fingerprint.kind ===
        kind,
    )
    ?.completeness ??
    0;
}
