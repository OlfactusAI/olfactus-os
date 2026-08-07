import type {
  ReferenceCertificationAuditRecord,
  ReferenceGoldStandardCertificate,
  ReferenceProductionPromotionQueueItem,
} from "@/lib/reference-lab/certification-types";
import type {
  ReferenceCalibrationVersion,
} from "@/lib/reference-lab/types";

const certificateKey =
  "olfactus:reference-lab:gold-certificates:v1";

const auditKey =
  "olfactus:reference-lab:certification-audit:v1";

const promotionQueueKey =
  "olfactus:reference-lab:production-promotion-queue:v1";

const certifiedVersionsKey =
  "olfactus:reference-lab:certified-versions:v1";

export function loadReferenceGoldStandardCertificates() {
  return loadArray<
    ReferenceGoldStandardCertificate
  >(
    certificateKey,
  );
}

export function saveReferenceGoldStandardCertificate(
  certificate:
    ReferenceGoldStandardCertificate,
) {
  return upsert(
    certificateKey,
    certificate,
    (item) =>
      item.certificateId,
  );
}

export function loadReferenceCertificationAudit() {
  return loadArray<
    ReferenceCertificationAuditRecord
  >(
    auditKey,
  );
}

export function saveReferenceCertificationAuditRecord(
  record:
    ReferenceCertificationAuditRecord,
) {
  return upsert(
    auditKey,
    record,
    (item) =>
      item.auditId,
  );
}

export function loadReferenceProductionPromotionQueue() {
  return loadArray<
    ReferenceProductionPromotionQueueItem
  >(
    promotionQueueKey,
  );
}

export function saveReferenceProductionPromotionQueueItem(
  item:
    ReferenceProductionPromotionQueueItem,
) {
  return upsert(
    promotionQueueKey,
    item,
    (current) =>
      current.queueId,
  );
}

export function loadCertifiedReferenceVersions() {
  return loadArray<
    ReferenceCalibrationVersion
  >(
    certifiedVersionsKey,
  );
}

export function saveCertifiedReferenceVersion(
  version:
    ReferenceCalibrationVersion,
) {
  return upsert(
    certifiedVersionsKey,
    version,
    (item) =>
      item.versionId,
  );
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

function upsert<T>(
  key: string,
  value: T,
  getId: (
    item: T,
  ) => string,
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const current =
    loadArray<T>(
      key,
    );

  const next = [
    ...current.filter(
      (item) =>
        getId(
          item,
        ) !==
        getId(
          value,
        ),
    ),
    value,
  ];

  window.localStorage.setItem(
    key,
    JSON.stringify(
      next,
    ),
  );

  return next;
}
