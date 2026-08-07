"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  certifyAndPrepareDataset,
  generateDatasetConsensus,
  getDatasetOrchestrationReadiness,
  resolveDatasetConsensusConflict,
} from "@/lib/gold-standard-builder/orchestrator";
import {
  loadGoldStandardBuildState,
  loadGoldStandardTargets,
  saveGoldStandardBuildState,
} from "@/lib/gold-standard-builder/storage";
import type {
  ReferenceReviewer,
} from "@/lib/reference-lab/types";

const certifier:
  ReferenceReviewer = {
  reviewerId:
    "reviewer:dataset-certification-admin",
  displayName:
    "Dataset Certification Administrator",
  role:
    "administrator",
  active: true,
};

const conflictReviewer =
  "reviewer:dataset-consensus-admin";

const productionApprover =
  "production:dataset-admin";

export function DatasetOrchestrator() {
  const targets =
    loadGoldStandardTargets();

  const [
    selectedId,
    setSelectedId,
  ] =
    useState(
      targets[
        0
      ]?.fragranceId ??
        "",
    );

  const [
    notice,
    setNotice,
  ] =
    useState("");

  const [
    conflictNotes,
    setConflictNotes,
  ] =
    useState<
      Record<
        string,
        string
      >
    >({});

  const state =
    useMemo(
      () =>
        selectedId
          ? loadGoldStandardBuildState(
              selectedId,
            )
          : undefined,
      [
        selectedId,
        notice,
      ],
    );

  const readiness =
    state
      ? getDatasetOrchestrationReadiness(
          state,
        )
      : undefined;

  const generateConsensus =
    () => {
      if (!state) {
        return;
      }

      try {
        const next =
          generateDatasetConsensus({
            state,
            timestamp:
              new Date()
                .toISOString(),
          });

        saveGoldStandardBuildState(
          next,
        );

        const conflicts =
          next.consensusRun
            ?.conflicts
            .filter(
              (conflict) =>
                conflict.status ===
                "open",
            ).length ??
          0;

        setNotice(
          conflicts
            ? `Consensus generated with ${conflicts} unresolved conflict${conflicts === 1 ? "" : "s"}. Resolve them before certification.`
            : "Consensus generated with zero unresolved conflicts. Dataset is ready for certification.",
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Unable to generate consensus.",
        );
      }
    };

  const resolveConflict =
    (
      conflictId: string,
      status:
        "resolved" |
        "dismissed",
    ) => {
      if (!state) {
        return;
      }

      try {
        const next =
          resolveDatasetConsensusConflict({
            state,
            conflictId,
            status,
            resolution:
              conflictNotes[
                conflictId
              ] ??
              "",
            reviewerId:
              conflictReviewer,
            timestamp:
              new Date()
                .toISOString(),
          });

        saveGoldStandardBuildState(
          next,
        );

        setNotice(
          `Conflict ${status}.`,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Unable to resolve conflict.",
        );
      }
    };

  const certifyAndPrepare =
    () => {
      if (!state) {
        return;
      }

      try {
        const next =
          certifyAndPrepareDataset({
            state,
            certifier,
            productionApprover,
            timestamp:
              new Date()
                .toISOString(),
          });

        saveGoldStandardBuildState(
          next,
        );

        if (
          next.activationPackage
        ) {
          setNotice(
            "Gold Standard certified, registered, fingerprinted, production-approved, and activation package generated. Runtime activation remains a separate final action.",
          );
        } else if (
          next.promotion
            ?.status ===
          "blocked"
        ) {
          setNotice(
            `Gold Standard certified and registered, but production promotion is blocked: ${next.promotion.blockers.join(" ")}`,
          );
        } else {
          setNotice(
            "Gold Standard certification pipeline completed to the furthest valid stage.",
          );
        }
      } catch (
        error
      ) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Unable to certify and prepare dataset.",
        );
      }
    };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          Gold Standard Dataset Governance
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Consensus + Certification Orchestrator
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Advance fully reviewed dataset packages into consensus, resolve calibration conflicts, issue Gold Standard certification, register the reference, build production fingerprints, and prepare the activation package without silently activating runtime intelligence.
            </p>
          </div>

          <select
            value={
              selectedId
            }
            onChange={(
              event,
            ) => {
              setSelectedId(
                event.target.value,
              );
              setNotice("");
            }}
            className="min-w-[300px] rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
          >
            {targets.length ===
              0 && (
              <option value="">
                No dataset targets
              </option>
            )}
            {targets.map(
              (target) => (
                <option
                  key={
                    target.fragranceId
                  }
                  value={
                    target.fragranceId
                  }
                >
                  {target.brand} — {target.name}
                </option>
              ),
            )}
          </select>
        </div>
      </section>

      {!state ||
      !readiness ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8 text-sm text-white/50">
          Create and review a Gold Standard dataset target first.
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4 xl:grid-cols-8">
            <StatusCard
              label="Review"
              value={
                readiness.reviewApproved
                  ? "PASS"
                  : "BLOCK"
              }
            />
            <StatusCard
              label="Consensus"
              value={
                readiness.consensusExists
                  ? "READY"
                  : "NONE"
              }
            />
            <StatusCard
              label="Metrics"
              value={
                String(
                  readiness.consensusMetrics,
                )
              }
            />
            <StatusCard
              label="Conflicts"
              value={
                String(
                  readiness.openConflicts,
                )
              }
            />
            <StatusCard
              label="Certified"
              value={
                readiness.certified
                  ? "YES"
                  : "NO"
              }
            />
            <StatusCard
              label="Registry"
              value={
                readiness.registered
                  ? "YES"
                  : "NO"
              }
            />
            <StatusCard
              label="Fingerprints"
              value={
                readiness.fingerprintsComplete
                  ? "100%"
                  : "PENDING"
              }
            />
            <StatusCard
              label="Activation"
              value={
                readiness.activationPackageReady
                  ? "PACKAGE READY"
                  : "PENDING"
              }
            />
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Step 1 · Generate consensus
                </h2>
                <p className="mt-1 text-sm text-white/45">
                  Requires both independent review packages to be fully approved.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  generateConsensus
                }
                disabled={
                  !readiness.reviewApproved ||
                  readiness.consensusExists
                }
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                {readiness.consensusExists
                  ? "Consensus generated"
                  : "Generate dataset consensus"}
              </button>
            </div>
          </section>

          {state.consensusRun &&
            state.consensusRun
              .conflicts.length >
              0 && (
            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
              <h2 className="text-xl font-semibold text-white">
                Step 2 · Resolve calibration conflicts
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Every open moderate/high disagreement must be explicitly resolved or dismissed with an audit rationale.
              </p>

              <div className="mt-5 space-y-4">
                {state.consensusRun.conflicts.map(
                  (conflict) => (
                    <div
                      key={
                        conflict.conflictId
                      }
                      className="rounded-2xl border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div>
                          <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                            {conflict.domain}
                          </p>
                          <h3 className="mt-1 text-sm font-semibold text-white">
                            {conflict.metric}
                          </h3>
                        </div>

                        <div className="flex gap-2">
                          <Pill
                            value={
                              conflict.severity
                            }
                          />
                          <Pill
                            value={
                              conflict.status
                            }
                          />
                        </div>
                      </div>

                      {conflict.status ===
                      "open" ? (
                        <>
                          <textarea
                            value={
                              conflictNotes[
                                conflict.conflictId
                              ] ??
                              ""
                            }
                            onChange={(
                              event,
                            ) =>
                              setConflictNotes(
                                (
                                  current,
                                ) => ({
                                  ...current,
                                  [conflict.conflictId]:
                                    event.target.value,
                                }),
                              )
                            }
                            className="mt-4 min-h-20 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
                            placeholder="Explain the evidence-based conflict resolution."
                          />

                          <div className="mt-3 flex flex-wrap gap-2">
                            <DecisionButton
                              label="Resolve"
                              onClick={() =>
                                resolveConflict(
                                  conflict.conflictId,
                                  "resolved",
                                )
                              }
                            />
                            <DecisionButton
                              label="Dismiss with rationale"
                              onClick={() =>
                                resolveConflict(
                                  conflict.conflictId,
                                  "dismissed",
                                )
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <div className="mt-4 rounded-xl border border-white/10 p-3">
                          <p className="text-xs text-white/35">
                            {conflict.resolvedBy} · {conflict.resolvedAt}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-white/60">
                            {conflict.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Step 3 · Certify + prepare production
                </h2>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">
                  Issues the Gold Standard certificate, persists the certification audit, registers the reference, builds fingerprints from the certified consensus, runs production compatibility, and generates an activation package if every production check passes.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  certifyAndPrepare
                }
                disabled={
                  !readiness.certificationReady ||
                  readiness.certified
                }
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                {readiness.certified
                  ? "Gold Standard certified"
                  : "Certify + prepare production"}
              </button>
            </div>

            {state.promotion && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                  Production promotion
                </p>
                <p className="mt-2 text-lg font-semibold capitalize text-white">
                  {state.promotion.status}
                </p>

                {state.promotion.blockers.length >
                  0 && (
                  <ul className="mt-3 space-y-1 text-sm leading-6 text-white/55">
                    {state.promotion.blockers.map(
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
                )}
              </div>
            )}
          </section>

          {state.activationPackage && (
            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
              <p className="text-xs uppercase tracking-[0.14em] text-white/35">
                Final handoff
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Activation package ready
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
                The certified dataset has reached the runtime boundary. Activation remains a separate explicit action in the Production Activation Bridge / first-live-reference workflow.
              </p>
              <p className="mt-4 break-all text-xs text-white/30">
                {state.activationPackage.activationId}
              </p>
            </section>
          )}
        </>
      )}

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <p className="break-words text-sm font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.11em] text-white/30">
        {label}
      </p>
    </div>
  );
}

function Pill({
  value,
}: {
  value: string;
}) {
  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium capitalize text-white/60">
      {value}
    </span>
  );
}

function DecisionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="rounded-xl border border-white/15 px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/10"
    >
      {label}
    </button>
  );
}
