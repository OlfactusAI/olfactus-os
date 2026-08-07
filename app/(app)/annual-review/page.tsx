"use client";

import {
  ArrowDown,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  Crown,
  Dna,
  History,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useCollection } from "@/components/providers/collection-provider";
import { useEvolutionLedger } from "@/components/evolution/use-evolution-ledger";
import { fragrances } from "@/lib/data/fragrances";
import { generateAnnualReview } from "@/lib/intelligence/evolution-annual-review-engine";
import { appendTimelineEvent } from "@/lib/timeline/event-ledger";

export default function AnnualReviewPage() {
  const { items } = useCollection();
  const { ledger } =
    useEvolutionLedger();

  const availableYears = useMemo(
    () => {
      const years = new Set(
        ledger.snapshots.map(
          (snapshot) =>
            new Date(
              snapshot.createdAt,
            ).getFullYear(),
        ),
      );

      if (!years.size) {
        years.add(
          new Date().getFullYear(),
        );
      }

      return [...years].sort(
        (a, b) => b - a,
      );
    },
    [ledger.snapshots],
  );

  const [year, setYear] =
    useState(availableYears[0]);

  const review = useMemo(
    () =>
      generateAnnualReview({
        year,
        snapshots:
          ledger.snapshots,
        collection: items,
        catalog: fragrances,
      }),
    [items, ledger.snapshots, year],
  );

  useEffect(() => {
    if (
      !review.startSnapshot ||
      !review.endSnapshot
    ) {
      return;
    }

    appendTimelineEvent({
      id: `annual-review-${year}-${review.startSnapshot.id}-${review.endSnapshot.id}`,
      type: "annual_review_generated",
      title: `${year} Annual Review generated`,
      summary: `Collection Health changed by ${review.collectionHealthChange >= 0 ? "+" : ""}${review.collectionHealthChange}; Diversity changed by ${review.diversityChange >= 0 ? "+" : ""}${review.diversityChange}.`,
      metadata: {
        year,
        healthChange:
          review.collectionHealthChange,
        diversityChange:
          review.diversityChange,
        rotationChange:
          review.rotationChange,
      },
    });
  }, [review, year]);

  return (
    <div className="annual-review-page pb-12">
      <section className="annual-review-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="annual-review-grid pointer-events-none absolute inset-0" />
        <div className="annual-review-aura pointer-events-none absolute -right-48 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="annual-review-mark">
              <BookOpen size={18} />
            </span>
            <div>
              <p className="annual-review-kicker">
                OLFACTUS Annual Review
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Taste evolution and collection intelligence ·{" "}
                {review.modelVersion}
              </p>
            </div>
          </div>

          <label className="annual-review-year">
            <span>Review Year</span>
            <select
              value={year}
              onChange={(event) =>
                setYear(
                  Number(
                    event.target.value,
                  ),
                )
              }
            >
              {availableYears.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>

        <div className="relative mt-12 grid gap-10 xl:grid-cols-[1.15fr_.85fr] xl:items-end">
          <div>
            <p className="annual-review-kicker">
              Year in Review
            </p>
            <h1 className="display-serif mt-5 text-[clamp(5rem,10vw,10rem)] leading-[.8] tracking-[-.07em] text-[var(--gold-bright)]">
              {year}
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              A complete view of how your taste, collection
              structure, wear behavior, and market value
              changed across the year.
            </p>
          </div>

          <div className="annual-review-grade">
            <p className="annual-review-kicker">
              Collection Health Change
            </p>
            <p className="display-serif mt-4 text-7xl leading-none text-[var(--gold-bright)]">
              {signed(
                review.collectionHealthChange,
              )}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniMetric
                label="Diversity"
                value={signed(
                  review.diversityChange,
                )}
              />
              <MiniMetric
                label="Rotation"
                value={signed(
                  review.rotationChange,
                )}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {review.highlights.map(
          (highlight) => (
            <article
              key={highlight.label}
              className="annual-review-stat"
            >
              <p>{highlight.label}</p>
              <strong>
                {highlight.value}
              </strong>
              <span>
                {highlight.explanation}
              </span>
            </article>
          ),
        )}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <article className="annual-review-panel p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Dna
              size={18}
              className="text-[var(--gold)]"
            />
            <div>
              <p className="annual-review-kicker">
                Taste Evolution
              </p>
              <h2 className="display-serif mt-2 text-4xl">
                What became more like you.
              </h2>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <ShiftCard
              icon={<TrendingUp size={18} />}
              label="Strongest Rising DNA"
              value={
                review.strongestRisingDna
                  ? `${capitalize(
                      review
                        .strongestRisingDna
                        .dimension,
                    )} ${signed(
                      review
                        .strongestRisingDna
                        .change,
                    )}`
                  : "Stable"
              }
            />
            <ShiftCard
              icon={<TrendingDown size={18} />}
              label="Strongest Falling DNA"
              value={
                review.strongestFallingDna
                  ? `${capitalize(
                      review
                        .strongestFallingDna
                        .dimension,
                    )} ${signed(
                      review
                        .strongestFallingDna
                        .change,
                    )}`
                  : "Stable"
              }
            />
            <ShiftCard
              icon={<ChartNoAxesCombined size={18} />}
              label="Dominant Role"
              value={`${review.dominantRoleShift.before ?? "None"} → ${review.dominantRoleShift.after ?? "None"}`}
            />
            <ShiftCard
              icon={<Crown size={18} />}
              label="Dominant Family"
              value={`${review.dominantFamilyShift.before ?? "None"} → ${review.dominantFamilyShift.after ?? "None"}`}
            />
          </div>
        </article>

        <article className="annual-review-panel annual-review-briefing p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Sparkles
              size={18}
              className="text-[var(--gold)]"
            />
            <p className="annual-review-kicker">
              OLFACTUS Annual Analyst
            </p>
          </div>
          <blockquote className="display-serif mt-7 text-3xl leading-[1.4]">
            “{review.briefing}”
          </blockquote>
        </article>
      </section>

      <section className="mt-8 annual-review-panel p-7 sm:p-9">
        <div className="flex items-center gap-3">
          <History
            size={18}
            className="text-[var(--gold)]"
          />
          <div>
            <p className="annual-review-kicker">
              Before vs After
            </p>
            <h2 className="display-serif mt-2 text-4xl">
              The year at two moments.
            </h2>
          </div>
        </div>

        {review.startSnapshot &&
        review.endSnapshot ? (
          <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
            <SnapshotCard
              label="Beginning"
              snapshot={
                review.startSnapshot
              }
            />
            <ArrowRight
              size={30}
              className="mx-auto rotate-90 text-[var(--gold)] xl:rotate-0"
            />
            <SnapshotCard
              label="End"
              snapshot={
                review.endSnapshot
              }
            />
          </div>
        ) : (
          <p className="mt-7 text-sm leading-7 text-[var(--muted)]">
            Capture at least two evolution snapshots in this
            year to unlock the full before-and-after review.
          </p>
        )}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <WinnerCard
          icon={<Star size={19} />}
          label="Most Worn"
          name={
            review.mostWorn?.name ??
            "Still calibrating"
          }
          detail={
            review.mostWorn
              ? `${review.mostWorn.brand} · ${review.mostWorn.wears} wears`
              : "More wear history is needed."
          }
        />
        <WinnerCard
          icon={<Award size={19} />}
          label="Best Purchase"
          name={
            review.bestPurchase?.name ??
            "Still calibrating"
          }
          detail={
            review.bestPurchase
              ? `${review.bestPurchase.brand} · Strategic ${review.bestPurchase.score}`
              : "More purchase history is needed."
          }
        />
        <WinnerCard
          icon={<Crown size={19} />}
          label="Highest-Value Addition"
          name={
            review.highestValueAddition
              ?.name ??
            "Still calibrating"
          }
          detail={
            review.highestValueAddition
              ? `${review.highestValueAddition.brand} · $${review.highestValueAddition.marketValue}`
              : "More market history is needed."
          }
        />
      </section>

      <section className="mt-8 annual-review-panel p-7 sm:p-9">
        <div className="flex items-center gap-3">
          <BookOpen
            size={18}
            className="text-[var(--gold)]"
          />
          <div>
            <p className="annual-review-kicker">
              Evolution Chapters
            </p>
            <h2 className="display-serif mt-2 text-4xl">
              The eras that defined the year.
            </h2>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {review.chapters.map(
            (chapter, index) => (
              <article
                key={chapter.id}
                className="annual-review-chapter"
              >
                <p className="display-serif text-4xl text-[var(--gold)]">
                  {String(
                    index + 1,
                  ).padStart(2, "0")}
                </p>
                <p className="mt-5 text-xs uppercase tracking-[.14em] text-[var(--gold-bright)]">
                  {chapter.periodLabel}
                </p>
                <p className="display-serif mt-3 text-3xl">
                  {chapter.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                  {chapter.description}
                </p>
              </article>
            ),
          )}
        </div>
      </section>
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
    <div className="annual-review-mini">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function ShiftCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="annual-review-shift">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function WinnerCard({
  icon,
  label,
  name,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  detail: string;
}) {
  return (
    <article className="annual-review-winner">
      <span>{icon}</span>
      <p className="annual-review-kicker mt-5">
        {label}
      </p>
      <p className="display-serif mt-4 text-4xl">
        {name}
      </p>
      <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
        {detail}
      </p>
    </article>
  );
}

function SnapshotCard({
  label,
  snapshot,
}: {
  label: string;
  snapshot: NonNullable<
    ReturnType<
      typeof generateAnnualReview
    >["startSnapshot"]
  >;
}) {
  return (
    <article className="annual-review-snapshot">
      <p className="annual-review-kicker">
        {label}
      </p>
      <p className="display-serif mt-4 text-3xl">
        {new Date(
          snapshot.createdAt,
        ).toLocaleDateString()}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Metric
          label="Health"
          value={snapshot.collectionHealth}
        />
        <Metric
          label="Bottles"
          value={snapshot.collectionSize}
        />
        <Metric
          label="Diversity"
          value={snapshot.diversity}
        />
        <Metric
          label="Rotation"
          value={snapshot.rotation}
        />
      </div>
    </article>
  );
}

function Metric({
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

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
