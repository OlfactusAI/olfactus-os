"use client";

import Link from "next/link";

import { HealthDimensions } from "@/components/features/health-dimensions";
import { NeuralHeader } from "@/components/intelligence/NeuralHeader";
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
  const alternatives = intelligence.alternativeRecommendations;
  const collectionInsight =
    intelligence.collectionIntelligence.priorityInsight;
  const rotation = intelligence.rotationIntelligence;

  return (
    <div className="space-y-6">
      <NeuralHeader intelligence={intelligence} />

      {!hydrated && (
        <p className="text-sm text-[var(--muted)]">
          Loading your saved collection…
        </p>
      )}

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="relative min-h-[430px] overflow-hidden border-[rgba(200,168,102,.2)] xl:col-span-8">
          <div className="pointer-events-none absolute -right-20 -top-28 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(224,169,72,.19),transparent_66%)]" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <Eyebrow>Today&apos;s decision</Eyebrow>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Highest-value wear recommendation
              </p>
            </div>

            {recommendation && (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3 text-right">
                <p className="text-[.63rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
                  Confidence
                </p>
                <p className="display-serif mt-1 text-3xl text-[var(--gold)]">
                  {recommendation.confidence}%
                </p>
              </div>
            )}
          </div>

          <div className="relative mt-12">
            <p className="text-xs font-bold uppercase tracking-[.17em] text-[var(--muted)]">
              Wear
            </p>

            <h1 className="display-serif mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">
              {recommendation?.fragranceName ?? "Build your collection"}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)]">
              {recommendation?.explanation ??
                "Add your first fragrance to unlock personalized daily intelligence."}
            </p>

            {recommendation && (
              <div className="mt-6 flex flex-wrap gap-8">
                <MetricInline
                  label="Recommendation score"
                  value={`${recommendation.score}/100`}
                />
                <MetricInline
                  label="Confidence"
                  value={`${recommendation.confidence}%`}
                />
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
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
          </div>
        </Card>

        <Card className="xl:col-span-4">
          <Eyebrow>Collection status</Eyebrow>

          <div className="mt-7 grid grid-cols-2 gap-4">
            <Metric label="Health" value={intelligence.collectionHealth.score} />
            <Metric label="Rotation" value={rotation.healthScore} />
            <Metric
              label="Fragrances"
              value={intelligence.collectionIntelligence.collectionSize}
              suffix=""
            />
            <Metric
              label="Total wears"
              value={intelligence.collectionIntelligence.totalWears}
              suffix=""
            />
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <p className="text-sm font-semibold">
              {intelligence.collectionHealth.status}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {intelligence.collectionHealth.summary}
            </p>
          </div>
        </Card>

        <Card className="xl:col-span-7">
          <Eyebrow>Priority intelligence</Eyebrow>

          {collectionInsight ? (
            <>
              <div className="mt-6 flex items-start justify-between gap-5">
                <h2 className="display-serif max-w-xl text-3xl leading-tight">
                  {collectionInsight.title}
                </h2>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[.62rem] font-bold uppercase tracking-[.14em] text-[var(--gold)]">
                  {collectionInsight.severity}
                </span>
              </div>

              <p className="mt-4 max-w-2xl leading-7 text-[var(--muted)]">
                {collectionInsight.explanation}
              </p>

              {collectionInsight.action && (
                <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-5">
                  <p className="text-[.63rem] font-bold uppercase tracking-[.14em] text-[var(--gold)]">
                    Recommended action
                  </p>
                  <p className="mt-2 leading-7">{collectionInsight.action}</p>
                </div>
              )}

              {collectionInsight.projectedImpact !== undefined && (
                <p className="mt-5 text-sm">
                  <span className="text-[var(--muted)]">
                    Projected Collection Health impact{" "}
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
          <div className="flex items-start justify-between gap-4">
            <Eyebrow>Rotation intelligence</Eyebrow>
            <span className="rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-3 py-1 text-[.68rem] text-[var(--gold)]">
              {rotation.status}
            </span>
          </div>

          <p className="display-serif mt-6 text-6xl text-[var(--gold)]">
            {rotation.healthScore}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">Rotation Health</p>

          <div className="mt-6 grid gap-3">
            <StatusRow
              label="Active rotation"
              value={`${rotation.activeRotationSize} fragrances`}
            />
            <StatusRow label="Neglected" value={`${rotation.neglected.length}`} />
            <StatusRow label="Overused" value={`${rotation.overused.length}`} />
            <StatusRow label="Confidence" value={`${rotation.confidence}%`} />
          </div>

          {intelligence.rotationAlert && (
            <div className="mt-6 rounded-2xl border border-[rgba(200,168,102,.18)] bg-[rgba(200,168,102,.05)] p-4">
              <p className="text-[.63rem] font-bold uppercase tracking-[.14em] text-[var(--gold)]">
                Rotation alert
              </p>
              <p className="mt-2 font-semibold">
                {intelligence.rotationAlert.fragranceName}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Not worn in {intelligence.rotationAlert.daysSinceLastWear} days
              </p>
            </div>
          )}
        </Card>

        <Card className="xl:col-span-7">
          <Eyebrow>Alternative decisions</Eyebrow>

          <div className="mt-6 grid gap-3">
            {alternatives.length > 0 ? (
              alternatives.map((alternative, index) => (
                <div
                  key={alternative.fragranceId}
                  className="flex items-center justify-between gap-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="display-serif text-2xl text-[var(--gold)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {alternative.fragranceName}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">
                        {alternative.explanation}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <strong className="text-sm">
                      {alternative.score}/100
                    </strong>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {alternative.confidence}% confidence
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)]">
                More owned fragrances are needed to generate alternatives.
              </p>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-5">
          <Eyebrow>Engine status</Eyebrow>

          <div className="mt-6 grid gap-3">
            {[
              "Recommendation Engine",
              "Rotation Intelligence",
              "Collection Intelligence",
              "Collection Health",
              "Knowledge Graph",
            ].map((engine) => (
              <div
                key={engine}
                className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0"
              >
                <span className="text-sm text-[var(--muted)]">{engine}</span>
                <span className="flex items-center gap-2 text-xs font-semibold text-[var(--success)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                  ACTIVE
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <StatusRow
              label="Neural confidence"
              value={`${intelligence.confidence}%`}
            />
            <StatusRow
              label="Connected sources"
              value={`${intelligence.activeSources.length}`}
            />
          </div>
        </Card>

        <Card className="xl:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Eyebrow>Collection dimensions</Eyebrow>
            <p className="text-xs text-[var(--muted)]">
              Neural confidence {intelligence.confidence}%
            </p>
          </div>

          <div className="mt-7">
            <HealthDimensions analysis={analysis} />
          </div>
        </Card>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  suffix = "/100",
}: {
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
      <p className="text-[.62rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-3xl">
        {value}
        {suffix && (
          <span className="ml-1 text-xs text-[var(--muted)]">{suffix}</span>
        )}
      </p>
    </div>
  );
}

function MetricInline({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[.63rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-1 text-3xl">{value}</p>
    </div>
  );
}

function StatusRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <strong className="text-sm">{value}</strong>
    </div>
  );
}
