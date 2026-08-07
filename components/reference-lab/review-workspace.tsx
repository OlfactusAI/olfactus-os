"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ReferenceClaimReview,
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";
import {
  reviewProgress,
  reviewReferenceClaim,
} from "@/lib/reference-lab/review-workflow";
import {
  loadReferenceReviewPackages,
  saveReferenceReviewPackages,
} from "@/lib/reference-lab/review-storage";

const reviewerId =
  "reviewer:reference-reviewer";

export function ReviewWorkspace() {
  const [
    packages,
    setPackages,
  ] =
    useState<
      ReferenceReviewPackage[]
    >([]);

  const [
    selectedPackageId,
    setSelectedPackageId,
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

  const [
    notice,
    setNotice,
  ] =
    useState("");

  useEffect(
    () => {
      const loaded =
        loadReferenceReviewPackages();

      setPackages(
        loaded,
      );

      setSelectedPackageId(
        loaded[0]
          ?.packageId ??
          "",
      );
    },
    [],
  );

  const selected =
    useMemo(
      () =>
        packages.find(
          (item) =>
            item.packageId ===
            selectedPackageId,
        ),
      [
        packages,
        selectedPackageId,
      ],
    );

  const applyDecision =
    (
      claimId: string,
      decision:
        "approved" |
        "revision-requested" |
        "rejected",
    ) => {
      if (!selected) {
        return;
      }

      try {
        const updated =
          reviewReferenceClaim({
            package:
              selected,
            claimId,
            reviewerId,
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

        const next =
          packages.map(
            (item) =>
              item.packageId ===
              updated.packageId
                ? updated
                : item,
          );

        setPackages(
          next,
        );
        saveReferenceReviewPackages(
          next,
        );
        setNotice(
          `Review saved · package ${updated.state}.`,
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
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/45">
          Reference Intelligence Laboratory
        </p>
        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Evidence Ledger + Review
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Review submitted calibration claims, inspect their evidence, and record an auditable decision without changing the original submission.
            </p>
          </div>

          <div className="min-w-[280px]">
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/40">
              Review package
            </label>
            <select
              value={
                selectedPackageId
              }
              onChange={(
                event,
              ) =>
                setSelectedPackageId(
                  event.target.value,
                )
              }
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            >
              {packages.length ===
                0 && (
                <option value="">
                  No submissions yet
                </option>
              )}
              {packages.map(
                (item) => (
                  <option
                    key={
                      item.packageId
                    }
                    value={
                      item.packageId
                    }
                  >
                    {item.submission.fragranceId} · {item.state}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      {!selected ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8">
          <h2 className="text-xl font-semibold text-white">
            No submitted calibration packages
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/50">
            Submit a completed fragrance from the Calibration Workspace first. The resulting claim and evidence package will appear here automatically.
          </p>
        </section>
      ) : (
        <ReviewPackagePanel
          reviewPackage={
            selected
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
      )}

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function ReviewPackagePanel({
  reviewPackage,
  notes,
  setNotes,
  applyDecision,
}: {
  reviewPackage:
    ReferenceReviewPackage;
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
    claimId: string,
    decision:
      "approved" |
      "revision-requested" |
      "rejected",
  ) => void;
}) {
  const progress =
    reviewProgress(
      reviewPackage,
    );

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-5">
          <SummaryMetric
            label="State"
            value={
              reviewPackage.state
            }
          />
          <SummaryMetric
            label="Claims"
            value={
              String(
                progress.total,
              )
            }
          />
          <SummaryMetric
            label="Reviewed"
            value={
              String(
                progress.reviewed,
              )
            }
          />
          <SummaryMetric
            label="Approved"
            value={
              String(
                progress.approved,
              )
            }
          />
          <SummaryMetric
            label="Revisions"
            value={
              String(
                progress.revisions,
              )
            }
          />
        </div>

        <div className="mt-5 border-t border-white/10 pt-5 text-xs text-white/40">
          Submission {reviewPackage.submission.submissionId} · calibrated by {reviewPackage.submission.reviewerId} · version {reviewPackage.submission.versionId}
        </div>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.025]">
        {reviewPackage.claims.map(
          (
            claim,
            index,
          ) => {
            const evidence =
              reviewPackage.evidence.filter(
                (item) =>
                  claim.evidenceIds.includes(
                    item.evidenceId,
                  ),
              );

            const latestReview =
              latestReviewForClaim(
                reviewPackage
                  .reviews,
                claim.claimId,
              );

            return (
              <article
                key={
                  claim.claimId
                }
                className={`p-5 md:p-7 ${
                  index >
                  0
                    ? "border-t border-white/10"
                    : ""
                }`}
              >
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                      {claim.domain}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-white">
                      {humanize(
                        claim.metric,
                      )}
                    </h3>
                  </div>

                  <div className="flex gap-6">
                    <SummaryMetric
                      label="Score"
                      value={
                        String(
                          claim.value,
                        )
                      }
                    />
                    <SummaryMetric
                      label="Confidence"
                      value={`${claim.confidence}%`}
                    />
                    <SummaryMetric
                      label="Decision"
                      value={
                        latestReview
                          ?.decision ??
                        "pending"
                      }
                    />
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <ReviewText
                    label="Calibration rationale"
                    value={
                      claim.rationale
                    }
                  />

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                      Evidence ledger
                    </p>

                    <div className="mt-3 space-y-3">
                      {evidence.map(
                        (
                          item,
                        ) => (
                          <div
                            key={
                              item.evidenceId
                            }
                            className="rounded-xl border border-white/10 p-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs font-medium text-white/70">
                                {item.method}
                              </span>
                              <span className="text-xs tabular-nums text-white/40">
                                {item.confidence}%
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-white/60">
                              {item.detail}
                            </p>
                            {item.sourceUrl && (
                              <p className="mt-2 break-all text-xs text-white/35">
                                {item.sourceUrl}
                              </p>
                            )}
                            <p className="mt-2 text-[11px] text-white/30">
                              {item.evidenceId} · {item.capturedBy}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <label>
                    <span className="text-xs uppercase tracking-[0.16em] text-white/35">
                      Reviewer note
                    </span>
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
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className="mt-2 min-h-20 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm leading-6 text-white outline-none"
                      placeholder="Required for revision requests and rejection."
                    />
                  </label>

                  <div className="mt-4 flex flex-wrap gap-3">
                    <DecisionButton
                      label="Approve"
                      onClick={() =>
                        applyDecision(
                          claim.claimId,
                          "approved",
                        )
                      }
                    />
                    <DecisionButton
                      label="Request revision"
                      onClick={() =>
                        applyDecision(
                          claim.claimId,
                          "revision-requested",
                        )
                      }
                    />
                    <DecisionButton
                      label="Reject"
                      onClick={() =>
                        applyDecision(
                          claim.claimId,
                          "rejected",
                        )
                      }
                    />
                  </div>
                </div>
              </article>
            );
          },
        )}
      </section>

      <p className="text-xs leading-5 text-white/35">
        Reviewer decisions are additive audit records. They do not overwrite the submitted score, rationale, or evidence.
      </p>
    </div>
  );
}

function latestReviewForClaim(
  reviews:
    ReferenceClaimReview[],
  claimId: string,
) {
  return [
    ...reviews,
  ]
    .reverse()
    .find(
      (review) =>
        review.claimId ===
        claimId,
    );
}

function ReviewText({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-white/35">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/60">
        {value}
      </p>
    </div>
  );
}

function SummaryMetric({
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
      className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
    >
      {label}
    </button>
  );
}

function humanize(
  value: string,
) {
  return value
    .split("-")
    .map(
      (part) =>
        part
          .charAt(0)
          .toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}
