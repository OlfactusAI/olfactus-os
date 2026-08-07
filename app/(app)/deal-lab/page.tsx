"use client";

import {
  BarChart3,
  BookmarkPlus,
  CircleDollarSign,
  Clock3,
  Gauge,
  Landmark,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCollection } from "@/components/providers/collection-provider";
import { useDealHistory } from "@/components/market/use-deal-history";
import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";
import {
  analyzeDeal,
  type DealOffer,
} from "@/lib/intelligence/deal-analyzer-engine";
import {
  saveDealAnalysis,
} from "@/lib/market/deal-history";
import { appendTimelineEvent } from "@/lib/timeline/event-ledger";
import { getMarketCatalogEntry } from "@/lib/market/market-catalog";
import { LineageIntegrationCard } from "@/components/lineage/lineage-integration-card";
import { CalibratedScoreDetails } from "@/components/intelligence/calibrated-score-details";

export default function DealLabPage() {
  const { items, available } =
    useCollection();

  const {
    catalog,
    importedIds,
    readinessById,
    isHydrated: catalogHydrated,
  } = useActiveFragranceCatalog();
  const { history, clear } =
    useDealHistory();

  const initialCandidate =
    available[0]?.id ??
    catalog[0]?.id ??
    "";

  const initialMarket =
    getMarketCatalogEntry(
      initialCandidate,
    );

  const [candidateId, setCandidateId] =
    useState(initialCandidate);
  const [offers, setOffers] = useState<
    DealOffer[]
  >([
    {
      id: "offer-1",
      seller: "Current Offer",
      price:
        initialMarket.typicalMarketPrice,
      condition: "new",
    },
  ]);
  const [savedMessage, setSavedMessage] =
    useState("");

  useEffect(() => {
    const parameters =
      new URLSearchParams(
        window.location.search,
      );
    const fragranceId =
      parameters.get("fragrance");
    const price = Number(
      parameters.get("price"),
    );

    if (
      fragranceId &&
      catalog.some(
        (item) =>
          item.id === fragranceId,
      )
    ) {
      setCandidateId(fragranceId);
      const market =
        getMarketCatalogEntry(
          fragranceId,
        );
      setOffers([
        {
          id: "offer-1",
          seller: "Current Offer",
          price:
            Number.isFinite(price) &&
            price > 0
              ? price
              : market.typicalMarketPrice,
          condition: "new",
        },
      ]);
    }
  }, []);

  const effective =
    catalog.some(
      (item) =>
        item.id === candidateId,
    )
      ? candidateId
      : catalog[0].id;

  const candidateReadiness =
    readinessById.get(effective);

  const analysis = useMemo(
    () =>
      analyzeDeal({
        candidateId: effective,
        offers,
        collection: items,
        catalog,
      }),
    [catalog, effective, items, offers],
  );

  function updateOffer(
    id: string,
    patch: Partial<DealOffer>,
  ) {
    setOffers((current) =>
      current.map((offer) =>
        offer.id === id
          ? { ...offer, ...patch }
          : offer,
      ),
    );
  }

  function selectCandidate(id: string) {
    setCandidateId(id);
    const market =
      getMarketCatalogEntry(id);
    setOffers([
      {
        id: "offer-1",
        seller: "Current Offer",
        price:
          market.typicalMarketPrice,
        condition: "new",
      },
    ]);
    setSavedMessage("");
  }

  function saveCurrentAnalysis() {
    const saved =
      saveDealAnalysis(analysis);
    if (!saved) return;

    appendTimelineEvent({
      type: "deal_analyzed",
      title: "Deal analyzed",
      summary: `${analysis.candidate.name} received a ${analysis.purchaseScore}/100 Purchase Score and ${analysis.verdict} verdict at $${analysis.bestOffer.price}.`,
      fragranceId:
        analysis.candidate.id,
      fragranceName:
        analysis.candidate.name,
      metadata: {
        seller:
          analysis.bestOffer.seller,
        price:
          analysis.bestOffer.price,
        purchaseScore:
          analysis.purchaseScore,
        verdict: analysis.verdict,
        fairValue:
          analysis.fairValue,
      },
    });

    setSavedMessage(
      "Analysis saved to Market history and Timeline.",
    );
  }

  return (
    <div className="deal-page pb-12">
      <section className="deal-hero rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="deal-mark">
              <Landmark size={18} />
            </span>
            <div>
              <p className="deal-kicker">
                OLFACTUS Buy Window Analyzer
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Market + graph purchase intelligence ·{" "}
                {analysis.modelVersion}
              </p>
            </div>
          </div>
          <span className="deal-chip">
            Market Stable
          </span>
        </div>

        <div className="mt-10 grid gap-8 xl:grid-cols-[1.1fr_.9fr] xl:items-end">
          <div>
            <p className="deal-kicker">
              Purchase Candidate
            </p>
            <select
              value={effective}
              onChange={(event) =>
                selectCandidate(
                  event.target.value,
                )
              }
              className="deal-select mt-4"
            >
              {catalog.map(
                (fragrance) => (
                  <option
                    key={fragrance.id}
                    value={fragrance.id}
                  >
                    {fragrance.brand} —{" "}
                    {fragrance.name}
                  </option>
                ),
              )}
            </select>

            <h1 className="display-serif mt-7 text-[clamp(3.5rem,7vw,7rem)] leading-[.9]">
              {analysis.candidate.name}
            </h1>
            <p className="mt-4 text-lg text-[var(--muted)]">
              {analysis.candidate.brand} ·{" "}
              {analysis.candidate.family}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="deal-save"
                onClick={saveCurrentAnalysis}
              >
                <BookmarkPlus size={15} />
                Save Analysis
              </button>
              {savedMessage ? (
                <p className="text-sm text-[var(--success)]">
                  {savedMessage}
                </p>
              ) : null}
            </div>
          </div>

          <div className="deal-score">
            <p className="deal-kicker">
              Purchase Score
            </p>
            <p className="display-serif mt-3 text-[7rem] leading-none text-[var(--gold-bright)]">
              {analysis.purchaseScore}
            </p>
            <p className="display-serif mt-3 text-3xl">
              {analysis.verdict}
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Opportunity:{" "}
              {analysis.opportunity}
            </p>
            <div className="mt-5">
              <CalibratedScoreDetails
                calibration={
                  analysis.calibration
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[.85fr_1.15fr]">
        <article className="deal-panel p-7 sm:p-9">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="deal-kicker">
                Offer Inputs
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Compare sellers.
              </h2>
            </div>
            <button
              type="button"
              className="deal-add"
              onClick={() =>
                setOffers((current) => [
                  ...current,
                  {
                    id: `offer-${Date.now()}`,
                    seller: `Seller ${
                      current.length + 1
                    }`,
                    price:
                      analysis.typicalMarketPrice,
                    condition: "new",
                  },
                ])
              }
            >
              <Plus size={15} />
              Add
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {offers.map(
              (offer, index) => (
                <div
                  key={offer.id}
                  className="deal-offer-input"
                >
                  <input
                    aria-label={`Seller ${index + 1}`}
                    value={offer.seller}
                    onChange={(event) =>
                      updateOffer(
                        offer.id,
                        {
                          seller:
                            event.target
                              .value,
                        },
                      )
                    }
                  />
                  <div className="relative">
                    <span>$</span>
                    <input
                      aria-label={`Price ${index + 1}`}
                      inputMode="decimal"
                      value={offer.price || ""}
                      onChange={(event) =>
                        updateOffer(
                          offer.id,
                          {
                            price:
                              Number(
                                event.target.value.replace(
                                  /[^0-9.]/g,
                                  "",
                                ),
                              ) || 0,
                          },
                        )
                      }
                    />
                  </div>
                  <select
                    value={offer.condition}
                    onChange={(event) =>
                      updateOffer(
                        offer.id,
                        {
                          condition:
                            event.target
                              .value as DealOffer["condition"],
                        },
                      )
                    }
                  >
                    <option value="new">
                      New
                    </option>
                    <option value="tester">
                      Tester
                    </option>
                    <option value="used">
                      Used
                    </option>
                  </select>
                  <button
                    type="button"
                    aria-label="Remove offer"
                    disabled={
                      offers.length === 1
                    }
                    onClick={() =>
                      setOffers((current) =>
                        current.filter(
                          (item) =>
                            item.id !==
                            offer.id,
                        ),
                      )
                    }
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="deal-panel p-7 sm:p-9">
          <p className="deal-kicker">
            Buy Window
          </p>
          <h2 className="display-serif mt-3 text-4xl">
            Where this offer sits.
          </h2>
          <div className="deal-window mt-8">
            <div className="deal-window-track">
              <span className="avoid" />
              <span className="wait" />
              <span className="fair" />
              <span className="good" />
              <span className="exceptional" />
              <i
                style={{
                  left: `${Math.max(
                    3,
                    Math.min(
                      97,
                      (analysis.bestOffer
                        .price /
                        (analysis.retailPrice *
                          1.25)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>
            <div className="mt-4 flex justify-between text-[.55rem] uppercase tracking-[.1em] text-[var(--muted)]">
              <span>Exceptional</span>
              <span>Good</span>
              <span>Fair</span>
              <span>Wait</span>
              <span>Avoid</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric
              label="Current"
              value={`$${analysis.bestOffer.price}`}
            />
            <Metric
              label="Fair Value"
              value={`$${analysis.fairValue}`}
            />
            <Metric
              label="Buy Window"
              value={`$${analysis.buyWindow.minimum}–${analysis.buyWindow.maximum}`}
            />
            <Metric
              label="Retail"
              value={`$${analysis.retailPrice}`}
            />
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={<Gauge />}
          label="Strategic Value"
          value={
            analysis.graph
              .strategicValue
          }
        />
        <MetricCard
          icon={<BarChart3 />}
          label="Expansion Value"
          value={
            analysis.graph
              .expansionValue
          }
        />
        <MetricCard
          icon={<CircleDollarSign />}
          label="Projected Cost/Wear"
          value={`$${analysis.projectedCostPerWear.toFixed(
            2,
          )}`}
        />
        <MetricCard
          icon={<Clock3 />}
          label="Annual Wears"
          value={
            analysis.projectedAnnualWears
          }
        />
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.05fr_.95fr]">
        <article className="deal-panel p-7 sm:p-9">
          <p className="deal-kicker">
            Retailer Comparison
          </p>
          <h2 className="display-serif mt-3 text-4xl">
            Ranked offers.
          </h2>
          <div className="mt-7 divide-y divide-[var(--border)]">
            {analysis.offers.map(
              (offer, index) => (
                <div
                  key={offer.id}
                  className="deal-ranked"
                >
                  <span className="display-serif text-2xl text-[var(--gold)]">
                    {String(
                      index + 1,
                    ).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {offer.seller}
                    </p>
                    <p className="mt-1 text-xs capitalize text-[var(--muted)]">
                      {offer.condition} ·
                      Risk{" "}
                      {offer.marketRisk}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="display-serif text-3xl text-[var(--gold-bright)]">
                      ${offer.price}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {offer.verdict} ·{" "}
                      {offer.purchaseScore}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="deal-panel deal-analyst p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Sparkles
              size={18}
              className="text-[var(--gold)]"
            />
            <p className="deal-kicker">
              AI Deal Analyst
            </p>
          </div>
          <blockquote className="display-serif mt-7 text-3xl leading-[1.4]">
            “{analysis.analystVerdict}”
          </blockquote>
          <p className="mt-7 text-xs leading-6 text-[var(--muted)]">
            Market values are calibrated
            OLFACTUS reference estimates,
            not live retailer quotes.
          </p>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <article className="deal-panel p-7 sm:p-9">
          <p className="deal-kicker">
            Decision Timeline
          </p>
          <h2 className="display-serif mt-3 text-4xl">
            Buy, wait, or skip.
          </h2>
          <div className="mt-7 divide-y divide-[var(--border)]">
            {analysis.timeline.map(
              (item) => (
                <div
                  key={item.label}
                  className="deal-timeline"
                >
                  <div>
                    <p className="font-semibold">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      Availability risk{" "}
                      {
                        item.availabilityRisk
                      }
                      /100
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="display-serif text-2xl text-[var(--gold-bright)]">
                      {item.estimatedPrice
                        ? `$${item.estimatedPrice}`
                        : "—"}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {item.verdict}
                      {item.savings
                        ? ` · save $${item.savings}`
                        : ""}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>

        <article className="deal-panel p-7 sm:p-9">
          <p className="deal-kicker">
            Instead Consider
          </p>
          <h2 className="display-serif mt-3 text-4xl">
            Higher-value alternatives.
          </h2>
          <div className="mt-7 divide-y divide-[var(--border)]">
            {analysis.alternatives.map(
              (alternative) => (
                <div
                  key={
                    alternative.fragranceId
                  }
                  className="deal-timeline"
                >
                  <div>
                    <p className="font-semibold">
                      {alternative.name}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {alternative.brand}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-[var(--gold-bright)]">
                      Strategic{" "}
                      {
                        alternative.strategicValue
                      }
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Expansion{" "}
                      {
                        alternative.expansionValue
                      }
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </article>
      </section>

            <LineageIntegrationCard
        fragranceId={effective}
      />

<section className="mt-8 deal-panel p-7 sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="deal-kicker">
              Recent Analyses
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              Saved market decisions.
            </h2>
          </div>
          {history.length ? (
            <button
              type="button"
              className="deal-history-clear"
              onClick={clear}
            >
              Clear History
            </button>
          ) : null}
        </div>

        {history.length ? (
          <div className="mt-7 divide-y divide-[var(--border)]">
            {history
              .slice(0, 8)
              .map((record) => (
                <button
                  key={record.id}
                  type="button"
                  className="deal-history-row"
                  onClick={() => {
                    selectCandidate(
                      record.fragranceId,
                    );
                    setOffers([
                      {
                        id: `history-${record.id}`,
                        seller:
                          record.seller,
                        price:
                          record.price,
                        condition:
                          record.condition,
                      },
                    ]);
                  }}
                >
                  <div className="text-left">
                    <p className="font-semibold">
                      {
                        record.fragranceName
                      }
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {record.brand} ·{" "}
                      {new Date(
                        record.createdAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="display-serif text-2xl text-[var(--gold-bright)]">
                      ${record.price}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {record.verdict} ·{" "}
                      {
                        record.purchaseScore
                      }
                    </p>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <p className="mt-6 text-sm leading-7 text-[var(--muted)]">
            Save a Deal Lab analysis to
            build a local market decision
            history.
          </p>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="deal-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <article className="deal-stat">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
