"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  evaluateReferenceCertificationReadiness,
  issueReferenceGoldStandardCertification,
} from "@/lib/reference-lab/certification-engine";
import {
  loadReferenceCertificationAudit,
  loadReferenceGoldStandardCertificates,
  loadReferenceProductionPromotionQueue,
  saveCertifiedReferenceVersion,
  saveReferenceCertificationAuditRecord,
  saveReferenceGoldStandardCertificate,
  saveReferenceProductionPromotionQueueItem,
} from "@/lib/reference-lab/certification-storage";
import {
  loadReferenceConsensusRuns,
} from "@/lib/reference-lab/consensus-storage";
import {
  loadReferenceReviewPackages,
} from "@/lib/reference-lab/review-storage";
import type {
  ReferenceCalibrationVersion,
  ReferenceReviewer,
} from "@/lib/reference-lab/types";
import type {
  ReferenceConsensusRun,
} from "@/lib/reference-lab/consensus-types";
import type {
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";

const certifier:
  ReferenceReviewer = {
  reviewerId:
    "reviewer:reference-admin",
  displayName:
    "Reference Administrator",
  role:
    "administrator",
  active: true,
};

export function CertificationWorkspace() {
  const [
    runs,
    setRuns,
  ] =
    useState<
      ReferenceConsensusRun[]
    >([]);

  const [
    packages,
    setPackages,
  ] =
    useState<
      ReferenceReviewPackage[]
    >([]);

  const [
    selectedRunId,
    setSelectedRunId,
  ] =
    useState("");

  const [
    issued,
    setIssued,
  ] =
    useState(
      loadReferenceGoldStandardCertificates(),
    );

  const [
    notice,
    setNotice,
  ] =
    useState("");

  useEffect(
    () => {
      const loadedRuns =
        loadReferenceConsensusRuns();

      setRuns(
        loadedRuns,
      );
      setPackages(
        loadReferenceReviewPackages(),
      );
      setIssued(
        loadReferenceGoldStandardCertificates(),
      );

      setSelectedRunId(
        loadedRuns[
          0
        ]?.runId ??
          "",
      );
    },
    [],
  );

  const run =
    useMemo(
      () =>
        runs.find(
          (item) =>
            item.runId ===
            selectedRunId,
        ),
      [
        runs,
        selectedRunId,
      ],
    );

  const version =
    useMemo(
      () =>
        run
          ? inferVersionFromRun(
              run,
            )
          : undefined,
      [
        run,
      ],
    );

  const readiness =
    useMemo(
      () =>
        run &&
        version
          ? evaluateReferenceCertificationReadiness({
              version,
              run,
              packages,
              certifier,
            })
          : undefined,
      [
        run,
        version,
        packages,
      ],
    );

  const handleIssue =
    () => {
      if (
        !run ||
        !version
      ) {
        return;
      }

      try {
        const result =
          issueReferenceGoldStandardCertification({
            version,
            run,
            packages,
            certifier,
            issuedAt:
              new Date()
                .toISOString(),
          });

        saveCertifiedReferenceVersion(
          result.version,
        );
        saveReferenceGoldStandardCertificate(
          result.certificate,
        );
        saveReferenceCertificationAuditRecord(
          result.audit,
        );
        saveReferenceProductionPromotionQueueItem(
          result.promotionQueueItem,
        );

        setIssued(
          loadReferenceGoldStandardCertificates(),
        );
        setNotice(
          `Gold Standard certificate issued · ${result.certificate.certificateId} · version permanently locked.`,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof
            Error
            ? error.message
            : "Certification failed.",
        );
      }
    };

  const selectedCertificate =
    run
      ? issued.find(
          (certificate) =>
            certificate.fragranceId ===
              run.fragranceId &&
            certificate.versionId ===
              run.versionId,
        )
      : undefined;

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/45">
          Reference Intelligence Laboratory
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Gold Standard Certification
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Certification is the final laboratory governance boundary. A certified version is permanently locked and enters a separate production-promotion queue rather than becoming live recommendation intelligence automatically.
            </p>
          </div>

          <div className="min-w-[300px]">
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/40">
              Consensus run
            </label>
            <select
              value={
                selectedRunId
              }
              onChange={(
                event,
              ) => {
                setSelectedRunId(
                  event
                    .target
                    .value,
                );
                setNotice("");
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            >
              {runs.length ===
                0 && (
                <option value="">
                  No consensus runs available
                </option>
              )}
              {runs.map(
                (item) => (
                  <option
                    key={
                      item.runId
                    }
                    value={
                      item.runId
                    }
                  >
                    {item.fragranceId} · {item.snapshot.averageConfidence}% confidence
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      {!run ||
      !version ||
      !readiness ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8">
          <h2 className="text-xl font-semibold text-white">
            No certification candidate selected
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Generate a reviewed consensus run before attempting certification.
          </p>
        </section>
      ) : (
        <>
          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
            <div className="grid gap-5 md:grid-cols-6">
              <Metric
                label="Status"
                value={
                  selectedCertificate
                    ? "Certified"
                    : readiness.eligible
                      ? "Ready"
                      : "Blocked"
                }
              />
              <Metric
                label="Quality"
                value={`${readiness.referenceQuality}%`}
              />
              <Metric
                label="Consensus"
                value={`${readiness.consensusConfidence}%`}
              />
              <Metric
                label="Evidence"
                value={`${readiness.evidenceCompleteness}%`}
              />
              <Metric
                label="Coverage"
                value={`${readiness.calibrationMetricCoverage}%`}
              />
              <Metric
                label="Conflicts"
                value={
                  String(
                    readiness.unresolvedConflictCount,
                  )
                }
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
              <h2 className="text-xl font-semibold text-white">
                Certification gate
              </h2>
              <p className="mt-1 text-sm text-white/45">
                There is no override path. Every blocker must clear before issuance.
              </p>

              <div className="mt-5 space-y-3">
                <GateRow
                  passed={
                    readiness.reviewerCount >=
                    2
                  }
                  label={`Reviewer coverage · ${readiness.reviewerCount}`}
                />
                <GateRow
                  passed={
                    readiness.consensusConfidence >=
                    80
                  }
                  label={`Consensus confidence · ${readiness.consensusConfidence}%`}
                />
                <GateRow
                  passed={
                    readiness.evidenceCompleteness >=
                    95
                  }
                  label={`Evidence completeness · ${readiness.evidenceCompleteness}%`}
                />
                <GateRow
                  passed={
                    readiness.calibrationMetricCoverage >=
                    100
                  }
                  label={`Calibration coverage · ${readiness.calibrationMetricCoverage}%`}
                />
                <GateRow
                  passed={
                    readiness.unresolvedConflictCount ===
                    0
                  }
                  label={`Open conflicts · ${readiness.unresolvedConflictCount}`}
                />
                <GateRow
                  passed={
                    readiness.referenceQuality >=
                    85
                  }
                  label={`Reference quality · ${readiness.referenceQuality}%`}
                />
                <GateRow
                  passed={
                    !version.lockedAt
                  }
                  label={
                    version.lockedAt
                      ? "Version already locked"
                      : "Version available for permanent lock"
                  }
                />
                <GateRow
                  passed={
                    certifier.active &&
                    certifier.role ===
                      "administrator"
                  }
                  label={`Authorized certifier · ${certifier.displayName}`}
                />
              </div>

              {readiness.blockers.length >
                0 && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                    Blockers
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/60">
                    {readiness.blockers.map(
                      (blocker) => (
                        <li
                          key={
                            blocker
                          }
                        >
                          • {blocker}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleIssue
                }
                disabled={
                  !readiness.eligible ||
                  Boolean(
                    selectedCertificate,
                  )
                }
                className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                {selectedCertificate
                  ? "Certificate already issued"
                  : "Issue Gold Standard Certificate"}
              </button>
            </div>

            <CertificatePreview
              run={
                run
              }
              version={
                version
              }
              readiness={
                readiness
              }
              certificate={
                selectedCertificate
              }
            />
          </section>
        </>
      )}

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}

      <CertificationAuditSummary />
    </div>
  );
}

function CertificatePreview({
  run,
  version,
  readiness,
  certificate,
}: {
  run:
    ReferenceConsensusRun;
  version:
    ReferenceCalibrationVersion;
  readiness:
    ReturnType<
      typeof evaluateReferenceCertificationReadiness
    >;
  certificate:
    ReturnType<
      typeof loadReferenceGoldStandardCertificates
    >[number] |
    undefined;
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-amber-300/20 bg-gradient-to-b from-amber-100/[0.08] to-white/[0.025] p-6 md:p-8">
      <div className="absolute right-6 top-6 flex h-16 w-16 items-center justify-center rounded-full border border-amber-200/25 text-xs font-semibold tracking-[0.12em] text-amber-100/70">
        GS
      </div>

      <p className="text-xs font-medium uppercase tracking-[0.28em] text-amber-100/55">
        OLFACTUS™
      </p>
      <h2 className="mt-3 max-w-sm text-3xl font-semibold tracking-tight text-white">
        Gold Standard Reference Certificate
      </h2>

      <div className="mt-8 space-y-5">
        <CertificateField
          label="Fragrance"
          value={
            run.fragranceId
          }
        />
        <CertificateField
          label="Calibration version"
          value={
            version.version
          }
        />
        <CertificateField
          label="Reference quality"
          value={`${readiness.referenceQuality}%`}
        />
        <CertificateField
          label="Consensus"
          value={`${readiness.consensusConfidence}%`}
        />
        <CertificateField
          label="Evidence"
          value={`${readiness.evidenceCompleteness}%`}
        />
        <CertificateField
          label="Reviewers"
          value={
            String(
              readiness.reviewerCount,
            )
          }
        />
        <CertificateField
          label="Open conflicts"
          value={
            String(
              readiness.unresolvedConflictCount,
            )
          }
        />
        <CertificateField
          label="Status"
          value={
            certificate
              ? "LOCKED · CERTIFIED"
              : readiness.eligible
                ? "READY FOR CERTIFICATION"
                : "NOT READY"
          }
        />

        {certificate && (
          <>
            <CertificateField
              label="Certificate ID"
              value={
                certificate.certificateId
              }
            />
            <CertificateField
              label="Certificate hash"
              value={
                certificate.certificateHash
              }
            />
          </>
        )}
      </div>
    </div>
  );
}

function CertificationAuditSummary() {
  const audits =
    loadReferenceCertificationAudit();
  const queue =
    loadReferenceProductionPromotionQueue();

  if (
    audits.length ===
      0 &&
    queue.length ===
      0
  ) {
    return null;
  }

  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
      <h2 className="text-xl font-semibold text-white">
        Certification governance
      </h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Metric
          label="Certification audit records"
          value={
            String(
              audits.length,
            )
          }
        />
        <Metric
          label="Production promotion queue"
          value={
            String(
              queue.length,
            )
          }
        />
      </div>
      <p className="mt-4 text-xs leading-5 text-white/35">
        Certified references remain outside production recommendation intelligence until the production-promotion workflow explicitly approves them.
      </p>
    </section>
  );
}

function inferVersionFromRun(
  run:
    ReferenceConsensusRun,
): ReferenceCalibrationVersion {
  return {
    versionId:
      run.versionId,
    sessionId:
      run.snapshot
        .sessionId,
    fragranceId:
      run.fragranceId,
    version:
      versionLabel(
        run.versionId,
      ),
    status:
      "validated",
    createdAt:
      run.generatedAt,
    createdBy:
      run.reviewerIds[
        0
      ] ??
      "reviewer:unknown",
  };
}

function versionLabel(
  versionId: string,
) {
  const parts =
    versionId.split(
      ":",
    );

  const tail =
    parts[
      parts.length -
      1
    ] ??
    "1-0-0";

  return tail.replace(
    /-/g,
    ".",
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-lg font-semibold capitalize text-white">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
    </div>
  );
}

function GateRow({
  passed,
  label,
}: {
  passed: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 px-4 py-3">
      <span className="text-sm text-white/65">
        {label}
      </span>
      <span className="text-sm font-semibold text-white">
        {passed
          ? "PASS"
          : "BLOCK"}
      </span>
    </div>
  );
}

function CertificateField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-white/10 pb-3">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
      <p className="mt-1 break-all text-sm font-medium text-white/80">
        {value}
      </p>
    </div>
  );
}
