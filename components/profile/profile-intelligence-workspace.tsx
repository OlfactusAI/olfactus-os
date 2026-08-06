"use client";

import {
  Award,
  BarChart3,
  Check,
  Dna,
  Fingerprint,
  SlidersHorizontal,
  Sparkles,
  Target,
} from "lucide-react";

import { useProfilePreferences } from "@/components/profile/use-profile-preferences";
import type {
  FragranceRole,
  Season,
} from "@/lib/domain/fragrance";
import {
  analyzeProfileIntelligence,
  type ProfilePreferences,
} from "@/lib/intelligence/profile-intelligence-engine";
import type { CollectionHealthAnalysis } from "@/lib/domain/analysis";
import type { FragranceRecord } from "@/lib/domain/fragrance";

export function ProfileIntelligenceWorkspace({
  owned,
  analysis,
  completedCoachActions,
}: {
  owned: Array<{
    fragrance: FragranceRecord;
    wearCount: number;
    favorite: boolean;
    daysSinceLastWear: number;
  }>;
  analysis: CollectionHealthAnalysis;
  completedCoachActions: number;
}) {
  const {
    preferences,
    updatePreference,
    hydrated,
  } = useProfilePreferences();

  const profile = analyzeProfileIntelligence({
    owned,
    analysis,
    preferences,
    completedCoachActions,
  });

  return (
    <section className="profile-intelligence-workspace mt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
            Profile Intelligence
          </p>
          <h2 className="display-serif mt-3 text-5xl">
            The collector behind the collection.
          </h2>
        </div>
        <span className="profile-model-chip">
          {profile.modelVersion}
        </span>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.12fr_.88fr]">
        <article className="profile-identity-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Fingerprint
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
              Collector identity
            </p>
          </div>

          <p className="display-serif mt-7 text-5xl text-[var(--gold-bright)]">
            {profile.archetypeLabel}
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">
            {profile.identityStatement}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <ProfileMetric
              label="Alignment"
              value={profile.preferenceAlignment}
            />
            <ProfileMetric
              label="Discipline"
              value={
                profile.purchasePersonality
                  .disciplineScore
              }
            />
            <ProfileMetric
              label="Exploration"
              value={
                profile.purchasePersonality
                  .explorationScore
              }
            />
          </div>
        </article>

        <article className="profile-personality-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Sparkles
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
              Purchase personality
            </p>
          </div>

          <p className="display-serif mt-7 text-4xl">
            {profile.purchasePersonality.primary}
          </p>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            {profile.purchasePersonality.explanation}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.purchasePersonality.traits.map(
              (trait) => (
                <span
                  key={trait}
                  className="profile-trait-chip"
                >
                  {trait}
                </span>
              ),
            )}
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_.92fr]">
        <article className="profile-data-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
                Taste genome
              </p>
              <h3 className="display-serif mt-3 text-4xl">
                Demonstrated preference DNA.
              </h3>
            </div>
            <Dna
              size={42}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-8 space-y-5">
            {profile.tasteGenome.map((item) => (
              <div key={item.dimension}>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold capitalize">
                    {item.dimension}
                  </p>
                  <p className="display-serif text-2xl text-[var(--gold-bright)]">
                    {item.value}
                  </p>
                </div>
                <div className="profile-progress mt-3">
                  <span
                    style={{
                      width: `${item.value}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="profile-data-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
                Wear analytics
              </p>
              <h3 className="display-serif mt-3 text-4xl">
                How the collection is actually used.
              </h3>
            </div>
            <BarChart3
              size={42}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3">
            <ProfileMetric
              label="Total Wears"
              value={
                profile.wearAnalytics.totalWears
              }
            />
            <ProfileMetric
              label="Utilization"
              value={
                profile.wearAnalytics
                  .utilizationRate
              }
            />
            <ProfileMetric
              label="Avg. Wears"
              value={
                profile.wearAnalytics
                  .averageWearsPerBottle
              }
            />
            <ProfileMetric
              label="Consistency"
              value={
                profile.wearAnalytics
                  .rotationConsistency
              }
            />
          </div>

          <div className="mt-7 border-t border-[var(--border)] pt-6">
            <p className="text-[.58rem] font-bold uppercase tracking-[.15em] text-[var(--gold)]">
              Most worn
            </p>
            <div className="mt-3 divide-y divide-[var(--border)]">
              {profile.wearAnalytics.mostWorn.map(
                (item) => (
                  <div
                    key={item.fragranceId}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <p className="text-sm font-semibold">
                      {item.fragranceName}
                    </p>
                    <p className="text-sm text-[var(--gold-bright)]">
                      {item.wears}
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </article>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[.92fr_1.08fr]">
        <article className="profile-data-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Award
              size={18}
              className="text-[var(--gold-bright)]"
            />
            <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
              Progress milestones
            </p>
          </div>

          <div className="mt-7 divide-y divide-[var(--border)]">
            {profile.milestones.map(
              (milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between gap-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`profile-milestone-icon ${
                        milestone.completed
                          ? "is-complete"
                          : ""
                      }`}
                    >
                      <Check size={12} />
                    </span>
                    <p className="text-sm font-semibold">
                      {milestone.label}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {milestone.value}
                  </p>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="profile-preferences-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
                Engine preferences
              </p>
              <h3 className="display-serif mt-3 text-4xl">
                Personalize every recommendation.
              </h3>
            </div>
            <SlidersHorizontal
              size={42}
              strokeWidth={1}
              className="text-[var(--gold)] opacity-70"
            />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <SelectPreference
              label="Preferred Season"
              value={preferences.preferredSeason}
              options={[
                "spring",
                "summer",
                "fall",
                "winter",
              ]}
              onChange={(value) =>
                updatePreference(
                  "preferredSeason",
                  value as Season,
                )
              }
            />
            <SelectPreference
              label="Preferred Role"
              value={preferences.preferredRole}
              options={[
                "office",
                "casual",
                "date",
                "formal",
                "summer",
                "winter",
                "creative",
                "signature",
                "travel",
              ]}
              onChange={(value) =>
                updatePreference(
                  "preferredRole",
                  value as FragranceRole,
                )
              }
            />
            <NumberPreference
              label="Minimum Longevity"
              value={preferences.minimumLongevity}
              suffix="/100"
              onChange={(value) =>
                updatePreference(
                  "minimumLongevity",
                  value,
                )
              }
            />
            <NumberPreference
              label="Risk Tolerance"
              value={preferences.riskTolerance}
              suffix="/100"
              onChange={(value) =>
                updatePreference(
                  "riskTolerance",
                  value,
                )
              }
            />
            <NumberPreference
              label="Budget Ceiling"
              value={preferences.budgetCeiling}
              prefix="$"
              onChange={(value) =>
                updatePreference(
                  "budgetCeiling",
                  value,
                )
              }
            />
            <NumberPreference
              label="Adventurousness"
              value={preferences.adventurousness}
              suffix="/100"
              onChange={(value) =>
                updatePreference(
                  "adventurousness",
                  value,
                )
              }
            />
          </div>

          {!hydrated ? (
            <p className="mt-5 text-xs text-[var(--muted)]">
              Loading saved preferences…
            </p>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function ProfileMetric({
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

function SelectPreference({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="profile-preference-control">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {capitalize(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberPreference({
  label,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label className="profile-preference-control">
      <span>{label}</span>
      <div>
        {prefix ? <small>{prefix}</small> : null}
        <input
          type="number"
          min={0}
          max={label === "Budget Ceiling" ? 2000 : 100}
          value={value}
          onChange={(event) =>
            onChange(Number(event.target.value))
          }
        />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
