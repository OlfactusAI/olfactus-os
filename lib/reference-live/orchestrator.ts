import {
  activateProductionReference,
} from "@/lib/production-activation/bridge";
import {
  appendProductionActivationAudit,
  loadRuntimeReferences,
  saveRuntimeReference,
} from "@/lib/production-activation/storage";
import {
  loadProductionActivationPackages,
  loadProductionPromotions,
  saveProductionPromotion,
} from "@/lib/production-pipeline/storage";
import {
  loadProductionFingerprintBundles,
} from "@/lib/production-fingerprints/storage";
import {
  loadReferenceGoldStandardCertificates,
} from "@/lib/reference-lab/certification-storage";
import {
  loadReferenceConsensusRuns,
} from "@/lib/reference-lab/consensus-storage";
import {
  loadReferenceRegistry,
  saveReferenceRegistry,
} from "@/lib/reference-registry/storage";
import type {
  LiveReferenceTrace,
} from "@/lib/reference-live/types";

export function traceLiveReference(
  fragranceId: string,
): LiveReferenceTrace {
  const consensusRuns =
    loadReferenceConsensusRuns()
      .filter(
        (run) =>
          run.fragranceId ===
          fragranceId,
      );

  const certificates =
    loadReferenceGoldStandardCertificates()
      .filter(
        (certificate) =>
          certificate.fragranceId ===
          fragranceId,
      );

  const registryRecords =
    loadReferenceRegistry()
      .filter(
        (record) =>
          record.fragranceId ===
          fragranceId,
      );

  const latestCertificate =
    [...certificates]
      .sort(
        (a, b) =>
          a.issuedAt.localeCompare(
            b.issuedAt,
          ),
      )
      .at(-1);

  const registryRecord =
    registryRecords.find(
      (record) =>
        record.currentCertificateId ===
        latestCertificate
          ?.certificateId,
    ) ??
    registryRecords[
      0
    ];

  const consensusRun =
    latestCertificate
      ? consensusRuns.find(
          (run) =>
            run.snapshot
              .consensusId ===
              latestCertificate
                .consensusId &&
            run.versionId ===
              latestCertificate
                .versionId,
        )
      : undefined;

  const fingerprintBundle =
    registryRecord
      ? loadProductionFingerprintBundles()
          .find(
            (bundle) =>
              bundle.referenceId ===
                registryRecord.referenceId &&
              bundle.versionId ===
                registryRecord.currentVersionId &&
              bundle.certificateId ===
                registryRecord.currentCertificateId &&
              bundle.sourceConsensusId ===
                registryRecord.certificate
                  .consensusId,
          )
      : undefined;

  const promotion =
    registryRecord
      ? loadProductionPromotions()
          .find(
            (item) =>
              item.referenceId ===
                registryRecord.referenceId &&
              item.versionId ===
                registryRecord.currentVersionId &&
              item.certificateId ===
                registryRecord.currentCertificateId,
          )
      : undefined;

  const activationPackage =
    promotion
      ? loadProductionActivationPackages()
          .find(
            (item) =>
              item.promotionId ===
                promotion.promotionId &&
              item.referenceId ===
                promotion.referenceId &&
              item.versionId ===
                promotion.versionId &&
              item.certificateId ===
                promotion.certificateId,
          )
      : undefined;

  const runtimeEntity =
    registryRecord
      ? loadRuntimeReferences()
          .find(
            (item) =>
              item.referenceId ===
                registryRecord.referenceId &&
              item.versionId ===
                registryRecord.currentVersionId &&
              item.certificateId ===
                registryRecord.currentCertificateId,
          )
      : undefined;

  const checks =
    [
      {
        stage:
          "consensus" as const,
        passed:
          Boolean(
            consensusRun &&
            consensusRun
              .snapshot
              .metrics
              .length >
              0 &&
            consensusRun
              .conflicts
              .every(
                (conflict) =>
                  conflict.status !==
                  "open",
              ),
          ),
        detail:
          consensusRun
            ? `${consensusRun.snapshot.metrics.length} consensus metrics · ${consensusRun.snapshot.unresolvedConflictCount} unresolved conflicts.`
            : "No certified Aventus consensus run found.",
      },
      {
        stage:
          "certificate" as const,
        passed:
          Boolean(
            latestCertificate &&
            latestCertificate.locked &&
            latestCertificate
              .unresolvedConflictCount ===
              0,
          ),
        detail:
          latestCertificate
            ? `${latestCertificate.certificateId} · quality ${latestCertificate.referenceQuality}% · evidence ${latestCertificate.evidenceCompleteness}%.`
            : "No Aventus Gold Standard certificate found.",
      },
      {
        stage:
          "registry" as const,
        passed:
          Boolean(
            registryRecord &&
            registryRecord
              .currentCertificateId ===
              latestCertificate
                ?.certificateId,
          ),
        detail:
          registryRecord
            ? `${registryRecord.referenceId} · lifecycle ${registryRecord.lifecycle}.`
            : "Aventus is not registered in the Reference Registry.",
      },
      {
        stage:
          "fingerprints" as const,
        passed:
          Boolean(
            fingerprintBundle &&
            fingerprintBundle.productionReady &&
            fingerprintBundle
              .fingerprints
              .every(
                (fingerprint) =>
                  fingerprint.status ===
                    "complete" &&
                  fingerprint.completeness ===
                    100,
              ),
          ),
        detail:
          fingerprintBundle
            ? `${fingerprintBundle.fingerprints.length} fingerprints · ${fingerprintBundle.overallCompleteness}% bundle completeness.`
            : "No Aventus production fingerprint bundle found.",
      },
      {
        stage:
          "promotion" as const,
        passed:
          Boolean(
            promotion &&
            (
              promotion.status ===
                "approved" ||
              promotion.status ===
                "activated"
            ) &&
            promotion.blockers
              .length ===
              0,
          ),
        detail:
          promotion
            ? `${promotion.promotionId} · ${promotion.status}.`
            : "No Aventus production promotion package found.",
      },
      {
        stage:
          "activation-package" as const,
        passed:
          Boolean(
            activationPackage,
          ),
        detail:
          activationPackage
            ? `${activationPackage.activationId} · ${activationPackage.targetSystems.length} target systems.`
            : "No Aventus activation package found.",
      },
      {
        stage:
          "runtime" as const,
        passed:
          Boolean(
            runtimeEntity,
          ),
        detail:
          runtimeEntity
            ? `${runtimeEntity.runtimeReferenceId} · ${runtimeEntity.fingerprints.length} runtime fingerprints.`
            : "Aventus is not active in the runtime reference registry.",
      },
    ];

  const readyToActivate =
    checks
      .filter(
        (check) =>
          check.stage !==
          "runtime",
      )
      .every(
        (check) =>
          check.passed,
      ) &&
    Boolean(
      activationPackage &&
      promotion &&
      registryRecord &&
      fingerprintBundle,
    );

  return {
    fragranceId,
    checks,
    readyToActivate,
    live:
      Boolean(
        runtimeEntity,
      ),
    consensusRun,
    certificate:
      latestCertificate,
    registryRecord,
    fingerprintBundle,
    promotion,
    activationPackage,
    runtimeEntity,
  };
}

