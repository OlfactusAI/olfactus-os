import type {
  ActivatedCatalogV2Entity,
} from "@/lib/catalog-v2/activation/types";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

const storageKey =
  "olfactus:catalog-v2-activations:v1";

export function loadCatalogV2Activations() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [] as ActivatedCatalogV2Entity[];
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

    return Array.isArray(
      parsed,
    )
      ? (
          parsed as ActivatedCatalogV2Entity[]
        )
      : [];
  } catch {
    return [];
  }
}

export function mergeCatalogV2Activations(
  ...groups:
    ActivatedCatalogV2Entity[][]
) {
  const byId =
    new Map<
      string,
      ActivatedCatalogV2Entity
    >();

  for (
    const activation
    of groups.flat()
  ) {
    byId.set(
      activation.canonicalId,
      activation,
    );
  }

  return [
    ...byId.values(),
  ];
}

export function saveCatalogV2Activations(
  activations:
    ActivatedCatalogV2Entity[],
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
      mergeCatalogV2Activations(
        activations,
      ),
    ),
  );

  window.dispatchEvent(
    new Event(
      "olfactus:active-catalog-refresh",
    ),
  );
}

export function commitCatalogV2Activations(
  activations:
    ActivatedCatalogV2Entity[],
) {
  const next =
    mergeCatalogV2Activations(
      loadCatalogV2Activations(),
      activations,
    );

  saveCatalogV2Activations(
    next,
  );

  return next;
}

export function clearCatalogV2Activations() {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    storageKey,
  );

  window.dispatchEvent(
    new Event(
      "olfactus:active-catalog-refresh",
    ),
  );
}

export function loadActivatedIntelligenceCatalogV2(): FragranceRecord[] {
  return loadCatalogV2Activations()
    .map(
      (activation) =>
        activation.fragrance,
    )
    .filter(
      (
        fragrance,
      ): fragrance is FragranceRecord =>
        Boolean(fragrance),
    );
}
