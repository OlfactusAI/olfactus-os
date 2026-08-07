import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";

const storageKey =
  "olfactus:reference-registry:v1";

export function loadReferenceRegistry():
  ReferenceRegistryRecord[] {
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
      ) as ReferenceRegistryRecord[];

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function saveReferenceRegistry(
  records:
    ReferenceRegistryRecord[],
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
      records,
    ),
  );
}

export function upsertReferenceRegistryRecord(
  record:
    ReferenceRegistryRecord,
) {
  const current =
    loadReferenceRegistry();

  const next = [
    ...current.filter(
      (item) =>
        item.referenceId !==
        record.referenceId,
    ),
    record,
  ];

  saveReferenceRegistry(
    next,
  );

  return next;
}
