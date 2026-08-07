"use client";

import Link from "next/link";
import {
  LiveMissionControl,
} from "@/components/intelligence/live-mission-control";
import {
  PredictiveAhead,
} from "@/components/intelligence/predictive-ahead";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CloudSun,
  Command,
  Droplets,
  Gauge,
  Orbit,
  RotateCcw,
  Sparkles,
  Waves,
} from "lucide-react";

import { HealthDimensions } from "@/components/features/health-dimensions";
import { TodayMarketWidget } from "@/components/market/today-market-widget";
import { useCollection } from "@/components/providers/collection-provider";
import { Button } from "@/components/ui/button";
import { runUnifiedWeatherAwareNeuralCore } from "@/lib/intelligence/unified-weather-aware-neural-core";
import { useWeatherIntelligence } from "@/components/weather/use-weather-intelligence";
import { WeatherIntelligencePanel } from "@/components/weather/weather-intelligence-panel";
import { CollectorAssistantPanel } from "@/components/intelligence/collector-assistant-panel";
import { buildCollectorAssistantInsights } from "@/lib/intelligence/collector-assistant-engine";
import { useCollectorIntelligence } from "@/components/providers/collector-intelligence-provider";

export default function TodayPage() {
  const {
    logWear,
    hydrated:
      collectionHydrated,
  } = useCollection();
  const {
    api,
    state:
      collectorState,
    hydrated:
      intelligenceHydrated,
  } =
    useCollectorIntelligence();
  
const hydrated =
  collectionHydrated &&
  intelligenceHydrated;
const catalog =
    api.getCatalogContext();
  const analysis =
    api.getCollectionHealthContext();
  const assistantInsights =
    useMemo(
      () =>
        buildCollectorAssistantInsights({
          collection:
            collectorState.collection,
          catalog,
          analysis,
        }),
      [
        collectorState.collection,
        catalog,
        analysis,
      ],
    );
  const weatherIntelligence =
    useWeatherIntelligence();
  const intelligence =
    runUnifiedWeatherAwareNeuralCore({
      api,
      hydrated:
        collectionHydrated &&
        intelligenceHydrated,
      weather:
        weatherIntelligence.weather,
    });

  const recommendation = intelligence.primaryRecommendation;
  const alternatives = intelligence.alternativeRecommendations;
  const insight = intelligence.collectionIntelligence.priorityInsight;
  const rotation = intelligence.rotationIntelligence;
  const signals =
    recommendation?.signals
      .filter((signal) => signal.id !== "data-quality")
      .slice(0, 5) ?? [];

  const [confirmedFragranceId, setConfirmedFragranceId] = useState<string | null>(
    null,
  );
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  const confirmationKey = recommendation
    ? `olfactus.daily-wear.${new Date().toISOString().slice(0, 10)}.${recommendation.fragranceId}`
    : null;

  useEffect(() => {
    if (!confirmationKey) {
      setConfirmedFragranceId(null);
      setConfirmedAt(null);
      return;
    }

    const saved = window.localStorage.getItem(confirmationKey);

    if (saved) {
      setConfirmedFragranceId(recommendation?.fragranceId ?? null);
      setConfirmedAt(saved);
    } else {
      setConfirmedFragranceId(null);
      setConfirmedAt(null);
    }
  }, [confirmationKey, recommendation?.fragranceId]);

  const wearConfirmed =
    Boolean(recommendation) &&
    confirmedFragranceId === recommendation?.fragranceId;

  function confirmWear() {
    if (!recommendation || wearConfirmed || !confirmationKey) return;

    const timestamp = new Date().toISOString();
    logWear(recommendation.fragranceId);
    window.localStorage.setItem(confirmationKey, timestamp);
    setConfirmedFragranceId(recommendation.fragranceId);
    setConfirmedAt(timestamp);
  }

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 18
        ? "Good afternoon"
        : "Good evening";

  const analystBriefing = useMemo(() => {
    const strongestSignal = [...signals].sort((a, b) => b.score - a.score)[0];
    const weakestSignal = [...signals].sort((a, b) => a.score - b.score)[0];
    const recommendationName =
      recommendation?.fragranceName ?? "your highest-value fragrance";

    const weatherSentence =
      intelligence.context.humidity >= 65
        ? `Humidity is elevated at ${intelligence.context.humidity}%, favoring fresher structures with cleaner lift.`
        : `Conditions are relatively dry, allowing richer structures to remain controlled.`;

    const rotationSentence =
      rotation.healthScore >= 85
        ? "Your rotation is healthy, so today’s choice can prioritize contextual fit."
        : "Rotation imbalance is influencing today’s decision and increases the value of a less-used bottle.";

    const strengthSentence = strongestSignal
      ? `${strongestSignal.label} is the strongest decision signal at ${strongestSignal.score}%.`
      : "The available intelligence signals remain balanced.";

    const growthSentence =
      insight?.action ??
      (weakestSignal
        ? `${weakestSignal.label} is the main opportunity for future collection growth.`
        : "Continue logging wears to improve long-term precision.");

    return `${weatherSentence} ${rotationSentence} ${recommendationName} currently provides the best total outcome. ${strengthSentence} ${growthSentence} Decision context is unified through ${intelligence.recommendationModel}.`;
  }, [
    insight?.action,
    intelligence.context.humidity,
    recommendation?.fragranceName,
    rotation.healthScore,
    signals,
  ]);

  const bottleIdentity = getBottleIdentity(
    recommendation?.fragranceId,
    recommendation?.fragranceName,
  );

  const pulseMetrics = [
    {
      label: "Collection Health",
      value: intelligence.collectionHealth.score,
      note: intelligence.collectionHealth.status,
    },
    {
      label: "DNA Diversity",
      value: analysis.dimensions.diversity,
      note: getMetricStatus(analysis.dimensions.diversity),
    },
    {
      label: "Season Coverage",
      value: analysis.dimensions.seasonalBalance,
      note: getMetricStatus(analysis.dimensions.seasonalBalance),
    },
    {
      label: "Rotation",
      value: rotation.healthScore,
      note: rotation.status,
    },
  ];

  return (
    <div className="command-page command-evolution pb-12">
      <WeatherIntelligencePanel
        weather={weatherIntelligence.weather}
        status={weatherIntelligence.status}
        error={weatherIntelligence.error}
        preferences={weatherIntelligence.preferences}
        onRefresh={weatherIntelligence.refresh}
        onUpdatePreferences={weatherIntelligence.updatePreferences}
      />
      <CollectorAssistantPanel insights={assistantInsights} />
      <section className="evolution-hero mt-8 relative min-h-[820px] overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)]">
        <div className="command-grid pointer-events-none absolute inset-0" />
        <div className="evolution-ambient pointer-events-none absolute inset-0" />
        <div className="evolution-data-stream pointer-events-none absolute inset-y-0 left-[54%] hidden w-px xl:block" />

        <div className="relative flex min-h-[820px] flex-col p-6 sm:p-10 xl:p-14">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="command-mark grid h-11 w-11 place-items-center rounded-full">
                <Command size={18} />
              </span>
              <div>
                <p className="text-[.62rem] font-bold uppercase tracking-[.24em] text-[var(--gold-bright)]">
                  OLFACTUS Neural Command
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Live recommendation synthesis
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="command-status">
                <span className="h-2 w-2 rounded-full bg-[var(--success)] shadow-[0_0_12px_rgba(85,173,129,.72)]" />
                Neural Core Online
              </span>
              <span className="command-status">
                NC {intelligence.engineVersions.neuralCore}
              </span>
            </div>
          </div>

          <div className="grid flex-1 items-center gap-12 py-10 xl:grid-cols-[.92fr_1.08fr] xl:py-12">
            <div className="relative z-10">
              <p className="text-sm text-[var(--muted)]">
                {greeting}, Steve.
              </p>

              <h1 className="display-serif mt-4 max-w-3xl text-[clamp(3.4rem,6.2vw,6.8rem)] leading-[.9] tracking-[-.055em]">
                Presented by
                <span className="block text-[var(--gold-bright)]">
                  neural intelligence.
                </span>
              </h1>

              <div className="mt-11">
                <p className="text-[.65rem] font-bold uppercase tracking-[.24em] text-[var(--muted)]">
                  Today&apos;s recommendation
                </p>

                <p className="mt-5 text-xs font-bold uppercase tracking-[.24em] text-[var(--gold)]">
                  {bottleIdentity.brand}
                </p>

                <h2 className="display-serif mt-2 max-w-3xl text-[clamp(2.5rem,4.6vw,5.2rem)] leading-[.94]">
                  {bottleIdentity.name}
                </h2>

                <p className="mt-6 max-w-xl text-base leading-8 text-[var(--muted)]">
                  {recommendation?.explanation ??
                    "Add your first fragrance to unlock personalized daily intelligence."}
                </p>
              </div>

              {recommendation ? (
                <div className="mt-9 flex flex-wrap gap-3">
                  <Button
                    variant={wearConfirmed ? "secondary" : "primary"}
                    onClick={confirmWear}
                    disabled={wearConfirmed}
                    className={wearConfirmed ? "wear-confirmed-button" : ""}
                  >
                    {wearConfirmed ? (
                      <>
                        <Check size={16} />
                        Wear confirmed
                      </>
                    ) : (
                      "Confirm today’s wear"
                    )}
                  </Button>

                  <Link
                    href={{ pathname: "/collection" }}
                    className="focus-ring inline-flex min-h-12 items-center gap-2 rounded-2xl border border-[var(--border)] bg-white/[.035] px-5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[rgba(232,200,127,.34)]"
                  >
                    Open collection
                    <ArrowRight size={15} />
                  </Link>
                </div>
              ) : null}

              {wearConfirmed && confirmedAt ? (
                <div className="wear-confirmation mt-5 flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[rgba(85,173,129,.12)] text-[var(--success)]">
                    <Check size={15} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--success)]">
                      Added to today&apos;s rotation
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Logged at{" "}
                      {new Date(confirmedAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative min-h-[500px] xl:min-h-[620px]">
              <div className="bottle-stage absolute inset-0 grid place-items-center">
                <div className="orbit-system absolute h-[430px] w-[430px] sm:h-[530px] sm:w-[530px]">
                  <span className="orbit-ring orbit-ring-one" />
                  <span className="orbit-ring orbit-ring-two" />
                  <span className="orbit-ring orbit-ring-three" />
                  <span className="orbit-node orbit-node-one" />
                  <span className="orbit-node orbit-node-two" />
                  <span className="orbit-node orbit-node-three" />
                  <span className="orbit-pulse" />
                </div>

                <div className="neural-line neural-line-left" />
                <div className="neural-line neural-line-right" />

                <div className="museum-object relative z-10">
                  <div className="museum-spotlight pointer-events-none absolute" />
                  <div className={`fragrance-bottle ${bottleIdentity.variant}`}>
                    <div className="fragrance-cap" />
                    <div className="fragrance-neck" />
                    <div className="fragrance-glass">
                      <div className="fragrance-reflection" />
                      <div className="fragrance-liquid" />
                      <div className="fragrance-label">
                        <span>{bottleIdentity.brand}</span>
                        <strong>{bottleIdentity.shortName}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="museum-pedestal">
                    <div className="pedestal-top" />
                    <div className="pedestal-face">
                      <span>OLFACTUS</span>
                      <small>NEURAL SELECTION</small>
                    </div>
                  </div>
                  <div className="pedestal-reflection" />
                </div>

                <div className="confidence-core absolute bottom-2 right-0 sm:right-4">
                  <div className="confidence-core-ring">
                    <div>
                      <p className="display-serif text-5xl leading-none text-[var(--gold-bright)]">
                        {intelligence.confidence}
                      </p>
                      <p className="mt-1 text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--muted)]">
                        Confidence
                      </p>
                    </div>
                  </div>
                </div>

                <div className="data-chip data-chip-weather">
                  <CloudSun size={14} />
                  {intelligence.context.temperatureF}°F
                </div>
                <div className="data-chip data-chip-humidity">
                  <Droplets size={14} />
                  {intelligence.context.humidity}%
                </div>
                <div className="data-chip data-chip-role">
                  <Orbit size={14} />
                  {intelligence.context.desiredRole}
                </div>
              </div>
            </div>
          </div>

          <div className="diagnostic-strip grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-2 xl:grid-cols-5">
            {signals.map((signal, index) => (
              <div key={signal.id} className="diagnostic-item">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[.61rem] font-bold uppercase tracking-[.15em] text-[var(--muted)]">
                    {String(index + 1).padStart(2, "0")} · {signal.label}
                  </p>
                  <strong className="text-sm text-[var(--gold-bright)]">
                    {signal.score}%
                  </strong>
                </div>
                <div className="diagnostic-track mt-3">
                  <span style={{ width: `${signal.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!hydrated ? (
        <p className="mt-5 text-sm text-[var(--muted)]">
          Loading your saved collection…
        </p>
      ) : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.18fr_.82fr]">
        <article className="analyst-panel rounded-[32px] border border-[var(--border)] p-7 sm:p-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles size={17} className="text-[var(--gold-bright)]" />
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Neural analyst briefing
              </p>
            </div>
            <span className="command-status">Generated live</span>
          </div>

          <blockquote className="display-serif mt-7 max-w-4xl text-3xl leading-[1.25] text-[var(--foreground)] sm:text-4xl">
            “{analystBriefing}”
          </blockquote>

          <div className="mt-8 grid gap-4 border-t border-[var(--border)] pt-6 sm:grid-cols-3">
            <AnalystFact
              icon={<CloudSun size={16} />}
              label="Environment"
              value={`${intelligence.context.temperatureF}°F · ${intelligence.context.humidity}% humidity`}
            />
            <AnalystFact
              icon={<RotateCcw size={16} />}
              label="Rotation state"
              value={`${rotation.healthScore}/100 · ${rotation.status}`}
            />
            <AnalystFact
              icon={<Waves size={16} />}
              label="Priority"
              value={insight?.title ?? "Continue calibration"}
            />
          </div>
        </article>

        <article className="collection-pulse-evolved rounded-[32px] border border-[var(--border)] p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[.64rem] font-bold uppercase tracking-[.22em] text-[var(--gold)]">
                Collection pulse
              </p>
              <h3 className="display-serif mt-3 text-4xl">
                Live health profile.
              </h3>
            </div>
            <Gauge size={46} strokeWidth={1} className="text-[var(--gold)] opacity-70" />
          </div>

          <div className="mt-8 space-y-6">
            {pulseMetrics.map((metric) => (
              <PulseBar
                key={metric.label}
                label={metric.label}
                value={metric.value}
                note={metric.note}
              />
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <article className="data-column rounded-[28px] border border-[var(--border)] p-7">
          <p className="text-[.62rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
            Rotation opportunity
          </p>

          <div className="mt-7 flex items-end justify-between">
            <div>
              <p className="display-serif text-6xl text-[var(--gold-bright)]">
                {rotation.healthScore}
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Rotation health
              </p>
            </div>
            <RotateCcw size={46} strokeWidth={1} className="text-[var(--gold)] opacity-60" />
          </div>

          {intelligence.rotationAlert ? (
            <div className="mt-7 rounded-2xl border border-[rgba(213,154,69,.24)] bg-[rgba(213,154,69,.06)] p-4">
              <p className="text-[.61rem] font-bold uppercase tracking-[.15em] text-[var(--warning)]">
                Reintroduce
              </p>
              <p className="mt-2 font-semibold">
                {intelligence.rotationAlert.fragranceName}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Idle for {intelligence.rotationAlert.daysSinceLastWear} days
              </p>
            </div>
          ) : null}
        </article>

        <article className="data-column rounded-[28px] border border-[var(--border)] p-7">
          <p className="text-[.62rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
            Alternative decisions
          </p>

          <div className="mt-5 divide-y divide-[var(--border)]">
            {alternatives.slice(0, 3).map((alternative, index) => (
              <div
                key={alternative.fragranceId}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span className="display-serif text-2xl text-[var(--gold)]">
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">
                      {alternative.fragranceName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {alternative.confidence}% confidence
                    </p>
                  </div>
                </div>
                <strong className="text-sm">{alternative.score}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="data-column rounded-[28px] border border-[var(--border)] p-7">
          <p className="text-[.62rem] font-bold uppercase tracking-[.18em] text-[var(--gold)]">
            Neural systems
          </p>

          <div className="mt-5 divide-y divide-[var(--border)]">
            {[
              ["Recommendation", intelligence.engineVersions.recommendation],
              ["Collection", intelligence.engineVersions.collection],
              ["Rotation", intelligence.engineVersions.rotation],
              ["Neural Core", intelligence.engineVersions.neuralCore],
            ].map(([name, version]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-4 py-4"
              >
                <div>
                  <p className="text-sm text-[var(--muted)]">{name}</p>
                  <p className="mt-1 text-[.62rem] text-[var(--gold)]">
                    {version}
                  </p>
                </div>
                <span className="flex items-center gap-2 text-[.62rem] font-bold text-[var(--success)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" />
                  ACTIVE
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-[30px] border border-[var(--border)] bg-black/10 p-7 sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
              Collection dimensions
            </p>
            <h3 className="display-serif mt-3 text-4xl">
              Intelligence health map.
            </h3>
          </div>
          <p className="text-xs text-[var(--muted)]">
            {intelligence.collectionIntelligence.confidence}% data confidence
          </p>
        </div>

        <div className="mt-8">
          <HealthDimensions analysis={analysis} />
        </div>
      </section>



<PredictiveAhead />

      <LiveMissionControl />

    </div>
  );
}

function PulseBar({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs capitalize text-[var(--muted)]">{note}</p>
        </div>
        <p className="display-serif text-3xl text-[var(--gold-bright)]">
          {value}
        </p>
      </div>
      <div className="pulse-track mt-3">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function AnalystFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-[var(--gold)]">{icon}</span>
      <div>
        <p className="text-[.59rem] font-bold uppercase tracking-[.14em] text-[var(--muted)]">
          {label}
        </p>
        <p className="mt-2 text-sm leading-6">{value}</p>
      </div>
    
      
    </div>
  );
}

function getMetricStatus(value: number) {
  if (value >= 90) return "exceptional";
  if (value >= 80) return "strong";
  if (value >= 70) return "healthy";
  if (value >= 55) return "developing";
  return "priority";
}

function getBottleIdentity(
  fragranceId?: string,
  fragranceName?: string,
) {
  const fullName = fragranceName ?? "OLFACTUS Selection";
  const words = fullName.split(" ");
  const known: Record<
    string,
    { brand: string; name: string; shortName: string; variant: string }
  > = {
    imagination: {
      brand: "Louis Vuitton",
      name: "Imagination",
      shortName: "IMAGINATION",
      variant: "bottle-imagination",
    },
    ganymede: {
      brand: "Marc-Antoine Barrois",
      name: "Ganymede",
      shortName: "GANYMEDE",
      variant: "bottle-ganymede",
    },
    "grand-soir": {
      brand: "Maison Francis Kurkdjian",
      name: "Grand Soir",
      shortName: "GRAND SOIR",
      variant: "bottle-grand-soir",
    },
    "prada-lhomme": {
      brand: "Prada",
      name: "Prada L’Homme",
      shortName: "L’HOMME",
      variant: "bottle-prada",
    },
    terre: {
      brand: "Hermès",
      name: "Terre d’Hermès",
      shortName: "TERRE",
      variant: "bottle-terre",
    },
    naxos: {
      brand: "Xerjoff",
      name: "Naxos",
      shortName: "NAXOS",
      variant: "bottle-naxos",
    },
    "un-air": {
      brand: "L’Artisan Parfumeur",
      name: "Un Air de Bretagne",
      shortName: "UN AIR",
      variant: "bottle-un-air",
    },
    "bottled-absolu": {
      brand: "Hugo Boss",
      name: "Bottled Absolu",
      shortName: "ABSOLU",
      variant: "bottle-boss",
    },
  };

  if (fragranceId && known[fragranceId]) return known[fragranceId];

  return {
    brand: words.length > 1 ? words.slice(0, -1).join(" ") : "OLFACTUS",
    name: words.at(-1) ?? fullName,
    shortName: (words.at(-1) ?? "SELECTION").toUpperCase(),
    variant: "bottle-generic",
  };
}
