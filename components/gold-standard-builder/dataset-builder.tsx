"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  createGoldStandardDatasetState,
  determineGoldStandardDatasetStage,
} from "@/lib/gold-standard-builder/builder";
import {
  getDatasetAuthoringReadiness,
  updateDatasetReviewerClaim,
} from "@/lib/gold-standard-builder/authoring";
import {
  submitDatasetReviewersTogether,
} from "@/lib/gold-standard-builder/submission";
import {
  loadGoldStandardBuildState,
  loadGoldStandardTargets,
  saveGoldStandardBuildState,
  upsertGoldStandardTarget,
} from "@/lib/gold-standard-builder/storage";
import {
  claimKey,
} from "@/lib/reference-lab/workspace";
import {
  referenceCalibrationSections,
} from "@/lib/reference-lab/workspace-schema";
import {
  getResearchFactsForSection,
} from "@/lib/gold-standard-builder/research-packs";
import {
  loadResearchPack,
} from "@/lib/gold-standard-builder/research-packs/storage";
import type {
  GoldStandardDatasetTarget,
} from "@/lib/gold-standard-builder/types";

const defaultReviewers = [
  {
    reviewerId:
      "reviewer:dataset-a",
    displayName:
      "Dataset Reviewer A",
  },
  {
    reviewerId:
      "reviewer:dataset-b",
    displayName:
      "Dataset Reviewer B",
  },
];

