"use client";

import Link from "next/link";

import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  Dna,
  Fingerprint,
  Orbit,
  Radar,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { FragranceAsset } from "@/components/assets/fragrance-asset";
import { useProfilePreferences } from "@/components/profile/use-profile-preferences";
import { useCollection } from "@/components/providers/collection-provider";
import { NeuralConfidenceCore } from "@/components/intelligence/neural-confidence-core";
import { analyzeFragranceGenome } from "@/lib/intelligence/fragrance-genome-engine";

export default function GenomePage() {
  const {
    owned,
    available,
    analysis,
    hydrated,
  } = useCollection();
  const { preferences } = useProfilePreferences();

  const genome = useMemo(
    () =>
      analyzeFragranceGenome({
        owned: owned.map(
          ({ item, fragrance }) => ({
            fragrance,
            wearCount: item.wearCount,
            favorite: item.favorite ?? false,
          }),
        ),
        candidates: available,
        preferences,
      }),
    [available, owned, preferences],
  );

  return (
    <div className="genome-page pb-12">
      <section className="genome-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="genome-grid pointer-events-none absolute inset-0" />
        <div className="genome-aura pointer-events-none absolute -right-52 -top-48 h-[780px] w-[780px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="genome-command-mark">
              <Dna size={18} />
            </span>
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                OLFACTUS Fragrance Genome
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Collection identity synthesis · {genome.modelVersion}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/annual-review"
              className="genome-status-chip"
            >
              Taste History
            </Link>
            <span className="genome-status-chip">
              Genome synchronized
            </span>
          </div>
        </div>

        <div className="relative mt-10 grid gap-12 xl:grid-cols-[1.08fr_.92fr] xl:items-center">
          <div>
            <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
              Signature Core
            </p>
            <h1 className="display-serif mt-5 max-w-5xl text-[clamp(3.8rem,7.2vw,7.6rem)] leading-[.88] tracking-[-.055em]">
              The DNA you own.
              <span className="block text-[var(--gold-bright)]">
                The identity you wear.
              </span>
            </h1>

            <div className="mt-9 flex flex-wrap gap-3">
              {genome.signatureCore.map(
                (dimension, index) => (
                  <span
                    key={dimension}
                    className="genome-core-chip"
                  >
                    {String(index + 1).padStart(2, "0")}
                    <strong>{capitalize(dimension)}</strong>
                  </span>
                ),
              )}
            </div>

            <p className="mt-8 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              {genome.wornIdentity} Your collection coherence is{" "}
              {genome.collectionCoherence}/100, showing how closely ownership
              and real wear behavior align.
            </p>
          </div>

          <div className="genome-orbit-stage">
            <div className="genome-orbit-system">
              <span className="genome-orbit orbit-a" />
              <span className="genome-orbit orbit-b" />
              <span className="genome-orbit orbit-c" />
              {genome.signatureCore.map((dimension, index) => (
                <span
                  key={dimension}
                  className={`genome-label genome-label-${index + 1}`}
                >
                  {capitalize(dimension)}
                </span>
              ))}
            </div>
            <div className="relative z-10">
              <NeuralConfidenceCore
                value={genome.genomeConfidence}
                label="Genome confidence"
                size="large"
              />
            </div>
          </div>
        </div>

        <div className="relative mt-9 grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-4">
          <HeroMetric
            label="Genome Confidence"
            value={genome.genomeConfidence}
          />
          <HeroMetric
            label="Collection Coherence"
            value={genome.collectionCoherence}
          />
          <HeroMetric
            label="Owned Bottles"
            value={owned.length}
          />
          <HeroMetric
            label="Candidates Analyzed"
            value={available.length}
          />
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <article className="genome-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
                Owned DNA vs Worn DNA
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Ownership is not preference.
              </h2>
            </div>
            <Activity
              size={44}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-8 space-y-6">
            {genome.dimensions.map((item) => (
              <div key={item.dimension}>
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold capitalize">
                    {item.dimension}
                  </p>
                  <p className="text-xs text-[var(--muted)]">
                    Gap {item.gap >= 0 ? "+" : ""}
                    {item.gap}
                  </p>
                </div>

                <div className="mt-3 grid gap-2">
                  <GenomeBar
                    label="Owned"
                    value={item.owned}
                  />
                  <GenomeBar
                    label="Worn"
                    value={item.worn}
                    emphasized
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-6">
          <article className="genome-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <Fingerprint
                size={18}
                className="text-[var(--gold-bright)]"
              />
              <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
                Hidden Preferences
              </p>
            </div>

            <div className="mt-7 divide-y divide-[var(--border)]">
              {genome.hiddenPreferences.map((item) => (
                <div
                  key={item.dimension}
                  className="py-5 first:pt-0"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="display-serif text-3xl capitalize">
                      {item.dimension}
                    </p>
                    <p className="display-serif text-3xl text-[var(--gold-bright)]">
                      {item.confidence}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="genome-panel genome-opportunity rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
            <div className="flex items-center gap-3">
              <Target
                size={18}
                className="text-[var(--gold-bright)]"
              />
              <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
                Underdeveloped DNA
              </p>
            </div>

            <div className="mt-7 space-y-4">
              {genome.underdevelopedDna.map((item) => (
                <div
                  key={item.dimension}
                  className="rounded-[22px] border border-[var(--border)] bg-black/10 p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="display-serif text-3xl capitalize">
                      {item.dimension}
                    </p>
                    <p className="text-sm text-[var(--gold-bright)]">
                      +{item.opportunity}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-8 genome-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[.63rem] font-bold uppercase tracking-[.21em] text-[var(--gold)]">
              Genome Match
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              Candidates closest to your real identity.
            </h2>
          </div>
          <Radar
            size={44}
            strokeWidth={1}
            className="text-[var(--gold)] opacity-70"
          />
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {genome.matches.map((match) => (
            <article
              key={match.fragranceId}
              className="genome-match-card rounded-[26px] border border-[var(--border)] p-5"
            >
              <div className="h-44 overflow-hidden rounded-[20px] border border-[var(--border)] bg-black/10">
                <FragranceAsset
                  fragranceId={match.fragranceId}
                  brand={match.brand}
                  name={match.fragranceName}
                  mode="card"
                  className="h-full"
                />
              </div>
              <p className="mt-5 text-[.57rem] font-bold uppercase tracking-[.15em] text-[var(--gold)]">
                {match.brand}
              </p>
              <h3 className="display-serif mt-2 text-3xl">
                {match.fragranceName}
              </h3>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniMetric
                  label="Genome Match"
                  value={match.match}
                />
                <MiniMetric
                  label="Expansion"
                  value={match.expansion}
                />
              </div>
              <p className="mt-4 text-xs capitalize text-[var(--muted)]">
                Shared core: {match.sharedCore.join(" · ")}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <IdentityCard
          label="Owned Identity"
          text={genome.ownedIdentity}
          icon={<Dna size={18} />}
        />
        <IdentityCard
          label="Worn Identity"
          text={genome.wornIdentity}
          icon={<Fingerprint size={18} />}
        />
        <IdentityCard
          label="Emerging Identity"
          text={genome.emergingIdentity}
          icon={<TrendingUp size={18} />}
        />
      </section>

      {!hydrated ? (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Loading collection wear history before finalizing the genome…
        </p>
      ) : null}
    </div>
  );
}

function GenomeBar({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div className="grid grid-cols-[52px_1fr_34px] items-center gap-3">
      <span className="text-[.52rem] font-bold uppercase tracking-[.11em] text-[var(--muted)]">
        {label}
      </span>
      <div className="genome-progress">
        <span
          className={emphasized ? "is-worn" : ""}
          style={{ width: `${value}%` }}
        />
      </div>
      <span
        className={`text-right text-sm ${
          emphasized
            ? "text-[var(--gold-bright)]"
            : "text-[var(--muted)]"
        }`}
      >
        {value}
      </span>
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
    <div className="genome-hero-metric">
      <p className="text-[.56rem] font-bold uppercase tracking-[.13em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-4xl text-[var(--gold-bright)]">
        {value}
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
    <div className="rounded-2xl border border-[var(--border)] bg-white/[.025] p-3">
      <p className="text-[.48rem] font-bold uppercase tracking-[.11em] text-[var(--muted)]">
        {label}
      </p>
      <p className="display-serif mt-2 text-2xl text-[var(--gold-bright)]">
        {value}
      </p>
    </div>
  );
}

function IdentityCard({
  label,
  text,
  icon,
}: {
  label: string;
  text: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="genome-panel rounded-[28px] border border-[var(--border)] p-7">
      <div className="flex items-center gap-3 text-[var(--gold)]">
        {icon}
        <p className="text-[.6rem] font-bold uppercase tracking-[.17em]">
          {label}
        </p>
      </div>
      <p className="display-serif mt-5 text-3xl leading-[1.25]">
        {text}
      </p>
    </article>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
