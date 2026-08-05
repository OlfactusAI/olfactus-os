"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, FlaskConical, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/features/page-header";
import { Card } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useCollection } from "@/components/providers/collection-provider";
import { demoProfile } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeBuyDecision } from "@/lib/intelligence/buy-decision";

const verdictMeta = {
  buy: { label: "Buy", icon: Check, tone: "var(--success)" },
  sample: { label: "Sample first", icon: FlaskConical, tone: "var(--warning)" },
  skip: { label: "Skip", icon: AlertTriangle, tone: "var(--danger)" },
} as const;

export default function DecisionsPage() {
  const { items, available, addFragrance } = useCollection();
  const [candidateId, setCandidateId] = useState(available[0]?.id ?? "");
  const [price, setPrice] = useState("225");

  const effectiveCandidateId = available.some((candidate) => candidate.id === candidateId) ? candidateId : available[0]?.id ?? "";
  const candidate = fragrances.find((fragrance) => fragrance.id === effectiveCandidateId);
  const decision = useMemo(() => {
    if (!effectiveCandidateId) return null;
    return analyzeBuyDecision({ candidateFragranceId: effectiveCandidateId, collection: items, profile: demoProfile, catalog: fragrances, price: Number(price) || undefined });
  }, [effectiveCandidateId, items, price]);

  if (!available.length) {
    return <><PageHeader eyebrow="Actionable intelligence" title="Decisions" description="Every calibration fragrance is already owned." /><Card><h2 className="display-serif text-3xl">No candidates available</h2><p className="mt-3 text-[var(--muted)]">Remove a fragrance from Collection or expand the intelligence catalog.</p></Card></>;
  }

  const meta = decision ? verdictMeta[decision.verdict] : verdictMeta.sample;
  const VerdictIcon = meta.icon;

  return (
    <>
      <PageHeader eyebrow="Purchase decision center" title="Should this enter your collection?" description="OLFACTUS evaluates contribution, climate, redundancy, quality, price risk, and projected Collection Health." />
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="xl:col-span-4">
          <Eyebrow>Candidate</Eyebrow>
          <label className="mt-5 block text-sm text-[var(--muted)]" htmlFor="candidate">Fragrance</label>
          <select id="candidate" value={effectiveCandidateId} onChange={(event) => setCandidateId(event.target.value)} className="focus-ring mt-2 min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4">
            {available.map((fragrance) => <option key={fragrance.id} value={fragrance.id}>{fragrance.brand} — {fragrance.name}</option>)}
          </select>
          <label className="mt-5 block text-sm text-[var(--muted)]" htmlFor="price">Expected price</label>
          <div className="relative mt-2"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">$</span><input id="price" inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value.replace(/[^0-9.]/g, ""))} className="focus-ring min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] pl-8 pr-4" /></div>
          {candidate && <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><p className="font-semibold">{candidate.name}</p><p className="mt-1 text-sm text-[var(--muted)]">{candidate.brand} · {candidate.concentration}</p><p className="mt-3 text-sm text-[var(--muted)]">{candidate.family} · {candidate.roles.join(" · ")}</p></div>}
        </Card>

        {decision && <Card className="relative overflow-hidden xl:col-span-8"><div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(200,168,102,.14),transparent_65%)]" /><div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between"><div><Eyebrow>OLFACTUS Decision</Eyebrow><div className="mt-5 flex items-center gap-3"><VerdictIcon className="h-7 w-7" style={{ color: meta.tone }} /><h2 className="display-serif text-5xl" style={{ color: meta.tone }}>{meta.label}</h2></div><p className="mt-5 max-w-xl text-lg leading-8 text-[var(--muted)]">{decision.summary}</p><p className="mt-5 text-sm text-[var(--muted)]">Confidence <strong className="text-[var(--foreground)]">{decision.confidence}%</strong> · Model {decision.modelVersion}</p></div><div className="grid min-w-[220px] grid-cols-2 gap-3"><div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><Eyebrow>Fit score</Eyebrow><p className="display-serif mt-3 text-4xl text-[var(--gold)]">{decision.score}</p></div><div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><Eyebrow>Risk</Eyebrow><p className="display-serif mt-3 text-4xl">{decision.risk}</p></div></div></div>
          <div className="relative mt-8 flex flex-wrap gap-3">{decision.verdict === "buy" && <button onClick={() => addFragrance(decision.candidateFragranceId)} className="focus-ring inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--gold)] px-4 text-sm font-semibold text-[#17130c]">Add to collection</button>}<span className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] px-4 text-sm text-[var(--muted)]"><ShieldCheck className="mr-2 h-4 w-4" /> Explainable decision</span></div></Card>}

        {decision && <Card className="xl:col-span-7"><Eyebrow>Evidence</Eyebrow><div className="mt-5 grid gap-3">{decision.evidence.map((item) => <div key={item.key} className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><div className="flex items-center justify-between gap-4"><strong>{item.label}</strong><span className={item.direction === "positive" ? "text-[var(--success)]" : item.direction === "negative" ? "text-[var(--danger)]" : "text-[var(--gold)]"}>{item.value}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30"><div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${item.value}%` }} /></div><p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.interpretation}</p></div>)}</div></Card>}

        {decision && <Card className="xl:col-span-5"><Eyebrow>Projected impact</Eyebrow><div className="mt-6 flex items-end gap-4"><div><p className="text-sm text-[var(--muted)]">Current</p><p className="display-serif mt-2 text-4xl">{decision.projectedImpact.currentHealth}</p></div><span className="pb-2 text-2xl text-[var(--muted)]">→</span><div><p className="text-sm text-[var(--muted)]">If added</p><p className="display-serif mt-2 text-5xl text-[var(--success)]">{decision.projectedImpact.projectedHealth}</p></div></div><p className="mt-5 text-sm"><span className="text-[var(--muted)]">Health change </span><strong className={decision.projectedImpact.healthDelta > 0 ? "text-[var(--success)]" : "text-[var(--muted)]"}>{decision.projectedImpact.healthDelta > 0 ? "+" : ""}{decision.projectedImpact.healthDelta}</strong></p>{decision.projectedImpact.newRoles.length > 0 && <p className="mt-3 text-sm text-[var(--muted)]">New coverage: <span className="text-[var(--foreground)]">{decision.projectedImpact.newRoles.join(", ")}</span></p>}{decision.closestOverlap && <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"><Eyebrow>Closest overlap</Eyebrow><p className="mt-3 font-semibold">{decision.closestOverlap.fragranceName}</p><p className="mt-1 text-sm text-[var(--muted)]">{decision.closestOverlap.similarity}% functional similarity</p></div>}</Card>}
      </section>
    </>
  );
}
