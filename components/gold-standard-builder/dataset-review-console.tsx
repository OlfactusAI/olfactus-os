"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  applyDatasetClaimReview,
  getDatasetReviewReadiness,
} from "@/lib/gold-standard-builder/review-console";
import {
  loadGoldStandardBuildState,
  loadGoldStandardTargets,
  saveGoldStandardBuildState,
} from "@/lib/gold-standard-builder/storage";

const reviewOperator =
  "reviewer:dataset-review-admin";

export function DatasetReviewConsole() {
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
    notes,
    setNotes,
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
      ? getDatasetReviewReadiness(
          state,
        )
      : undefined;

  const applyDecision =
    (
      packageId: string,
      claimId: string,
      decision:
        | "approved"
        | "revision-requested"
        | "rejected",
    ) => {
      if (!state) {
        return;
      }

      try {
        const next =
          applyDatasetClaimReview({
            state,
            packageId,
            claimId,
            reviewerId:
              reviewOperator,
            decision,
            note:
              notes[
                claimId
              ] ??
              "",
            timestamp:
              new Date()
                .toISOString(),
          });

        saveGoldStandardBuildState(
          next,
        );

        setNotice(
          `Review saved · ${decision}.`,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Unable to save review.",
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
              Dataset Review Console
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Compare independent submitted calibration packages only after authoring is complete. Reviewer decisions are additive audit records and never overwrite the original claims or evidence.
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
      !readiness?.submitted ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8">
          <h2 className="text-xl font-semibold text-white">
            No submitted reviewer packages yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Complete Reviewer A and Reviewer B authoring, then use Submit Both for Review in the Dataset Builder.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <StatusCard
              label="Packages"
              value={
                String(
                  state.reviewPackages
                    .length,
                )
              }
            />
            <StatusCard
              label="All approved"
              value={
                readiness.allApproved
                  ? "YES"
                  : "NO"
              }
            />
            <StatusCard
              label="Blocked"
              value={
                readiness.blocked
                  ? "YES"
                  : "NO"
              }
            />
            <StatusCard
              label="Next"
              value={
                readiness.allApproved
                  ? "CONSENSUS"
                  : "REVIEW"
              }
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            {state.reviewPackages.map(
              (
                reviewPackage,
              ) => (
                <ReviewPackageColumn
                  key={
                    reviewPackage.packageId
                  }
                  reviewPackage={
                    reviewPackage
                  }
                  notes={
                    notes
                  }
                  setNotes={
                    setNotes
                  }
                  applyDecision={
                    applyDecision
                  }
                />
              ),
            )}
          </section>
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

function ReviewPackageColumn({
  reviewPackage,
  notes,
  setNotes,
  applyDecision,
}: {
  reviewPackage:
    NonNullable<
      ReturnType<
        typeof loadGoldStandardBuildState
      >
    >["reviewPackages"][number];
  notes:
    Record<
      string,
      string
    >;
  setNotes:
    React.Dispatch<
      React.SetStateAction<
        Record<
          string,
          string
        >
      >
    >;
  applyDecision: (
    packageId: string,
    claimId: string,
    decision:
      | "approved"
      | "revision-requested"
      | "rejected",
  ) => void;
}) {
  const progress =
    reviewProgress(
      reviewPackage,
    );

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-white/35">
            Submitted by
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {reviewPackage.submission.reviewerId}
          </h2>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold capitalize text-white/65">
          {reviewPackage.state}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-4">
        <MiniMetric
          label="Claims"
          value={
            String(
              progress.total,
            )
          }
        />
        <MiniMetric
          label="Reviewed"
          value={
            String(
              progress.reviewed,
            )
          }
        />
        <MiniMetric
          label="Approved"
          value={
            String(
              progress.approved,
            )
          }
        />
        <MiniMetric
          label="Revisions"
          value={
            String(
              progress.revisions,
            )
          }
        />
      </div>

      <div className="mt-6 space-y-4">
        {reviewPackage.claims.map(
          (claim) => {
            const evidence =
              reviewPackage.evidence.filter(
                (item) =>
                  claim.evidenceIds.includes(
                    item.evidenceId,
                  ),
              );

            const latestReview =
              [...reviewPackage.reviews]
                .reverse()
                .find(
                  (review) =>
                    review.claimId ===
                    claim.claimId,
                );

            return (
              <article
                key={
                  claim.claimId
                }
                className="rounded-2xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                      {claim.domain}
                    </p>
                    <h3 className="mt-1 text-sm font-semibold text-white">
                      {claim.metric}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">
                      {String(
                        claim.value,
                      )}
                    </p>
                    <p className="text-xs text-white/35">
                      {claim.confidence}% confidence
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  <TextBlock
                    label="Rationale"
                    value={
                      claim.rationale
                    }
                  />

                  <div className="rounded-xl border border-white/10 p-3">
                    <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                      Evidence
                    </p>
                    <div className="mt-2 space-y-2">
                      {evidence.map(
                        (item) => (
                          <div
                            key={
                              item.evidenceId
                            }
                            className="rounded-lg bg-white/[0.03] p-3"
                          >
                            <p className="text-sm text-white/60">
                              {item.detail}
                            </p>
                            <p className="mt-1 text-xs text-white/30">
                              {item.method} · {item.confidence}%
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <textarea
                  value={
                    notes[
                      claim.claimId
                    ] ??
                    latestReview
                      ?.note ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    setNotes(
                      (
                        current,
                      ) => ({
                        ...current,
                        [claim.claimId]:
                          event.target.value,
                      }),
                    )
                  }
                  className="mt-4 min-h-16 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none"
                  placeholder="Required for revision or rejection."
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <DecisionButton
                    label="Approve"
                    onClick={() =>
                      applyDecision(
                        reviewPackage.packageId,
                        claim.claimId,
                        "approved",
                      )
                    }
                  />
                  <DecisionButton
                    label="Request revision"
                    onClick={() =>
                      applyDecision(
                        reviewPackage.packageId,
                        claim.claimId,
                        "revision-requested",
                      )
                    }
                  />
                  <DecisionButton
                    label="Reject"
                    onClick={() =>
                      applyDecision(
                        reviewPackage.packageId,
                        claim.claimId,
                        "rejected",
                      )
                    }
                  />
                </div>
              </article>
            );
          },
        )}
      </div>
    </div>
  );
}

function TextBlock({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="text-xs uppercase tracking-[0.12em] text-white/30">
        {label}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/60">
        {value}
      </p>
    </div>
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

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xl font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/35">
        {label}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-white/30">
        {label}
      </p>
    </div>
  );
}
