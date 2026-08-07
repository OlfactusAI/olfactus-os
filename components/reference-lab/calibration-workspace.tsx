"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  referenceCalibrationTargetsPhase1,
  type ReferenceCalibrationTarget,
} from "@/lib/reference-lab/reference-targets";
import {
  referenceCalibrationSections,
} from "@/lib/reference-lab/workspace-schema";
import {
  calculateReferenceWorkspaceCompleteness,
  claimKey,
  createReferenceWorkspaceDraft,
  submitReferenceWorkspaceForReview,
  updateReferenceWorkspaceClaim,
  type ReferenceWorkspaceDraft,
} from "@/lib/reference-lab/workspace";
import {
  loadReferenceWorkspaceDraft,
  saveReferenceWorkspaceDraft,
} from "@/lib/reference-lab/workspace-storage";
import {
  createReviewPackageFromWorkspace,
} from "@/lib/reference-lab/submission";
import {
  upsertReferenceReviewPackage,
} from "@/lib/reference-lab/review-storage";

const reviewerId =
  "reviewer:local-calibrator";

export function CalibrationWorkspace() {
  const [
    selectedId,
    setSelectedId,
  ] =
    useState(
      referenceCalibrationTargetsPhase1[
        0
      ]?.fragranceId ??
        "",
    );

  const [
    draft,
    setDraft,
  ] =
    useState<
      ReferenceWorkspaceDraft |
      undefined
    >();

  const [
    activeSection,
    setActiveSection,
  ] =
    useState(
      referenceCalibrationSections[
        0
      ]?.id ??
        "dna",
    );

  const [
    notice,
    setNotice,
  ] =
    useState("");

  const target =
    useMemo(
      () =>
        referenceCalibrationTargetsPhase1.find(
          (item) =>
            item.fragranceId ===
            selectedId,
        ),
      [
        selectedId,
      ],
    );

  useEffect(
    () => {
      if (!target) {
        return;
      }

      const saved =
        loadReferenceWorkspaceDraft(
          target.fragranceId,
        );

      setDraft(
        saved ??
          createReferenceWorkspaceDraft({
            target,
            reviewerId,
            timestamp:
              new Date()
                .toISOString(),
          }),
      );
      setNotice("");
    },
    [
      target,
    ],
  );

  const completeness =
    useMemo(
      () =>
        draft
          ? calculateReferenceWorkspaceCompleteness(
              draft,
            )
          : undefined,
      [
        draft,
      ],
    );

  const section =
    referenceCalibrationSections.find(
      (item) =>
        item.id ===
        activeSection,
    ) ??
    referenceCalibrationSections[
      0
    ];

  if (
    !target ||
    !draft ||
    !section ||
    !completeness
  ) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-sm text-white/60">
        Loading Reference Laboratory…
      </div>
    );
  }

  const updateMetric =
    (
      domain: string,
      metric: string,
      patch:
        Parameters<
          typeof updateReferenceWorkspaceClaim
        >[0]["patch"],
    ) => {
      if (
        draft.locked
      ) {
        return;
      }

      setDraft(
        updateReferenceWorkspaceClaim({
          draft,
          domain,
          metric,
          patch,
          timestamp:
            new Date()
              .toISOString(),
        }),
      );
      setNotice("");
    };

  const handleSave =
    () => {
      saveReferenceWorkspaceDraft(
        draft,
      );
      setNotice(
        "Draft saved locally.",
      );
    };

  const handleSubmit =
    () => {
      try {
        const submitted =
          submitReferenceWorkspaceForReview({
            draft,
            timestamp:
              new Date()
                .toISOString(),
          });

        const reviewPackage =
          createReviewPackageFromWorkspace({
            draft:
              submitted,
            timestamp:
              new Date()
                .toISOString(),
          });

        upsertReferenceReviewPackage(
          reviewPackage,
        );

        saveReferenceWorkspaceDraft(
          submitted,
        );
        setDraft(
          submitted,
        );
        setNotice(
          `Submitted for review · ${reviewPackage.claims.length} calibrated claims · ${reviewPackage.evidence.length} evidence records.`,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof
            Error
            ? error.message
            : "Unable to submit workspace.",
        );
      }
    };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035]">
        <div className="border-b border-white/10 px-6 py-6 md:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/45">
                Reference Intelligence Laboratory
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Calibration Workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Build auditable reference intelligence one claim at a time. Scores remain drafts until later consensus and promotion stages approve them.
              </p>
            </div>

            <div className="min-w-[260px]">
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Reference target
              </label>
              <select
                value={
                  selectedId
                }
                onChange={(
                  event,
                ) =>
                  setSelectedId(
                    event
                      .target
                      .value,
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
              >
                {referenceCalibrationTargetsPhase1.map(
                  (
                    item,
                  ) => (
                    <option
                      key={
                        item.fragranceId
                      }
                      value={
                        item.fragranceId
                      }
                    >
                      {item.brand} — {item.name}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="px-6 py-6 md:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill
                label={
                  draft.status
                }
              />
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                Calibration v{draft.calibrationVersion}
              </span>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
                {draft.locked
                  ? "Locked · Read only"
                  : "Editable draft"}
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-white">
              {target.name}
            </h2>
            <p className="mt-1 text-sm text-white/50">
              {target.brand}
            </p>
          </div>

          <div className="border-t border-white/10 px-6 py-6 lg:border-l lg:border-t-0 md:px-8">
            <div className="grid grid-cols-3 gap-4">
              <Metric
                value={`${completeness.scorePercent}%`}
                label="Scored"
              />
              <Metric
                value={`${completeness.evidencePercent}%`}
                label="Evidence"
              />
              <Metric
                value={`${completeness.confidencePercent}%`}
                label="Confidence"
              />
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-white/70 transition-all"
                style={{
                  width:
                    `${Math.min(
                      completeness.scorePercent,
                      completeness.evidencePercent,
                      completeness.confidencePercent,
                    )}%`,
                }}
              />
            </div>
            <p className="mt-3 text-xs text-white/45">
              {completeness.scored}/{completeness.required} metrics scored · {completeness.evidenced} evidence-complete
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="space-y-2 rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-3">
          {referenceCalibrationSections.map(
            (
              item,
            ) => {
              const total =
                item.metrics.length;
              const complete =
                item.metrics.filter(
                  (
                    metric,
                  ) => {
                    const claim =
                      draft.claims[
                        claimKey(
                          metric.domain,
                          metric.metric,
                        )
                      ];

                    return (
                      typeof claim
                        ?.value ===
                        "number" &&
                      claim.rationale
                        .trim()
                        .length >
                        0 &&
                      claim.evidence
                        .trim()
                        .length >
                        0
                    );
                  },
                ).length;

              return (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveSection(
                      item.id,
                    )
                  }
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                    activeSection ===
                    item.id
                      ? "bg-white/10 text-white"
                      : "text-white/55 hover:bg-white/[0.05] hover:text-white/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="text-xs tabular-nums text-white/35">
                      {complete}/{total}
                    </span>
                  </div>
                </button>
              );
            },
          )}
        </aside>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
          <div className="border-b border-white/10 pb-5">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/40">
              Calibration section
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">
              {section.title}
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
              {section.description}
            </p>
          </div>

          <div className="divide-y divide-white/10">
            {section.metrics.map(
              (
                metric,
              ) => {
                const key =
                  claimKey(
                    metric.domain,
                    metric.metric,
                  );
                const claim =
                  draft.claims[
                    key
                  ];

                return (
                  <CalibrationClaimEditor
                    key={
                      key
                    }
                    label={
                      metric.label
                    }
                    description={
                      metric.description
                    }
                    claim={
                      claim
                    }
                    disabled={
                      draft.locked ||
                      draft.status ===
                        "review"
                    }
                    onChange={(
                      patch,
                    ) =>
                      updateMetric(
                        metric.domain,
                        metric.metric,
                        patch,
                      )
                    }
                  />
                );
              },
            )}
          </div>
        </section>
      </div>

      <section className="sticky bottom-4 rounded-[1.5rem] border border-white/10 bg-black/80 p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-medium text-white">
              {notice ||
                (
                  completeness.readyForReview
                    ? "Calibration is complete enough to submit for review."
                    : "Complete every score, confidence, rationale, and evidence field before review."
                )}
            </p>
            <p className="mt-1 text-xs text-white/40">
              No claim becomes Gold Standard intelligence from this screen.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={
                handleSave
              }
              disabled={
                draft.locked ||
                draft.status ===
                  "review"
              }
              className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/75 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={
                handleSubmit
              }
              disabled={
                draft.locked ||
                draft.status ===
                  "review" ||
                !completeness.readyForReview
              }
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
            >
              Submit for review
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function CalibrationClaimEditor({
  label,
  description,
  claim,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  claim:
    ReferenceWorkspaceDraft["claims"][string];
  disabled: boolean;
  onChange: (
    patch:
      Partial<
        ReferenceWorkspaceDraft["claims"][string]
      >,
  ) => void;
}) {
  return (
    <div className="grid gap-5 py-6 lg:grid-cols-[180px_minmax(0,1fr)]">
      <div>
        <p className="text-sm font-semibold text-white">
          {label}
        </p>
        <p className="mt-1 text-xs leading-5 text-white/40">
          {description}
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_130px]">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.14em] text-white/35">
                Score
              </span>
              <span className="text-sm font-semibold tabular-nums text-white">
                {claim.value ??
                  "—"}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={
                claim.value ??
                50
              }
              disabled={
                disabled
              }
              onChange={(
                event,
              ) =>
                onChange({
                  value:
                    Number(
                      event
                        .target
                        .value,
                    ),
                })
              }
              className="w-full accent-white disabled:opacity-35"
            />
          </div>

          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
              Confidence
            </span>
            <input
              type="number"
              min="0"
              max="100"
              value={
                claim.confidence ??
                ""
              }
              disabled={
                disabled
              }
              onChange={(
                event,
              ) =>
                onChange({
                  confidence:
                    event
                      .target
                      .value ===
                    ""
                      ? undefined
                      : Number(
                          event
                            .target
                            .value,
                        ),
                })
              }
              className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none disabled:opacity-35"
              placeholder="0–100"
            />
          </label>
        </div>

        <label>
          <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
            Calibration rationale
          </span>
          <textarea
            value={
              claim.rationale
            }
            disabled={
              disabled
            }
            onChange={(
              event,
            ) =>
              onChange({
                rationale:
                  event
                    .target
                    .value,
              })
            }
            className="min-h-20 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm leading-6 text-white outline-none disabled:opacity-35"
            placeholder="Explain why this score is appropriate relative to calibrated references."
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
              Evidence
            </span>
            <textarea
              value={
                claim.evidence
              }
              disabled={
                disabled
              }
              onChange={(
                event,
              ) =>
                onChange({
                  evidence:
                    event
                      .target
                      .value,
                })
              }
              className="min-h-20 w-full resize-y rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm leading-6 text-white outline-none disabled:opacity-35"
              placeholder="Record the observations, comparison references, or source evidence behind this claim."
            />
          </label>

          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
              Source URL
            </span>
            <input
              type="url"
              value={
                claim.sourceUrl
              }
              disabled={
                disabled
              }
              onChange={(
                event,
              ) =>
                onChange({
                  sourceUrl:
                    event
                      .target
                      .value,
                })
              }
              className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none disabled:opacity-35"
              placeholder="Optional supporting source"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <p className="text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/35">
        {label}
      </p>
    </div>
  );
}

function StatusPill({
  label,
}: {
  label: string;
}) {
  return (
    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black">
      {label}
    </span>
  );
}
