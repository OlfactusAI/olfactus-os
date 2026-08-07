"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  buildReferenceConsensus,
  recalculateUnresolvedConflictCount,
} from "@/lib/reference-lab/consensus-engine";
import {
  resolveReferenceConflict,
} from "@/lib/reference-lab/conflict-resolution";
import {
  appendReferenceConflictResolution,
  loadReferenceConflictResolutions,
  loadReferenceConsensusRuns,
  saveReferenceConsensusRuns,
  upsertReferenceConsensusRun,
} from "@/lib/reference-lab/consensus-storage";
import {
  loadReferenceReviewPackages,
} from "@/lib/reference-lab/review-storage";
import type {
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";
import type {
  ReferenceConsensusRun,
} from "@/lib/reference-lab/consensus-types";

const conflictResolverId =
  "reviewer:consensus-admin";

export function ConsensusWorkspace() {
  const [
    packages,
    setPackages,
  ] =
    useState<
      ReferenceReviewPackage[]
    >([]);

  const [
    runs,
    setRuns,
  ] =
    useState<
      ReferenceConsensusRun[]
    >([]);

  const [
    selectedKey,
    setSelectedKey,
  ] =
    useState("");

  const [
    selectedRunId,
    setSelectedRunId,
  ] =
    useState("");

  const [
    resolutionText,
    setResolutionText,
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
      setPackages(
        loadReferenceReviewPackages(),
      );
      setRuns(
        loadReferenceConsensusRuns(),
      );
    },
    [],
  );

  const candidateGroups =
    useMemo(
      () =>
        buildCandidateGroups(
          packages,
        ),
      [
        packages,
      ],
    );

  useEffect(
    () => {
      if (
        !selectedKey &&
        candidateGroups[
          0
        ]
      ) {
        setSelectedKey(
          candidateGroups[
            0
          ].key,
        );
      }
    },
    [
      candidateGroups,
      selectedKey,
    ],
  );

  const selectedRun =
    useMemo(
      () =>
        runs.find(
          (run) =>
            run.runId ===
            selectedRunId,
        ) ??
        [
          ...runs,
        ]
          .reverse()
          .find(
            (run) =>
              groupKey(
                run.fragranceId,
                run.versionId,
              ) ===
              selectedKey,
          ),
      [
        runs,
        selectedRunId,
        selectedKey,
      ],
    );

  const selectedGroup =
    candidateGroups.find(
      (group) =>
        group.key ===
        selectedKey,
    );

  const generateConsensus =
    () => {
      if (
        !selectedGroup
      ) {
        return;
      }

      try {
        const run =
          buildReferenceConsensus({
            packages,
            fragranceId:
              selectedGroup
                .fragranceId,
            versionId:
              selectedGroup
                .versionId,
            timestamp:
              new Date()
                .toISOString(),
          });

        const next =
          upsertReferenceConsensusRun(
            run,
          );

        setRuns(
          next,
        );
        setSelectedRunId(
          run.runId,
        );
        setNotice(
          `Consensus generated · ${run.snapshot.metrics.length} metrics · ${run.conflicts.length} unresolved conflicts.`,
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
      if (
        !selectedRun
      ) {
        return;
      }

      const conflict =
        selectedRun.conflicts.find(
          (item) =>
            item.conflictId ===
            conflictId,
        );

      if (
        !conflict
      ) {
        return;
      }

      try {
        const result =
          resolveReferenceConflict({
            conflict,
            status,
            resolution:
              resolutionText[
                conflictId
              ] ??
              "",
            resolvedBy:
              conflictResolverId,
            resolvedAt:
              new Date()
                .toISOString(),
          });

        appendReferenceConflictResolution(
          result.resolution,
        );

        const nextRuns =
          runs.map(
            (run) => {
              if (
                run.runId !==
                selectedRun.runId
              ) {
                return run;
              }

              const conflicts =
                run.conflicts.map(
                  (item) =>
                    item.conflictId ===
                    conflictId
                      ? result.conflict
                      : item,
                );

              return {
                ...run,
                conflicts,
                snapshot: {
                  ...run.snapshot,
                  unresolvedConflictCount:
                    conflicts.filter(
                      (item) =>
                        item.status ===
                        "open",
                    ).length,
                },
              };
            },
          );

        setRuns(
          nextRuns,
        );
        saveReferenceConsensusRuns(
          nextRuns,
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

  const resolutions =
    loadReferenceConflictResolutions();

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/45">
          Reference Intelligence Laboratory
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Consensus + Conflict Detection
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Combine independently reviewed calibration submissions into transparent consensus metrics. Moderate and high disagreement becomes an explicit unresolved conflict.
            </p>
          </div>

          <div className="min-w-[300px]">
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/40">
              Calibration group
            </label>
            <select
              value={
                selectedKey
              }
              onChange={(
                event,
              ) => {
                setSelectedKey(
                  event.target.value,
                );
                setSelectedRunId(
                  "",
                );
                setNotice("");
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            >
              {candidateGroups.length ===
                0 && (
                <option value="">
                  No eligible multi-reviewer groups
                </option>
              )}
              {candidateGroups.map(
                (group) => (
                  <option
                    key={
                      group.key
                    }
                    value={
                      group.key
                    }
                  >
                    {group.fragranceId} · {group.reviewerCount} reviewers
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm font-semibold text-white">
              Transparent calibration consensus
            </p>
            <p className="mt-1 text-xs leading-5 text-white/40">
              Confidence-weighted mean · population variance · explicit score-range thresholds · minimum two independent approved submissions.
            </p>
          </div>

          <button
            type="button"
            onClick={
              generateConsensus
            }
            disabled={
              !selectedGroup
            }
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
          >
            Generate consensus
          </button>
        </div>
      </section>

      {!selectedRun ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8">
          <h2 className="text-xl font-semibold text-white">
            No consensus run selected
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
            A fragrance/version needs at least two independently submitted and fully approved reviewer packages before consensus can be generated.
          </p>
        </section>
      ) : (
        <ConsensusRunPanel
          run={
            selectedRun
          }
          resolutionText={
            resolutionText
          }
          setResolutionText={
            setResolutionText
          }
          resolveConflict={
            resolveConflict
          }
          resolutionCount={
            resolutions.filter(
              (item) =>
                selectedRun.conflicts.some(
                  (conflict) =>
                    conflict.conflictId ===
                    item.conflictId,
                ),
            ).length
          }
        />
      )}

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}

      <p className="text-xs leading-5 text-white/35">
        Consensus is advisory laboratory intelligence. This route does not issue certificates and does not promote any fragrance into recommendation engines.
      </p>
    </div>
  );
}

function ConsensusRunPanel({
  run,
  resolutionText,
  setResolutionText,
  resolveConflict,
  resolutionCount,
}: {
  run:
    ReferenceConsensusRun;
  resolutionText:
    Record<
      string,
      string
    >;
  setResolutionText:
    React.Dispatch<
      React.SetStateAction<
        Record<
          string,
          string
        >
      >
    >;
  resolveConflict: (
    conflictId: string,
    status:
      "resolved" |
      "dismissed",
  ) => void;
  resolutionCount: number;
}) {
  const unresolved =
    recalculateUnresolvedConflictCount({
      run,
      resolvedConflictIds:
        run.conflicts
          .filter(
            (conflict) =>
              conflict.status !==
              "open",
          )
          .map(
            (conflict) =>
              conflict.conflictId,
          ),
    });

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <div className="grid gap-5 md:grid-cols-5">
          <SummaryMetric
            label="Metrics"
            value={
              String(
                run.snapshot
                  .metrics.length,
              )
            }
          />
          <SummaryMetric
            label="Reviewers"
            value={
              String(
                run.reviewerIds
                  .length,
              )
            }
          />
          <SummaryMetric
            label="Confidence"
            value={`${run.snapshot.averageConfidence}%`}
          />
          <SummaryMetric
            label="Open conflicts"
            value={
              String(
                unresolved,
              )
            }
          />
          <SummaryMetric
            label="Resolutions"
            value={
              String(
                resolutionCount,
              )
            }
          />
        </div>

        <p className="mt-5 border-t border-white/10 pt-4 text-xs text-white/35">
          {run.fragranceId} · {run.versionId} · {run.runId}
        </p>
      </section>

      <section className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 p-5 md:p-7">
          <h2 className="text-xl font-semibold text-white">
            Consensus metrics
          </h2>
          <p className="mt-1 text-sm text-white/45">
            The consensus value is confidence weighted. Variance and disagreement remain visible rather than being hidden by the average.
          </p>
        </div>

        <div className="divide-y divide-white/10">
          {run.snapshot.metrics.map(
            (metric) => (
              <div
                key={`${metric.domain}:${metric.metric}`}
                className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_repeat(5,minmax(90px,0.35fr))] md:items-center md:px-7"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                    {metric.domain}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {humanize(
                      metric.metric,
                    )}
                  </p>
                </div>
                <ConsensusCell
                  label="Consensus"
                  value={
                    String(
                      metric.value,
                    )
                  }
                />
                <ConsensusCell
                  label="Confidence"
                  value={`${metric.confidence}%`}
                />
                <ConsensusCell
                  label="Reviewers"
                  value={
                    String(
                      metric.reviewerCount,
                    )
                  }
                />
                <ConsensusCell
                  label="Variance"
                  value={
                    String(
                      metric.variance ??
                      0,
                    )
                  }
                />
                <ConsensusCell
                  label="Conflict"
                  value={
                    metric.conflict
                  }
                />
              </div>
            ),
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <h2 className="text-xl font-semibold text-white">
          Calibration conflicts
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Moderate and high score disagreement blocks future certification until it is explicitly resolved or dismissed with an explanation.
        </p>

        <div className="mt-5 space-y-4">
          {run.conflicts.length ===
            0 && (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-white/55">
              No moderate or high calibration conflicts were detected in this run.
            </div>
          )}

          {run.conflicts.map(
            (conflict) => (
              <div
                key={
                  conflict.conflictId
                }
                className="rounded-2xl border border-white/10 bg-black/20 p-5"
              >
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                      {conflict.domain}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {humanize(
                        conflict.metric,
                      )}
                    </h3>
                  </div>

                  <div className="flex gap-3">
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

                <p className="mt-3 text-xs text-white/40">
                  {conflict.claimIds.length} conflicting claims · {conflict.conflictId}
                </p>

                {conflict.status ===
                "open" ? (
                  <>
                    <textarea
                      value={
                        resolutionText[
                          conflict
                            .conflictId
                        ] ??
                        ""
                      }
                      onChange={(
                        event,
                      ) =>
                        setResolutionText(
                          (
                            current,
                          ) => ({
                            ...current,
                            [conflict.conflictId]:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      className="mt-4 min-h-20 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm leading-6 text-white outline-none"
                      placeholder="Explain why this conflict can be resolved or deliberately dismissed."
                    />

                    <div className="mt-3 flex flex-wrap gap-3">
                      <DecisionButton
                        label="Resolve conflict"
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
                  <div className="mt-4 rounded-xl border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-white/35">
                      Resolution
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      {conflict.resolution}
                    </p>
                    <p className="mt-2 text-xs text-white/30">
                      {conflict.resolvedBy} · {conflict.resolvedAt}
                    </p>
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function buildCandidateGroups(
  packages:
    ReferenceReviewPackage[],
) {
  const grouped =
    new Map<
      string,
      {
        key: string;
        fragranceId: string;
        versionId: string;
        reviewerIds:
          Set<string>;
      }
    >();

  for (
    const item
    of packages
  ) {
    if (
      item.state !==
      "approved"
    ) {
      continue;
    }

    const key =
      groupKey(
        item.submission
          .fragranceId,
        item.submission
          .versionId,
      );

    const current =
      grouped.get(
        key,
      ) ?? {
        key,
        fragranceId:
          item.submission
            .fragranceId,
        versionId:
          item.submission
            .versionId,
        reviewerIds:
          new Set<string>(),
      };

    current.reviewerIds.add(
      item.submission
        .reviewerId,
    );

    grouped.set(
      key,
      current,
    );
  }

  return [
    ...grouped.values(),
  ]
    .filter(
      (group) =>
        group.reviewerIds
          .size >=
        2,
    )
    .map(
      (group) => ({
        key:
          group.key,
        fragranceId:
          group.fragranceId,
        versionId:
          group.versionId,
        reviewerCount:
          group.reviewerIds
            .size,
      }),
    );
}

function groupKey(
  fragranceId: string,
  versionId: string,
) {
  return `${fragranceId}::${versionId}`;
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

function ConsensusCell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold capitalize text-white/80">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/30">
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