export function GoldStandardDatasetBuilder() {
  const [
    targets,
    setTargets,
  ] =
    useState<
      GoldStandardDatasetTarget[]
    >(
      loadGoldStandardTargets(),
    );

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
    activeReviewerId,
    setActiveReviewerId,
  ] =
    useState(
      defaultReviewers[
        0
      ].reviewerId,
    );

  const [
    activeSectionId,
    setActiveSectionId,
  ] =
    useState(
      referenceCalibrationSections[
        0
      ]?.id ??
        "dna",
    );

  const [
    form,
    setForm,
  ] =
    useState({
      fragranceId:
        "creed:aventus",
      brand:
        "Creed",
      name:
        "Aventus",
    });

  const [
    notice,
    setNotice,
  ] =
    useState("");

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
      ? getDatasetAuthoringReadiness(
          state,
        )
      : undefined;

  const activeDraft =
    state?.reviewerDrafts.find(
      (draft) =>
        draft.reviewerId ===
        activeReviewerId,
    ) ??
    state?.reviewerDrafts[
      0
    ];

  const activeSection =
    referenceCalibrationSections.find(
      (section) =>
        section.id ===
        activeSectionId,
    ) ??
    referenceCalibrationSections[
      0
    ];

  const createTarget =
    () => {
      const target = {
        fragranceId:
          form.fragranceId
            .trim(),
        brand:
          form.brand
            .trim(),
        name:
          form.name
            .trim(),
      };

      if (
        !target.fragranceId ||
        !target.brand ||
        !target.name
      ) {
        setNotice(
          "Fragrance ID, brand, and name are required.",
        );
        return;
      }

      const nextTargets =
        upsertGoldStandardTarget(
          target,
        );

      const buildState =
        createGoldStandardDatasetState({
          target,
          reviewers:
            defaultReviewers,
          timestamp:
            new Date()
              .toISOString(),
        });

      saveGoldStandardBuildState(
        buildState,
      );

      setTargets(
        nextTargets,
      );
      setSelectedId(
        target.fragranceId,
      );
      setActiveReviewerId(
        defaultReviewers[
          0
        ].reviewerId,
      );
      setNotice(
        `Created ${target.brand} ${target.name} with two independent reviewer drafts.`,
      );
    };

  const updateClaim =
    (
      domain: string,
      metric: string,
      patch: Record<
        string,
        unknown
      >,
    ) => {
      if (
        !state ||
        !activeDraft
      ) {
        return;
      }

      const next =
        updateDatasetReviewerClaim({
          state,
          reviewerId:
            activeDraft.reviewerId,
          domain,
          metric,
          patch:
            patch as any,
          timestamp:
            new Date()
              .toISOString(),
        });

      saveGoldStandardBuildState(
        next,
      );

      setNotice(
        `Autosaved ${reviewerName(activeDraft.reviewerId)}.`,
      );
    };

  const submitBoth =
    () => {
      if (!state) {
        return;
      }

      try {
        const next =
          submitDatasetReviewersTogether({
            state,
            timestamp:
              new Date()
                .toISOString(),
          });

        saveGoldStandardBuildState(
          next,
        );

        setNotice(
          "Both independent reviewer drafts were submitted for review.",
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Unable to submit reviewer drafts.",
        );
      }
    };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          OLFACTUS Knowledge Infrastructure
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Gold Standard Dataset Builder
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
          Two independent reviewers author the same fragrance separately. Each draft autosaves without exposing the other reviewer's scores, rationale, confidence, or evidence.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
            <h2 className="text-xl font-semibold text-white">
              Reference target
            </h2>

            <div className="mt-5 space-y-4">
              <Input
                label="Fragrance ID"
                value={
                  form.fragranceId
                }
                onChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    fragranceId:
                      value,
                  })
                }
              />
              <Input
                label="Brand"
                value={
                  form.brand
                }
                onChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    brand:
                      value,
                  })
                }
              />
              <Input
                label="Fragrance"
                value={
                  form.name
                }
                onChange={(
                  value,
                ) =>
                  setForm({
                    ...form,
                    name:
                      value,
                  })
                }
              />

              <button
                type="button"
                onClick={
                  createTarget
                }
                className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
              >
                Create dataset target
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
            <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
              Active dataset
            </label>
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
              className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
            >
              {targets.length ===
                0 && (
                <option value="">
                  No targets yet
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

          {state &&
            readiness && (
            <DatasetStatus
              state={
                state
              }
              readiness={
                readiness
              }
            />
          )}
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
          {!state ||
          !activeDraft ||
          !activeSection ? (
            <div className="p-6 text-sm text-white/45">
              Create or select a dataset target to begin authoring.
            </div>
          ) : (
            <>
              <div className="sticky top-4 z-10 rounded-2xl border border-white/10 bg-black/70 p-4 backdrop-blur-xl">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-white/35">
                      Independent reviewer
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {reviewerName(
                        activeDraft.reviewerId,
                      )}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {state.reviewerDrafts.map(
                      (draft) => (
                        <button
                          key={
                            draft.reviewerId
                          }
                          type="button"
                          onClick={() => {
                            setActiveReviewerId(
                              draft.reviewerId,
                            );
                            setNotice("");
                          }}
                          className={`rounded-xl px-4 py-2 text-sm font-medium ${
                            activeReviewerId ===
                            draft.reviewerId
                              ? "bg-white text-black"
                              : "border border-white/10 text-white/65"
                          }`}
                        >
                          {reviewerName(
                            draft.reviewerId,
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[220px_minmax(0,1fr)]">
                <aside className="space-y-2">
                  {referenceCalibrationSections.map(
                    (section) => {
                      const reviewerProgress =
                        readiness?.reviewers.find(
                          (reviewer) =>
                            reviewer.reviewerId ===
                            activeDraft.reviewerId,
                        );

                      const sectionProgress =
                        reviewerProgress
                          ?.sections.find(
                            (item) =>
                              item.sectionId ===
                              section.id,
                          );

                      return (
                        <button
                          key={
                            section.id
                          }
                          type="button"
                          onClick={() =>
                            setActiveSectionId(
                              section.id,
                            )
                          }
                          className={`w-full rounded-xl px-3 py-3 text-left ${
                            activeSectionId ===
                            section.id
                              ? "bg-white/10 text-white"
                              : "text-white/50 hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm">
                              {section.title}
                            </span>
                            <span className="text-xs text-white/30">
                              {sectionProgress?.complete ?? 0}/{sectionProgress?.total ?? section.metrics.length}
                            </span>
                          </div>
                        </button>
                      );
                    },
                  )}
                </aside>

                <div>
                  <div className="border-b border-white/10 pb-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/35">
                      {activeSection.title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/45">
                      {activeSection.description}
                    </p>
                  </div>

                  <ResearchEvidencePanel
                    fragranceId={state.target.fragranceId}
                    sectionId={activeSection.id}
                  />

                  <div className="divide-y divide-white/10">
                    {activeSection.metrics.map(
                      (metric) => {
                        const claim =
                          activeDraft.claims[
                            claimKey(
                              metric.domain,
                              metric.metric,
                            )
                          ];

                        return (
                          <AuthoringMetric
                            key={`${metric.domain}:${metric.metric}`}
                            label={
                              metric.label
                            }
                            description={
                              metric.description
                            }
                            value={
                              claim?.value
                            }
                            confidence={
                              claim?.confidence
                            }
                            rationale={
                              claim?.rationale ??
                              ""
                            }
                            evidence={
                              claim?.evidence ??
                              ""
                            }
                            sourceUrl={
                              claim?.sourceUrl ??
                              ""
                            }
                            onChange={(
                              patch,
                            ) =>
                              updateClaim(
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
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      {state &&
        readiness && (
        <section className="sticky bottom-4 rounded-[1.5rem] border border-white/10 bg-black/80 p-4 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-white">
                Reviewer independence: {readiness.independent ? "PASS" : "BLOCK"}
              </p>
              <p className="mt-1 text-xs text-white/40">
                Submit becomes available only when both independent drafts have every required score, confidence, rationale, and evidence field complete.
              </p>
            </div>

            <button
              type="button"
              onClick={
                submitBoth
              }
              disabled={
                !readiness.allComplete ||
                state.reviewPackages
                  .length >
                  0
              }
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
            >
              {state.reviewPackages.length >
                0
                ? "Submitted for review"
                : "Submit both for review"}
            </button>
          </div>
        </section>
      )}

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function DatasetStatus({
  state,
  readiness,
}: {
  state:
    NonNullable<
      ReturnType<
        typeof loadGoldStandardBuildState
      >
    >;
  readiness:
    ReturnType<
      typeof getDatasetAuthoringReadiness
    >;
}) {
  const stage =
    determineGoldStandardDatasetStage(
      state,
    );

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
      <p className="text-xs uppercase tracking-[0.14em] text-white/35">
        Dataset status
      </p>
      <p className="mt-2 text-2xl font-semibold capitalize text-white">
        {stage}
      </p>

      <div className="mt-5 space-y-4">
        {readiness.reviewers.map(
          (reviewer) => (
            <div
              key={
                reviewer.reviewerId
              }
              className="rounded-2xl border border-white/10 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {reviewerName(
                    reviewer.reviewerId,
                  )}
                </span>
                <span className="text-xs text-white/40">
                  {Math.min(
                    reviewer.scored,
                    reviewer.evidenced,
                    reviewer.confidenceReady,
                  )}/{reviewer.required}
                </span>
              </div>
              <p className="mt-2 text-xs text-white/35">
                {reviewer.complete
                  ? "Complete"
                  : `${reviewer.missing.length} metrics still have missing fields`}
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function AuthoringMetric({
  label,
  description,
  value,
  confidence,
  rationale,
  evidence,
  sourceUrl,
  onChange,
}: {
  label: string;
  description: string;
  value:
    number |
    undefined;
  confidence:
    number |
    undefined;
  rationale: string;
  evidence: string;
  sourceUrl: string;
  onChange: (
    patch:
      Record<
        string,
        unknown
      >,
  ) => void;
}) {
  return (
    <div className="py-6">
      <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)]">
        <div>
          <p className="text-sm font-semibold text-white">
            {label}
          </p>
          <p className="mt-1 text-xs leading-5 text-white/40">
            {description}
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-[1fr_130px]">
            <label>
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/35">
                Score
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={
                  value ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  onChange({
                    value:
                      event.target.value ===
                      ""
                        ? undefined
                        : Number(
                            event.target.value,
                          ),
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
                placeholder="0–100"
              />
            </label>

            <label>
              <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/35">
                Confidence
              </span>
              <input
                type="number"
                min="0"
                max="100"
                value={
                  confidence ??
                  ""
                }
                onChange={(
                  event,
                ) =>
                  onChange({
                    confidence:
                      event.target.value ===
                      ""
                        ? undefined
                        : Number(
                            event.target.value,
                          ),
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
                placeholder="0–100"
              />
            </label>
          </div>

          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/35">
              Rationale
            </span>
            <textarea
              value={
                rationale
              }
              onChange={(
                event,
              ) =>
                onChange({
                  rationale:
                    event.target.value,
                })
              }
              className="min-h-20 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm leading-6 text-white outline-none"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/35">
              Evidence
            </span>
            <textarea
              value={
                evidence
              }
              onChange={(
                event,
              ) =>
                onChange({
                  evidence:
                    event.target.value,
                })
              }
              className="min-h-20 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm leading-6 text-white outline-none"
            />
          </label>

          <label>
            <span className="mb-2 block text-xs uppercase tracking-[0.12em] text-white/35">
              Source URL
            </span>
            <input
              value={
                sourceUrl
              }
              onChange={(
                event,
              ) =>
                onChange({
                  sourceUrl:
                    event.target.value,
                })
              }
              className="w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white outline-none"
              placeholder="Optional"
            />
          </label>
        </div>
      </div>
    </div>
  );
}

function ResearchEvidencePanel({
  fragranceId,
  sectionId,
}: {
  fragranceId: string;
  sectionId: string;
}) {
  const imported =
    loadResearchPack(
      fragranceId,
    );

  const facts =
    imported
      ? getResearchFactsForSection(
          fragranceId,
          sectionId,
        )
      : [];

  if (!imported) {
    return (
      <div className="my-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">
          No research pack imported
        </p>
        <p className="mt-1 text-xs leading-5 text-white/40">
          Open /gold-standard-builder/research and import the Aventus evidence pack before calibration.
        </p>
      </div>
    );
  }

  return (
    <div className="my-5 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-white/30">
            Shared research evidence
          </p>
          <p className="mt-1 text-sm text-white/55">
            Evidence is shared; scores remain independent.
          </p>
        </div>
        <span className="text-xs font-semibold text-white/35">
          {facts.length} facts
        </span>
      </div>

      <div className="mt-4 space-y-2">
        {facts.map(
          (fact) => (
            <div
              key={
                fact.factId
              }
              className="rounded-xl border border-white/10 p-3"
            >
              <p className="text-sm leading-6 text-white/65">
                {fact.claim}
              </p>
              <p className="mt-1 text-xs text-white/30">
                {fact.sourceIds.join(", ")}
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
        {label}
      </span>
      <input
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
      />
    </label>
  );
}

function reviewerName(
  reviewerId: string,
) {
  return reviewerId.endsWith(
    "-a",
  )
    ? "Reviewer A"
    : reviewerId.endsWith(
        "-b",
      )
      ? "Reviewer B"
      : reviewerId;
}
