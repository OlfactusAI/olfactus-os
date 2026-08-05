"use client";

import Link from "next/link";

import { HealthDimensions } from "@/components/features/health-dimensions";
import { PageHeader } from "@/components/features/page-header";
import { IntelligenceStatus } from "@/components/intelligence/IntelligenceStatus";
import { useCollection } from "@/components/providers/collection-provider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { runNeuralCore } from "@/lib/intelligence/intelligence-engine";

export default function TodayPage() {
  const { analysis, owned, logWear, hydrated } = useCollection();

  const intelligence = runNeuralCore({
    analysis,
    owned,
    hydrated,
  });

  const recommendation = intelligence.primaryRecommendation;
  const topAction = intelligence.priorityAction;
  const collectionInsight =
    intelligence.collectionIntelligence.priorityInsight;

  return (
    <>
      <PageHeader
        eyebrow="Daily intelligence briefing"
        title="Good morning, Steve"
        description="The highest-value decisions from your live collection, summarized for today."
      />

      <IntelligenceStatus intelligence={intelligence} />

      {!hydrated && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Loading your saved collection…
        </p>
      )}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="relative min-h-[330px] overflow-hidden xl:col-span-8">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(230,168,74,.17),transparent_65%)]" />

          <div className="relative flex items-start justify-between gap-4">
            <Eyebrow>Today&apos;s recommendation</Eyebrow>

            {recommendation && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-xs text-[var(--gold)]">
                {recommendation.confidence}% confidence
              </span>
            )}
          </div>

          <h2 className="display-serif relative mt-7 text-4xl sm:text-5xl">
            {recommendation?.fragranceName ?? "Build your collection"}
          </h2>

          <p className="relative mt-4 max-w-xl leading-7 text-[var(--muted)]">
            {recommendation?.explanation ??
              "Add your first fragrance to unlock daily wear intelligence."}
          </p>

          {recommendation && (
            <p className="relative mt-4 text-sm">
              <span className="text-[var(--muted)]">
                Recommendation score{" "}
              </span>

              <strong className="text-[var(--foreground)]">
                {recommendation.score}/100
              </strong>
            </p>
          )}

          <div className="relative mt-6 flex flex-wrap gap-3">
            {recommendation && (
              <Button
                variant="primary"
                onClick={() => logWear(recommendation.fragranceId)}
              >
                Wear today
              </Button>
            )}

            <Link
              href="/collection"
              className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[rgba(200,168,102,.35)]"
            >
              Open collection
            </Link>
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <Eyebrow>Collection health</Eyebrow>

          <p className="display-serif mt-5 text-7xl text-[var(--gold)]">
            {intelligence.collectionHealth.score}
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {intelligence.collectionHealth.status}
          </h2>

          <p className="mt-4 leading-7 text-[var(--muted)]">
            {intelligence.collectionHealth.summary}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4 text-sm">
            <span className="text-[var(--muted)]">
              Intelligence confidence
            </span>

            <strong>{intelligence.collectionIntelligence.confidence}%</strong>
          </div>
        </Card>

        <Card className="xl:col-span-7">
          <Eyebrow>Collection intelligence</Eyebrow>

          {collectionInsight ? (
            <>
              <div className="mt-5 flex items-start justify-between gap-4">
                <h2 className="display-serif text-3xl">
                  {collectionInsight.title}
                </h2>

                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">
                  {collectionInsight.severity}
                </span>
              </div>

              <p className="mt-4 leading-7 text-[var(--muted)]">
                {collectionInsight.explanation}
              </p>

              {collectionInsight.action && (
                <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--gold)]">
                    Recommended action
                  </p>

                  <p className="mt-2 text-sm leading-6">
                    {collectionInsight.action}
                  </p>
                </div>
              )}

              {collectionInsight.projectedImpact !== undefined && (
                <p className="mt-5 text-sm">
                  <span className="text-[var(--muted)]">
                    Projected health impact{" "}
                  </span>

                  <strong className="text-[var(--success)]">
                    +{collectionInsight.projectedImpact}
                  </strong>
                </p>
              )}
            </>
          ) : (
            <p className="mt-5 text-[var(--muted)]">
              Add more collection data to generate strategic insights.
            </p>
          )}
        </Card>

        <Card className="xl:col-span-5">
          <Eyebrow>Best next move</Eyebrow>

          <h2 className="display-serif mt-5 text-3xl">
            {topAction?.title ?? "Add fragrances to begin"}
          </h2>

          <p className="mt-4 leading-7 text-[var(--muted)]">
            {topAction?.reason ??
              "OLFACTUS needs a collection before it can generate a strategic action."}
          </p>

          {topAction && (
            <p className="mt-6 text-sm">
              <span className="text-[var(--muted)]">
                Projected health impact{" "}
              </span>

              <strong className="text-[var(--success)]">
                +{topAction.projectedImpact}
              </strong>
            </p>
          )}
        </Card>

        <Card className="xl:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Eyebrow>Health dimensions</Eyebrow>

            <p className="text-xs text-[var(--muted)]">
              {
                intelligence.collectionIntelligence
                  .collectionSize
              }{" "}
              fragrances ·{" "}
              {intelligence.collectionIntelligence.totalWears} total wears
            </p>
          </div>

          <div className="mt-6">
            <HealthDimensions analysis={analysis} />
          </div>
        </Card>
      </section>
    </>
  );
}