export function activateFirstLiveReference({
  fragranceId,
  actor,
  timestamp,
}: {
  fragranceId: string;
  actor: string;
  timestamp: string;
}) {
  const traceBefore =
    traceLiveReference(
      fragranceId,
    );

  if (
    traceBefore.live
  ) {
    return {
      traceBefore,
      traceAfter:
        traceBefore,
    };
  }

  if (
    !traceBefore.readyToActivate ||
    !traceBefore.activationPackage ||
    !traceBefore.promotion ||
    !traceBefore.registryRecord ||
    !traceBefore.fingerprintBundle
  ) {
    const blockers =
      traceBefore.checks
        .filter(
          (check) =>
            check.stage !==
              "runtime" &&
            !check.passed,
        )
        .map(
          (check) =>
            `${check.stage}: ${check.detail}`,
        );

    throw new Error(
      `First live reference activation blocked. ${blockers.join(" ")}`,
    );
  }

  const result =
    activateProductionReference({
      activationPackage:
        traceBefore.activationPackage,
      promotion:
        traceBefore.promotion,
      registryRecord:
        traceBefore.registryRecord,
      fingerprintBundle:
        traceBefore.fingerprintBundle,
      actor,
      timestamp,
    });

  saveRuntimeReference(
    result.runtimeEntity,
  );

  saveProductionPromotion(
    result.promotion,
  );

  appendProductionActivationAudit(
    result.audit,
  );

  const registry =
    loadReferenceRegistry()
      .map(
        (record) =>
          record.referenceId ===
          result.registryRecord
            .referenceId
            ? result.registryRecord
            : record,
      );

  saveReferenceRegistry(
    registry,
  );

  const traceAfter =
    traceLiveReference(
      fragranceId,
    );

  return {
    traceBefore,
    traceAfter,
  };
}
