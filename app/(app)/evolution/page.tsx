"use client";

import Link from "next/link";

import {
  Activity,
  BookOpen,
  ArrowRight,
  CalendarDays,
  Check,
  Dna,
  History,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCollection } from "@/components/providers/collection-provider";
import { useEvolutionLedger } from "@/components/evolution/use-evolution-ledger";
import { demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import {
  analyzeCollectionEvolution,
  compareEvolutionSnapshots,
  createEvolutionSnapshot,
} from "@/lib/intelligence/collection-evolution-engine";
import {
  appendEvolutionSnapshot,
} from "@/lib/evolution/evolution-ledger";
import type {
  EvolutionSnapshot,
} from "@/lib/evolution/types";
import { appendTimelineEvent } from "@/lib/timeline/event-ledger";

const dnaOrder = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
] as const;

export default function EvolutionPage() {
  const {
    items,
    hydrated: collectionHydrated,
  } = useCollection();
  const {
    ledger,
    hydrated,
    clear,
  } = useEvolutionLedger();

  const [selectedIndex, setSelectedIndex] =
    useState(0);
  const [baselineIndex, setBaselineIndex] =
    useState(0);
  const [playing, setPlaying] =
    useState(false);

  const snapshots = useMemo(
    () =>
      [...ledger.snapshots].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime(),
      ),
    [ledger.snapshots],
  );

  useEffect(() => {
    if (!snapshots.length) return;
    setSelectedIndex(
      snapshots.length - 1,
    );
  }, [snapshots.length]);

  useEffect(() => {
    if (!playing || snapshots.length < 2) {
      return;
    }

    const timer = window.setInterval(
      () => {
        setSelectedIndex((current) => {
          if (
            current >=
            snapshots.length - 1
          ) {
            setPlaying(false);
            return current;
          }

          return current + 1;
        });
      },
      1150,
    );

    return () =>
      window.clearInterval(timer);
  }, [playing, snapshots.length]);

  const selected =
    snapshots[selectedIndex] ?? null;
  const baseline =
    snapshots[
      Math.min(
        baselineIndex,
        Math.max(0, snapshots.length - 1),
      )
    ] ?? null;

  const intelligence = useMemo(
    () =>
      analyzeCollectionEvolution({
        snapshots,
      }),
    [snapshots],
  );

  const comparison =
    baseline && selected
      ? compareEvolutionSnapshots(
          baseline,
          selected,
        )
      : null;

  function captureSnapshot(
    source: EvolutionSnapshot["source"] =
      "manual",
  ) {
    const snapshot =
      createEvolutionSnapshot({
        collection: items,
        catalog: fragrances,
        profile: demoProfile,
        source,
        captureReason:
          source === "manual"
            ? "manual-capture"
            : source === "baseline"
              ? "tracking-started"
              : "collection-changed",
      });

    appendEvolutionSnapshot(snapshot);
    appendTimelineEvent({
      type: "evolution_snapshot",
      title: "Evolution snapshot captured",
      summary: `${snapshot.collectionSize} bottles, ${snapshot.totalWears} wears, and Collection Health ${snapshot.collectionHealth}.`,
      metadata: {
        snapshotId: snapshot.id,
        captureReason:
          snapshot.captureReason,
        collectionHealth:
          snapshot.collectionHealth,
        collectionSize:
          snapshot.collectionSize,
      },
    });
  }

  function createDemoHistory() {
    const points = [
      {
        count: 2,
        date: "2026-01-10T12:00:00.000Z",
      },
      {
        count: 3,
        date: "2026-02-18T12:00:00.000Z",
      },
      {
        count: 4,
        date: "2026-04-05T12:00:00.000Z",
      },
      {
        count: Math.min(
          5,
          items.length,
        ),
        date: "2026-06-22T12:00:00.000Z",
      },
    ];

    for (const point of points) {
      appendEvolutionSnapshot(
        createEvolutionSnapshot({
          collection: items.slice(
            0,
            point.count,
          ),
          catalog: fragrances,
          profile: demoProfile,
          source: "baseline",
          captureReason:
            "imported-history",
          createdAt: point.date,
        }),
      );
    }

    captureSnapshot("automatic");
  }

  return (
    <div className="evolution-page pb-12">
      <section className="evolution-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="evolution-grid pointer-events-none absolute inset-0" />
        <div className="evolution-aura pointer-events-none absolute -right-48 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="evolution-command-mark">
              <History size={18} />
            </span>
            <div>
              <p className="evolution-kicker">
                OLFACTUS Collection Evolution
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Interactive longitudinal replay ·{" "}
                {intelligence.modelVersion}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/annual-review"
              className="evolution-action"
            >
              <BookOpen size={15} />
              Annual Review
            </Link>
            <span className="evolution-status-chip">
            {snapshots.length} snapshot
            {snapshots.length === 1
              ? ""
              : "s"}
            </span>
          </div>
        </div>

        <div className="relative mt-10 grid gap-10 xl:grid-cols-[1.1fr_.9fr] xl:items-end">
          <div>
            <p className="evolution-kicker">
              Collection Replay
            </p>
            <h1 className="display-serif mt-5 max-w-4xl text-[clamp(4rem,8vw,8rem)] leading-[.86] tracking-[-.06em]">
              Watch your taste become itself.
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Move through historical snapshots to see
              how DNA, health, diversity, rotation, and
              collection identity changed over time.
            </p>
          </div>

          <div className="evolution-summary-card">
            <p className="evolution-kicker">
              Current Change
            </p>
            <p className="display-serif mt-4 text-7xl leading-none text-[var(--gold-bright)]">
              {signed(
                intelligence.healthChange,
              )}
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Collection Health since first snapshot
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniMetric
                label="Diversity"
                value={signed(
                  intelligence.diversityChange,
                )}
              />
              <MiniMetric
                label="Rotation"
                value={signed(
                  intelligence.rotationChange,
                )}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 evolution-panel p-7 sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="evolution-kicker">
              Replay Controls
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              Scrub through collection history.
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="evolution-action"
              onClick={() =>
                captureSnapshot("manual")
              }
              disabled={!collectionHydrated}
            >
              <CalendarDays size={15} />
              Capture Now
            </button>

            {!snapshots.length ? (
              <button
                type="button"
                className="evolution-action"
                onClick={createDemoHistory}
              >
                <Sparkles size={15} />
                Create Replay Baseline
              </button>
            ) : null}

            {snapshots.length ? (
              <button
                type="button"
                className="evolution-action"
                onClick={clear}
              >
                <RotateCcw size={15} />
                Clear
              </button>
            ) : null}
          </div>
        </div>

        {selected ? (
          <>
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                className="evolution-play"
                onClick={() =>
                  setPlaying((value) => !value)
                }
                disabled={
                  snapshots.length < 2
                }
              >
                {playing ? (
                  <Pause size={17} />
                ) : (
                  <Play size={17} />
                )}
              </button>

              <input
                className="evolution-range"
                type="range"
                min={0}
                max={Math.max(
                  0,
                  snapshots.length - 1,
                )}
                value={selectedIndex}
                onChange={(event) => {
                  setPlaying(false);
                  setSelectedIndex(
                    Number(
                      event.target.value,
                    ),
                  );
                }}
              />

              <p className="min-w-[88px] text-right text-xs text-[var(--muted)]">
                {selectedIndex + 1} /{" "}
                {snapshots.length}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="display-serif text-3xl">
                  {new Date(
                    selected.createdAt,
                  ).toLocaleDateString(
                    undefined,
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </p>
                <p className="mt-2 text-sm capitalize text-[var(--muted)]">
                  {selected.source} snapshot ·{" "}
                  {formatCaptureReason(
                    selected.captureReason,
                  )} ·{" "}
                  {selected.collectionSize} bottles ·{" "}
                  {selected.totalWears} wears
                </p>
              </div>

              <label className="evolution-baseline-select">
                <span>Compare from</span>
                <select
                  value={baselineIndex}
                  onChange={(event) =>
                    setBaselineIndex(
                      Number(
                        event.target.value,
                      ),
                    )
                  }
                >
                  {snapshots.map(
                    (snapshot, index) => (
                      <option
                        key={snapshot.id}
                        value={index}
                      >
                        {new Date(
                          snapshot.createdAt,
                        ).toLocaleDateString()}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>
          </>
        ) : (
          <div className="evolution-empty mt-8">
            <History size={32} />
            <p className="display-serif mt-5 text-4xl">
              No evolution history yet.
            </p>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
              Capture the current collection or create a
              replay baseline to begin longitudinal
              analysis.
            </p>
          </div>
        )}
      </section>

      {selected && comparison ? (
        <>
          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ReplayMetric
              label="Collection Health"
              value={selected.collectionHealth}
              change={comparison.health}
            />
            <ReplayMetric
              label="Diversity"
              value={selected.diversity}
              change={comparison.diversity}
            />
            <ReplayMetric
              label="Rotation"
              value={selected.rotation}
              change={comparison.rotation}
            />
            <ReplayMetric
              label="Role Coverage"
              value={selected.roleCoverage}
              change={comparison.roleCoverage}
            />
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
            <article className="evolution-panel p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <Dna
                  size={18}
                  className="text-[var(--gold)]"
                />
                <div>
                  <p className="evolution-kicker">
                    Taste DNA Replay
                  </p>
                  <h2 className="display-serif mt-2 text-4xl">
                    How the scent profile moved.
                  </h2>
                </div>
              </div>

              <div className="mt-8 space-y-5">
                {dnaOrder.map(
                  (dimension) => {
                    const value =
                      selected.dna[
                        dimension
                      ];
                    const change =
                      comparison.dna[
                        dimension
                      ];

                    return (
                      <div key={dimension}>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="capitalize font-semibold">
                              {dimension}
                            </p>
                            <p className="mt-1 text-xs text-[var(--muted)]">
                              {signed(change)} from selected baseline
                            </p>
                          </div>
                          <p className="display-serif text-3xl text-[var(--gold-bright)]">
                            {value}
                          </p>
                        </div>
                        <div className="evolution-dna-bar mt-3">
                          <span
                            style={{
                              width: `${value}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </article>

            <article className="evolution-panel evolution-briefing p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <Sparkles
                  size={18}
                  className="text-[var(--gold)]"
                />
                <p className="evolution-kicker">
                  OLFACTUS Evolution Analyst
                </p>
              </div>

              <blockquote className="display-serif mt-7 text-3xl leading-[1.4]">
                “{intelligence.briefing}”
              </blockquote>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <ShiftCard
                  label="Rising DNA"
                  value={
                    intelligence
                      .strongestRisingDna
                      ? `${capitalize(
                          intelligence
                            .strongestRisingDna
                            .dimension,
                        )} ${signed(
                          intelligence
                            .strongestRisingDna
                            .change,
                        )}`
                      : "Stable"
                  }
                />
                <ShiftCard
                  label="Falling DNA"
                  value={
                    intelligence
                      .strongestFallingDna
                      ? `${capitalize(
                          intelligence
                            .strongestFallingDna
                            .dimension,
                        )} ${signed(
                          intelligence
                            .strongestFallingDna
                            .change,
                        )}`
                      : "Stable"
                  }
                />
                <ShiftCard
                  label="Dominant Brand"
                  value={
                    intelligence
                      .dominantBrandShift
                      .after ?? "None"
                  }
                />
                <ShiftCard
                  label="Dominant Family"
                  value={
                    intelligence
                      .dominantFamilyShift
                      .after ?? "None"
                  }
                />
              </div>
            </article>
          </section>

          <section className="mt-8 evolution-panel p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <Activity
                size={18}
                className="text-[var(--gold)]"
              />
              <div>
                <p className="evolution-kicker">
                  Before & After
                </p>
                <h2 className="display-serif mt-2 text-4xl">
                  The collection at two moments.
                </h2>
              </div>
            </div>

            <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
              <SnapshotCard
                label="Baseline"
                snapshot={baseline!}
              />
              <ArrowRight
                size={30}
                className="mx-auto rotate-90 text-[var(--gold)] xl:rotate-0"
              />
              <SnapshotCard
                label="Selected"
                snapshot={selected}
              />
            </div>
          </section>

          <section className="mt-8 evolution-panel p-7 sm:p-9">
            <p className="evolution-kicker">
              Evolution Milestones
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              The moments that changed the collection.
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {intelligence.milestones.map(
                (milestone) => (
                  <article
                    key={milestone.id}
                    className={`evolution-milestone ${
                      milestone.achieved
                        ? "is-achieved"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="evolution-milestone-icon">
                        {milestone.achieved ? (
                          <Check size={15} />
                        ) : (
                          <History size={15} />
                        )}
                      </span>
                      <span className="text-sm text-[var(--gold-bright)]">
                        {milestone.progress}%
                      </span>
                    </div>
                    <p className="display-serif mt-5 text-3xl">
                      {milestone.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                      {milestone.description}
                    </p>
                  </article>
                ),
              )}
            </div>
          </section>
        </>
      ) : null}

      {!hydrated ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Loading evolution ledger…
        </p>
      ) : null}
    </div>
  );
}

function ReplayMetric({
  label,
  value,
  change,
}: {
  label: string;
  value: number;
  change: number;
}) {
  const positive = change >= 0;

  return (
    <article className="evolution-stat">
      <p>{label}</p>
      <strong>{value}</strong>
      <span
        className={
          positive
            ? "is-positive"
            : "is-negative"
        }
      >
        {positive ? (
          <TrendingUp size={14} />
        ) : (
          <TrendingDown size={14} />
        )}
        {signed(change)}
      </span>
    </article>
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
    <div className="evolution-mini">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function ShiftCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="evolution-shift">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function SnapshotCard({
  label,
  snapshot,
}: {
  label: string;
  snapshot: EvolutionSnapshot;
}) {
  return (
    <article className="evolution-snapshot-card">
      <p className="evolution-kicker">
        {label}
      </p>
      <p className="display-serif mt-4 text-3xl">
        {new Date(
          snapshot.createdAt,
        ).toLocaleDateString()}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <SnapshotMetric
          label="Health"
          value={snapshot.collectionHealth}
        />
        <SnapshotMetric
          label="Bottles"
          value={snapshot.collectionSize}
        />
        <SnapshotMetric
          label="Diversity"
          value={snapshot.diversity}
        />
        <SnapshotMetric
          label="Rotation"
          value={snapshot.rotation}
        />
      </div>
    </article>
  );
}

function SnapshotMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <p className="text-[.5rem] uppercase tracking-[.1em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-3xl text-[var(--gold-bright)]">
        {value}
      </p>
    </div>
  );
}

function formatCaptureReason(
  value: EvolutionSnapshot["captureReason"],
) {
  return value
    .split("-")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
