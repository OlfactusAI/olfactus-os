import type {
  ProductionActivationAuditRecord,
  RuntimeReferenceEntity,
} from "@/lib/production-activation/types";

const runtimeKey =
  "olfactus:production-activation:runtime-references:v1";

const auditKey =
  "olfactus:production-activation:audit:v1";

export function loadRuntimeReferences():
  RuntimeReferenceEntity[] {
  return loadArray<
    RuntimeReferenceEntity
  >(
    runtimeKey,
  );
}

export function saveRuntimeReference(
  entity:
    RuntimeReferenceEntity,
) {
  const current =
    loadRuntimeReferences();

  const next = [
    ...current.filter(
      (item) =>
        item.referenceId !==
        entity.referenceId,
    ),
    entity,
  ];

  saveArray(
    runtimeKey,
    next,
  );

  return next;
}

export function removeRuntimeReference(
  referenceId: string,
) {
  const current =
    loadRuntimeReferences();

  const next =
    current.filter(
      (item) =>
        item.referenceId !==
        referenceId,
    );

  saveArray(
    runtimeKey,
    next,
  );

  return next;
}

export function loadProductionActivationAudit():
  ProductionActivationAuditRecord[] {
  return loadArray<
    ProductionActivationAuditRecord
  >(
    auditKey,
  );
}

export function appendProductionActivationAudit(
  record:
    ProductionActivationAuditRecord,
) {
  const current =
    loadProductionActivationAudit();

  const next = [
    ...current,
    record,
  ];

  saveArray(
    auditKey,
    next,
  );

  return next;
}

function loadArray<T>(
  key: string,
): T[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const raw =
    window.localStorage.getItem(
      key,
    );

  if (!raw) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        raw,
      ) as T[];

    return Array.isArray(
      parsed,
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveArray<T>(
  key: string,
  value: T[],
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    key,
    JSON.stringify(
      value,
    ),
  );
}
