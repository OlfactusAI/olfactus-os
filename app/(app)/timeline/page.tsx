"use client";

import Link from "next/link";

import { useMemo } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  Clock3,
  Dna,
  History,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { useTimelineLedger } from "@/components/timeline/use-timeline-ledger";
import { usePredictionLedger } from "@/components/timeline/use-prediction-ledger";
import { PredictionAccuracyPanel } from "@/components/timeline/prediction-accuracy-panel";
import { useCollection } from "@/components/providers/collection-provider";
import { fragrances } from "@/lib/data/fragrances";
import { analyzePredictionAccuracy } from "@/lib/intelligence/prediction-accuracy-engine";
import { InteractiveEvolutionChart } from "@/components/timeline/interactive-evolution-chart";
import { TimelineEventEditor } from "@/components/timeline/timeline-event-editor";
import { Button } from "@/components/ui/button";
import { analyzeTimelineIntelligence } from "@/lib/intelligence/timeline-intelligence-engine";
import type { TimelineEventType } from "@/lib/timeline/types";

const eventLabels: Record<TimelineEventType, string> = {
  baseline_created: "Baseline",
  bottle_added: "Bottle Added",
  bottle_removed: "Bottle Removed",
  wear_logged: "Wear",
  favorite_changed: "Favorite",
  collection_health_updated: "Health Snapshot",
  genome_snapshot: "Genome",
  coach_action_completed: "Coach",
  decision_completed: "Decision",
  deal_analyzed: "Deal Analysis",
  evolution_snapshot: "Evolution Snapshot",
  annual_review_generated: "Annual Review",
  purchase_skipped: "Purchase Avoided",
  profile_updated: "Profile",
  sample_added: "Sample",
  decant_added: "Decant",
  bottle_finished: "Finished",
  bottle_upgraded: "Upgrade",
  repurchased: "Repurchase",
  milestone_reached: "Milestone",
  collection_value_updated: "Value Update",
  simulation_applied: "Simulation Applied",
};

