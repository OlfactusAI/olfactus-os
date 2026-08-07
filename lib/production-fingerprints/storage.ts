import type {
  ProductionFingerprintBundle,
} from "@/lib/production-fingerprints/types";

const storageKey =
  "olfactus:production-fingerprints:bundles:v1";

export function loadProductionFingerprintBundles():
  ProductionFingerprintBundle[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const raw =
    window.localStorage.getItem(
      storageKey,
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        raw,
      ) as ProductionFingerprintBundle[];

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveProductionFingerprintBundle(
  bundle:
    ProductionFingerprintBundle,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const current =
    loadProductionFingerprintBundles();

  const next = [
    ...current.filter(
      (item) =>
        !(
          item.referenceId ===
            bundle.referenceId &&
          item.versionId ===
            bundle.versionId
        ),
    ),
    bundle,
  ];

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(
      next,
    ),
  );

  return next;
}
