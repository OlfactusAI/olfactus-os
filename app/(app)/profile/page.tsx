"use client";

import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Compass,
  Flag,
  Gauge,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { CoachActionCard } from "@/components/coach/coach-action-card";
import { useCoachMemory } from "@/components/coach/use-coach-memory";
import { NeuralConfidenceCore } from "@/components/intelligence/neural-confidence-core";
import { useCollection } from "@/components/providers/collection-provider";
import { ProfileIntelligenceWorkspace } from "@/components/profile/profile-intelligence-workspace";
import { Button } from "@/components/ui/button";
import {
  runCollectionCoach,
  type CoachGoal,
} from "@/lib/intelligence/collection-coach-engine";

const goalOptions: Array<{
  value: CoachGoal;
  label: string;
}> = [
  { value: "health", label: "Collection Health" },
  { value: "rotation", label: "Rotation" },
  { value: "diversity", label: "DNA Diversity" },
  {
    value: "seasonal-balance",
    label: "Seasonal Balance",
  },
  { value: "signature", label: "Signature Identity" },
  { value: "buy-less", label: "Buy Less, Wear More" },
];

export default function ProfilePage() {
  const {
    owned,
    available,
    analysis,
    logWear,
    addFragrance,
    hydrated: collectionHydrated,
  } = useCollection();

  const {
    memory,
    hydrated: memoryHydrated,
    completeAction,
    reopenAction,
    dismissAction,
    setActiveGoal,
    rememberRecommendation,
  } = useCoachMemory();

  const coach = useMemo(
    () =>
      runCollectionCoach({
        owned: owned.map(({ item, fragrance }) => ({
          fragrance,
          wearCount: item.wearCount,
          daysSinceLastWear:
            item.daysSinceLastWear,
          favorite: item.favorite ?? false,
        })),
        available,
        analysis,
        memory,
      }),
    [analysis, available, memory, owned],
  );

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  function completePriority(
    action: (typeof coach.priorities)[number],
  ) {
    if (
      action.type === "wear" &&
      action.fragranceId
    ) {
      logWear(action.fragranceId);
      rememberRecommendation(action.fragranceId);
    }

    if (
      action.type === "explore" &&
      action.fragranceId
    ) {
      rememberRecommendation(action.fragranceId);
    }

    completeAction(action.id);
  }

  return (
    <div className="coach-page pb-12">
      <section className="coach-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="coach-grid pointer-events-none absolute inset-0" />
        <div className="coach-aura pointer-events-none absolute -right-44 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="coach-command-mark grid h-11 w-11 place-items-center rounded-full">
              <BrainCircuit size={18} />
            </span>
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                OLFACTUS AI Collection Coach
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Proactive collection guidance · {coach.modelVersion}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="coach-status-chip">
              <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              Coach online
            </span>
            <span className="coach-status-chip">
              Memory active
            </span>
          </div>
        </div>

        <div className="relative mt-10 grid gap-12 xl:grid-cols-[1.15fr_.85fr] xl:items-center">
          <div>
            <p className="text-sm text-[var(--muted)]">
              {greeting}, Steve.
            </p>

            <h1 className="display-serif mt-4 max-w-4xl text-[clamp(3.6rem,7vw,7.4rem)] leading-[.88] tracking-[-.055em]">
              Your collection has
              <span className="block text-[var(--gold-bright)]">
                a next move.
              </span>
            </h1>

            <blockquote className="display-serif mt-8 max-w-4xl text-2xl leading-[1.35] text-[var(--foreground)] sm:text-3xl">
              “{coach.briefing}”
            </blockquote>

            <div className="mt-8 flex flex-wrap gap-3">
              {coach.priorities[0] ? (
                <Button
                  variant="primary"
                  onClick={() =>
                    completePriority(
                      coach.priorities[0],
                    )
                  }
                >
                  <Check size={16} />
                  Complete top priority
                </Button>
              ) : null}

              {coach.discoveryCandidate ? (
                <Button
                  onClick={() =>
                    addFragrance(
                      coach.discoveryCandidate!
                        .fragrance.id,
                    )
                  }
                >
                  <Compass size={16} />
                  Add strategic candidate
                </Button>
              ) : null}
            </div>
          </div>

          <div className="coach-focus-stage relative min-h-[430px]">
            <div className="coach-focus-orbit">
              <span className="coach-orbit-ring ring-one" />
              <span className="coach-orbit-ring ring-two" />
              <span className="coach-orbit-ring ring-three" />
              <span className="coach-orbit-node node-a" />
              <span className="coach-orbit-node node-b" />
            </div>

            <div className="coach-focus-card">
              <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
                Today&apos;s focus
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                {coach.focusTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                {coach.focusExplanation}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <MiniMetric
                  label="Health"
                  value={analysis.score}
                />
                <MiniMetric
                  label="Priorities"
                  value={coach.priorities.length}
                />
              </div>
            </div>

            <div className="absolute bottom-0 right-0 z-20">
              <NeuralConfidenceCore
                value={coach.coachConfidence}
                label="Coach confidence"
                size="medium"
              />
            </div>
          </div>
        </div>

        <div className="relative mt-8 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Collection Health"
            value={analysis.score}
          />
          <HeroMetric
            label="Rotation"
            value={analysis.dimensions.rotation}
          />
          <HeroMetric
            label="DNA Diversity"
            value={analysis.dimensions.diversity}
          />
          <HeroMetric
            label="Season Balance"
            value={
              analysis.dimensions.seasonalBalance
            }
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <article className="coach-priority-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Today&apos;s priorities
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Ranked actions, not generic advice.
              </h2>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {coach.priorities.length} active
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {coach.priorities.map((action) => (
              <CoachActionCard
                key={action.id}
                action={action}
                completed={memory.completedActionIds.includes(
                  action.id,
                )}
                onComplete={() =>
                  completePriority(action)
                }
                onReopen={() =>
                  reopenAction(action.id)
                }
                onDismiss={() =>
                  dismissAction(action.id)
                }
              />
            ))}
          </div>
        </article>

        <article className="coach-goal-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Active coaching goal
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                {coach.goal.label}
              </h2>
            </div>
            <Flag
              size={44}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <label className="coach-goal-select mt-7">
            <span>Goal</span>
            <select
              value={memory.activeGoal}
              onChange={(event) =>
                setActiveGoal(
                  event.target.value as CoachGoal,
                )
              }
            >
              {goalOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </label>

          <div className="mt-8 flex items-end justify-between gap-5">
            <div>
              <p className="text-xs text-[var(--muted)]">
                Current
              </p>
              <p className="display-serif mt-2 text-6xl text-[var(--gold-bright)]">
                {coach.goal.current}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--muted)]">
                Target
              </p>
              <p className="display-serif mt-2 text-5xl">
                {coach.goal.target}
              </p>
            </div>
          </div>

          <div className="coach-progress-track mt-7">
            <span
              style={{
                width: `${coach.goal.progress}%`,
              }}
            />
          </div>

          <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
            {coach.goal.explanation}
          </p>

          <div className="mt-6 rounded-[22px] border border-[var(--border)] bg-black/10 p-5">
            <p className="text-[.58rem] font-bold uppercase tracking-[.15em] text-[var(--gold)]">
              Remaining
            </p>
            <p className="display-serif mt-2 text-3xl">
              {coach.goal.remaining} points
            </p>
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[.92fr_1.08fr]">
        <article className="coach-timeline-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Seven-day coach plan
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                A practical week ahead.
              </h2>
            </div>
            <Clock3
              size={44}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-8">
            {coach.timeline.map((day, index) => (
              <div
                key={`${day.dayIndex}-${day.actionId}`}
                className="coach-timeline-row"
              >
                {index < coach.timeline.length - 1 ? (
                  <span className="coach-timeline-line" />
                ) : null}
                <span
                  className={`coach-timeline-dot ${
                    day.completed ? "is-complete" : ""
                  }`}
                >
                  {day.completed ? (
                    <Check size={11} />
                  ) : (
                    <CircleDot size={11} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[.58rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
                      {day.label}
                    </p>
                    <p className="text-[.55rem] font-bold uppercase tracking-[.13em] text-[var(--gold)]">
                      {day.actionType}
                    </p>
                  </div>
                  <p className="mt-2 font-semibold">
                    {day.title}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {day.subject}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="coach-opportunity-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Opportunity radar
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Highest-value improvements.
              </h2>
            </div>
            <Target
              size={44}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {coach.opportunities.map(
              (opportunity, index) => (
                <div
                  key={opportunity.id}
                  className="coach-opportunity-card rounded-[24px] border border-[var(--border)] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="display-serif text-2xl text-[var(--gold)]">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <p className="display-serif text-3xl text-[var(--gold-bright)]">
                      +{opportunity.projectedImpact}
                    </p>
                  </div>

                  <p className="mt-4 text-[.57rem] font-bold uppercase tracking-[.15em] text-[var(--gold)]">
                    {opportunity.category}
                  </p>
                  <h3 className="display-serif mt-2 text-3xl">
                    {opportunity.label}
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
                    {opportunity.explanation}
                  </p>

                  <div className="coach-progress-track mt-5">
                    <span
                      style={{
                        width: `${opportunity.score}%`,
                      }}
                    />
                  </div>

                  {opportunity.candidateId ? (
                    <Button
                      className="mt-5 w-full"
                      onClick={() =>
                        addFragrance(
                          opportunity.candidateId!,
                        )
                      }
                    >
                      Explore opportunity
                      <ArrowRight size={14} />
                    </Button>
                  ) : null}
                </div>
              ),
            )}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <InsightCard
          icon={<Activity size={17} />}
          label="Strongest identity"
          value={coach.strongestDna
            .slice(0, 3)
            .map(capitalize)
            .join(" · ")}
          explanation="These DNA directions currently define the collection."
        />
        <InsightCard
          icon={<Gauge size={17} />}
          label="Weakest season"
          value={capitalize(coach.weakestSeason)}
          explanation="Future wears and additions should strengthen this climate window."
        />
        <InsightCard
          icon={<TrendingUp size={17} />}
          label="Purchase guidance"
          value={
            coach.purchasePauseRecommended
              ? "Pause buying"
              : "Strategic purchase allowed"
          }
          explanation={
            coach.purchasePauseRecommended
              ? "Improve rotation and use existing bottles before adding another."
              : "The collection is ready for one high-value addition."
          }
        />
      </section>

      <ProfileIntelligenceWorkspace
        owned={owned.map(({ item, fragrance }) => ({
          fragrance,
          wearCount: item.wearCount,
          favorite: item.favorite ?? false,
          daysSinceLastWear: item.daysSinceLastWear,
        }))}
        analysis={analysis}
        completedCoachActions={memory.completedActionIds.length}
      />

      {!collectionHydrated || !memoryHydrated ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Loading collection and coaching memory…
        </p>
      ) : null}
    </div>
  );
}

function HeroMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="coach-hero-metric">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[.59rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
          {label}
        </p>
        <p className="text-sm text-[var(--gold-bright)]">
          {value}
        </p>
      </div>
      <div className="coach-progress-track mt-3">
        <span style={{ width: `${value}%` }} />
      </div>
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

function InsightCard({
  icon,
  label,
  value,
  explanation,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  explanation: string;
}) {
  return (
    <article className="coach-insight-card rounded-[28px] border border-[var(--border)] p-7">
      <div className="flex items-center gap-3 text-[var(--gold)]">
        {icon}
        <p className="text-[.6rem] font-bold uppercase tracking-[.17em]">
          {label}
        </p>
      </div>
      <p className="display-serif mt-5 text-3xl">
        {value}
      </p>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {explanation}
      </p>
    </article>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