export default function TimelinePage() {
  const { ledger, hydrated, clear } =
    useTimelineLedger();
  const {
    records: predictionRecords,
    hydrated: predictionsHydrated,
  } = usePredictionLedger();
  const {
    items,
    analysis: collectionAnalysis,
  } = useCollection();
  const intelligence = useMemo(
    () =>
      analyzeTimelineIntelligence({
        events: ledger.events,
        ledgerCreatedAt: ledger.createdAt,
      }),
    [ledger],
  );

  const predictionAccuracy = useMemo(
    () =>
      analyzePredictionAccuracy({
        predictions: predictionRecords,
        collection: items,
        fragrances,
        currentCollectionHealth:
          collectionAnalysis.score,
        currentRedundancy:
          collectionAnalysis.dimensions.redundancy,
      }),
    [
      collectionAnalysis,
      items,
      predictionRecords,
    ],
  );

  return (
    <div className="timeline-page pb-12">
      <section className="timeline-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="timeline-grid pointer-events-none absolute inset-0" />
        <div className="timeline-aura pointer-events-none absolute -right-48 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="timeline-command-mark">
              <History size={18} />
            </span>
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                OLFACTUS Collection Timeline
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Longitudinal collection intelligence · {intelligence.modelVersion}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/annual-review"
              className="timeline-status-chip"
            >
              Annual Review
            </Link>
            <span className="timeline-status-chip">
              Event ledger active
            </span>
          </div>
        </div>

        <div className="relative mt-10 grid gap-10 xl:grid-cols-[1.08fr_.92fr] xl:items-end">
          <div>
            <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
              Collection Evolution
            </p>
            <h1 className="display-serif mt-5 text-[clamp(3.8rem,7.2vw,7.5rem)] leading-[.88] tracking-[-.055em]">
              Every bottle.
              <span className="block text-[var(--gold-bright)]">
                Every decision. Remembered.
              </span>
            </h1>
            <blockquote className="display-serif mt-8 max-w-4xl text-2xl leading-[1.35] sm:text-3xl">
              “{intelligence.briefing}”
            </blockquote>
          </div>

          <div className="timeline-hero-summary rounded-[28px] border border-[var(--border)] p-7">
            <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
              Current State
            </p>
            <p className="display-serif mt-3 text-7xl text-[var(--gold-bright)]">
              {intelligence.currentSnapshot?.collectionHealth ?? "—"}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Collection Health
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniMetric
                label="Rotation"
                value={intelligence.currentSnapshot?.rotation ?? 0}
              />
              <MiniMetric
                label="Diversity"
                value={intelligence.currentSnapshot?.diversity ?? 0}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-9 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Timeline Age"
            value={intelligence.collectionAgeDays}
            suffix=" days"
          />
          <HeroMetric
            label="Events"
            value={intelligence.totalEvents}
          />
          <HeroMetric
            label="Wears Logged"
            value={intelligence.totalWearsLogged}
          />
          <HeroMetric
            label="Bottles Added"
            value={intelligence.bottlesAdded}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.22fr_.78fr]">
        <article className="timeline-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div>
            <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
              Interactive Evolution
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              Explore every retained change.
            </h2>
          </div>

          <div className="mt-7">
            <InteractiveEvolutionChart
              events={ledger.events}
            />
          </div>
        </article>

        <article className="timeline-panel timeline-projection rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <TrendingUp
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
              Future Projection
            </p>
          </div>

          {intelligence.projection ? (
            <>
              <p className="display-serif mt-7 text-4xl">
                {intelligence.projection.metric}
              </p>
              <div className="mt-7 flex items-end justify-between gap-6">
                <div>
                  <p className="text-xs text-[var(--muted)]">Current</p>
                  <p className="display-serif mt-2 text-6xl">
                    {intelligence.projection.current}
                  </p>
                </div>
                <TrendingUp className="mb-4 text-[var(--gold)]" />
                <div className="text-right">
                  <p className="text-xs text-[var(--muted)]">
                    {intelligence.projection.days}-day projection
                  </p>
                  <p className="display-serif mt-2 text-6xl text-[var(--gold-bright)]">
                    {intelligence.projection.projected}
                  </p>
                </div>
              </div>
              <p className="mt-7 text-sm leading-7 text-[var(--muted)]">
                {intelligence.projection.explanation}
              </p>
            </>
          ) : (
            <p className="mt-6 text-sm text-[var(--muted)]">
              A projection will appear after the first health snapshot.
            </p>
          )}
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <article className="timeline-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
                Milestones
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Meaningful progress.
              </h2>
            </div>
            <Target
              size={44}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-7 divide-y divide-[var(--border)]">
            {intelligence.milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="py-5"
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`timeline-milestone-icon ${
                      milestone.achieved ? "is-achieved" : ""
                    }`}
                  >
                    <Check size={13} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-semibold">{milestone.label}</p>
                      <p className="text-sm text-[var(--gold-bright)]">
                        {milestone.progress}%
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {milestone.description}
                    </p>
                    <div className="timeline-progress mt-3">
                      <span style={{ width: `${milestone.progress}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="timeline-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
                Event Ledger
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                The collector journey.
              </h2>
            </div>
            <Button onClick={clear}>
              Clear timeline
            </Button>
          </div>

          <div className="mt-8">
            {intelligence.recentEvents.map((event, index) => (
              <div
                key={event.id}
                className="timeline-event-row"
              >
                {index < intelligence.recentEvents.length - 1 ? (
                  <span className="timeline-event-line" />
                ) : null}
                <span className="timeline-event-dot" />
                <div className="min-w-0 flex-1 rounded-[22px] border border-[var(--border)] bg-black/10 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="timeline-event-type">
                      {eventLabels[event.type]}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="display-serif mt-3 text-2xl">
                    {event.title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {event.summary}
                  </p>
                </div>
              </div>
            ))}

            {!intelligence.recentEvents.length ? (
              <p className="text-sm text-[var(--muted)]">
                Use OLFACTUS to begin recording collection history.
              </p>
            ) : null}
          </div>
        </article>
      </section>

      <div className="mt-8">
        <TimelineEventEditor
          events={ledger.events}
        />
      </div>

      <div className="mt-8">
        <PredictionAccuracyPanel
          analysis={predictionAccuracy}
        />
      </div>

      {!hydrated || !predictionsHydrated ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Loading the persistent event and prediction ledgers…
        </p>
      ) : null}
    </div>
  );
}

function HeroMetric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="timeline-hero-metric">
      <p className="text-[.56rem] font-bold uppercase tracking-[.13em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-4xl text-[var(--gold-bright)]">
        {value}
        <span className="text-base text-[var(--muted)]">{suffix}</span>
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/[.025] p-4">
      <p className="text-[.52rem] font-bold uppercase tracking-[.13em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-3xl text-[var(--gold-bright)]">
        {value}
      </p>
    </div>
  );
}
