"use client";

import {
  ArrowUpRight,
  Check,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { FragranceAsset } from "@/components/assets/fragrance-asset";
import { Button } from "@/components/ui/button";
import type { DiscoveryRecommendation } from "@/lib/intelligence/discovery-engine";
import { cn } from "@/lib/utils";

interface DiscoveryRecommendationCardProps {
  recommendation: DiscoveryRecommendation;
  onAdd: () => void;
  featured?: boolean;
}

export function DiscoveryRecommendationCard({
  recommendation,
  onAdd,
  featured = false,
}: DiscoveryRecommendationCardProps) {
  return (
    <article
      className={cn(
        "discovery-intelligence-card group rounded-[28px] border border-[var(--border)] p-5",
        featured && "is-featured",
      )}
    >
      <div className="relative h-48 overflow-hidden rounded-[22px] border border-[var(--border)] bg-black/10">
        <FragranceAsset
          fragranceId={recommendation.fragrance.id}
          brand={recommendation.fragrance.brand}
          name={recommendation.fragrance.name}
          mode="card"
          className="h-full w-full transition duration-500 group-hover:-translate-y-1"
          showStatus
        />

        <span className="discovery-tier-chip">
          {formatTier(recommendation.tier)}
        </span>
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-[.58rem] font-bold uppercase tracking-[.17em] text-[var(--gold)]">
            {recommendation.fragrance.brand}
          </p>
          <h3 className="display-serif mt-2 text-3xl leading-tight">
            {recommendation.fragrance.name}
          </h3>
        </div>

        <div className="text-right">
          <p className="display-serif text-4xl text-[var(--gold-bright)]">
            {recommendation.confidence}
          </p>
          <p className="mt-1 text-[.53rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]">
            Confidence
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {recommendation.summary}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <MiniMetric
          label="Health"
          value={`+${recommendation.projectedHealthGain}`}
        />
        <MiniMetric
          label="DNA Fit"
          value={`${recommendation.dnaMatch}%`}
        />
        <MiniMetric
          label="Risk"
          value={formatRisk(recommendation.blindBuyRisk)}
        />
      </div>

      <div className="mt-5 space-y-3 border-t border-[var(--border)] pt-5">
        {recommendation.reasons.slice(0, 3).map((reason) => (
          <div key={reason} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[rgba(85,173,129,.1)] text-[var(--success)]">
              <Check size={11} />
            </span>
            <p className="text-xs leading-5 text-[var(--muted)]">
              {reason}
            </p>
          </div>
        ))}
      </div>

      <Button
        variant="primary"
        className="mt-6 w-full"
        onClick={onAdd}
      >
        Add to collection
        <ArrowUpRight size={15} />
      </Button>
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
    <div className="rounded-2xl border border-[var(--border)] bg-white/[.025] p-3">
      <p className="text-[.5rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}

function formatTier(value: DiscoveryRecommendation["tier"]) {
  return {
    "highest-impact": "Highest impact",
    "safest-buy": "Safest buy",
    "signature-potential": "Signature potential",
    "most-original": "Most original",
    balanced: "Balanced addition",
  }[value];
}

function formatRisk(value: DiscoveryRecommendation["blindBuyRisk"]) {
  return {
    "very-low": "Very low",
    low: "Low",
    moderate: "Moderate",
    high: "High",
  }[value];
}
