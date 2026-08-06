"use client";

import Link from "next/link";
import {
  ArrowRight,
  Landmark,
} from "lucide-react";
import { useMemo } from "react";

import { useCollection } from "@/components/providers/collection-provider";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionValueDashboard } from "@/lib/intelligence/collection-value-dashboard";

export function TodayMarketWidget() {
  const { items } = useCollection();

  const portfolio = useMemo(
    () =>
      analyzeCollectionValueDashboard({
        collection: items,
        catalog: fragrances,
      }),
    [items],
  );

  return (
    <section className="today-market-widget">
      <div className="flex items-center gap-3">
        <span className="today-market-icon">
          <Landmark size={17} />
        </span>
        <div>
          <p className="text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
            Market Intelligence
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Collection portfolio
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div>
          <p className="text-[.48rem] uppercase tracking-[.1em] text-[var(--muted)]">
            Value
          </p>
          <p className="display-serif mt-2 text-2xl text-[var(--gold-bright)]">
            ${portfolio.estimatedMarketValue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-[.48rem] uppercase tracking-[.1em] text-[var(--muted)]">
            Health
          </p>
          <p className="display-serif mt-2 text-2xl text-[var(--gold-bright)]">
            {portfolio.marketHealth}
          </p>
        </div>
        <div>
          <p className="text-[.48rem] uppercase tracking-[.1em] text-[var(--muted)]">
            Grade
          </p>
          <p className="display-serif mt-2 text-2xl text-[var(--gold-bright)]">
            {portfolio.portfolioGrade}
          </p>
        </div>
      </div>

      <Link
        href="/market"
        className="today-market-link"
      >
        Open Market Dashboard
        <ArrowRight size={14} />
      </Link>
    </section>
  );
}
