"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HealthDimensions } from "@/components/features/health-dimensions";
import { PageHeader } from "@/components/features/page-header";
import { useCollection } from "@/components/providers/collection-provider";

export default function TodayPage() {
  const { analysis, owned, logWear, hydrated } = useCollection();
  const topAction = analysis.recommendations[0];
  const recommendation = owned
    .filter(({ item }) => item.daysSinceLastWear >= 7)
    .sort((a, b) => b.fragrance.seasons.summer - a.fragrance.seasons.summer || b.item.daysSinceLastWear - a.item.daysSinceLastWear)[0] ?? owned[0];

  return (
    <>
      <PageHeader eyebrow="Daily intelligence briefing" title="Good morning, Steve" description="The highest-value decisions from your live collection, summarized for today." />
      {!hydrated && <p className="mb-4 text-sm text-[var(--muted)]">Loading your saved collection…</p>}
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="relative min-h-[330px] overflow-hidden xl:col-span-8">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(230,168,74,.17),transparent_65%)]" />
          <Eyebrow>Today&apos;s recommendation</Eyebrow>
          <h2 className="display-serif relative mt-7 text-4xl sm:text-5xl">{recommendation ? `${recommendation.fragrance.brand} ${recommendation.fragrance.name}` : "Build your collection"}</h2>
          <p className="relative mt-4 max-w-xl leading-7 text-[var(--muted)]">{recommendation ? `Strong warm-weather suitability and ${recommendation.item.daysSinceLastWear} days since its last wear. The decision updates as your collection changes.` : "Add your first fragrance to unlock daily wear intelligence."}</p>
          <div className="relative mt-6 flex flex-wrap gap-3">
            {recommendation && <Button variant="primary" onClick={() => logWear(recommendation.fragrance.id)}>Wear today</Button>}
            <Link href="/collection" className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 hover:border-[rgba(200,168,102,.35)]">Open collection</Link>
          </div>
        </Card>
        <Card className="xl:col-span-4"><Eyebrow>Collection health</Eyebrow><p className="display-serif mt-5 text-7xl text-[var(--gold)]">{analysis.score}</p><h2 className="mt-2 text-xl font-semibold">{analysis.status}</h2><p className="mt-4 leading-7 text-[var(--muted)]">{analysis.summary}</p></Card>
        <Card className="xl:col-span-7"><Eyebrow>Collection diagnosis</Eyebrow><div className="mt-5 grid gap-3">{analysis.findings.slice(0,3).map((finding) => <div key={finding.title} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><div className="flex items-start justify-between gap-4"><strong>{finding.title}</strong><span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gold)]">{finding.severity}</span></div><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{finding.explanation}</p></div>)}</div></Card>
        <Card className="xl:col-span-5"><Eyebrow>Best next move</Eyebrow><h2 className="display-serif mt-5 text-3xl">{topAction?.title ?? "Add fragrances to begin"}</h2><p className="mt-4 leading-7 text-[var(--muted)]">{topAction?.reason ?? "OLFACTUS needs a collection before it can generate a strategic action."}</p>{topAction && <p className="mt-6 text-sm"><span className="text-[var(--muted)]">Projected health impact </span><strong className="text-[var(--success)]">+{topAction.projectedImpact}</strong></p>}</Card>
        <Card className="xl:col-span-12"><Eyebrow>Health dimensions</Eyebrow><div className="mt-6"><HealthDimensions analysis={analysis} /></div></Card>
      </section>
    </>
  );
}
