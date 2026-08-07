"use client";

import {
  Activity,
  BrainCircuit,
  Gauge,
  Radar,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import {
  usePredictiveIntelligence,
} from "@/components/providers/predictive-provider";

export default function PredictionsPage() {
  const {
    hydrated,
    snapshot,
    calibration,
    collectionForecast,
  } =
    usePredictiveIntelligence();
  const [
    selectedHorizon,
    setSelectedHorizon,
  ] =
    useState<
      "30d" |
      "90d" |
      "6m" |
      "1y"
    >(
      "90d",
    );

  const selectedForecast =
    collectionForecast
      .points.find(
        (point) =>
          point.horizon ===
          selectedHorizon,
      ) ??
    collectionForecast
      .points[2];

  const stableBottleIds =
    useMemo(() => {
      const now =
        collectionForecast
          .points.find(
            (point) =>
              point.horizon ===
              "now",
          );

      return [
        ...new Set(
          (
            now?.bottleStates ??
            []
          ).map(
            (bottle) =>
              bottle.fragranceId,
          ),
        ),
      ];
    }, [
      collectionForecast,
    ]);

  const visibleBottleStates =
    useMemo(() => {
      if (!selectedForecast) {
        return [];
      }

      const byId =
        new Map(
          selectedForecast
            .bottleStates.map(
              (bottle) => [
                bottle.fragranceId,
                bottle,
              ],
            ),
        );

      return stableBottleIds
        .map(
          (id) =>
            byId.get(id),
        )
        .filter(
          (
            bottle,
          ): bottle is
            NonNullable<
              typeof bottle
            > =>
            Boolean(bottle),
        );
    }, [
      selectedForecast,
      stableBottleIds,
    ]);

  if (!hydrated) {
    return (
      <div className="pb-12">
        <section className="layer3-hero">
          <p className="layer3-kicker">
            Predictive Intelligence
          </p>
          <h1 className="display-serif mt-4 text-[clamp(4rem,8vw,8rem)] leading-[.85]">
            Calibrating your predictive model…
          </h1>
        </section>
      </div>
    );
  }

  return (
    <div className="predictive-workspace pb-12">
      <section className="layer3-hero predictive-hero">
        <div>
          <p className="layer3-kicker">
            OLFACTUS Intelligence Engine v3
          </p>
          <h1 className="display-serif mt-4 text-[clamp(4rem,8vw,8rem)] leading-[.85]">
            From memory
            <br />
            <span className="text-[var(--gold-bright)]">
              to prediction.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Predictive Intelligence uses your collection state and recorded memory events to estimate retention risk, signature potential, taste drift, and future recommendation fit. Low-evidence predictions remain explicitly low confidence.
          </p>
        </div>

        <Radar
          size={64}
          className="text-[var(--gold)]"
        />
      </section>

      <section className="predictive-metric-grid mt-6">
        <Metric
          label="Model confidence"
          value={`${snapshot.confidence}%`}
          icon={
            Gauge
          }
        />
        <Metric
          label="Evidence events"
          value={
            snapshot.evidenceEvents
          }
          icon={
            Activity
          }
        />
        <Metric
          label="Calibration"
          value={
            calibration.state
          }
          icon={
            BrainCircuit
          }
        />
        <Metric
          label="Adaptive candidates"
          value={
            snapshot.adaptiveRecommendations.length
          }
          icon={
            Sparkles
          }
        />
      </section>

      <section className="layer3-panel predictive-future-timeline mt-6">
        <div className="predictive-future-heading">
          <div>
            <p className="layer3-kicker">
              Future Collection Timeline
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              Where your collection is heading if nothing changes.
            </h2>
          </div>
          <span>
            {
              selectedForecast
                ?.confidence ??
              collectionForecast
                .overallConfidence
            }
            % confidence
          </span>
        </div>

        <div className="future-timeline-track mt-5">
          {collectionForecast
            .points.map(
              (point) => (
                <button
                  key={
                    point.horizon
                  }
                  type="button"
                  className={
                    selectedHorizon ===
                    point.horizon
                      ? "is-active"
                      : point.horizon ===
                          "now"
                        ? "is-now"
                        : ""
                  }
                  disabled={
                    point.horizon ===
                    "now"
                  }
                  onClick={() => {
                    if (
                      point.horizon !==
                      "now"
                    ) {
                      setSelectedHorizon(
                        point.horizon,
                      );
                    }
                  }}
                >
                  <small>
                    {
                      point.label
                    }
                  </small>
                  <strong>
                    {
                      point.health
                        .center
                    }
                  </strong>
                  <span>
                    {
                      point.health.low
                    }
                    –
                    {
                      point.health.high
                    }
                  </span>
                </button>
              ),
            )}
        </div>

        {selectedForecast ? (
          <>
            <div className="future-forecast-grid mt-5">
              <ForecastMetric
                label="Collection Health"
                value={
                  selectedForecast
                    .health.center
                }
                note={`${selectedForecast.health.low}–${selectedForecast.health.high} range`}
              />
              <ForecastMetric
                label="Active rotation"
                value={
                  selectedForecast
                    .activeRotation
                }
                note={`${selectedForecast.neglectedCount} projected neglected`}
              />
              <ForecastMetric
                label="DNA diversity"
                value={
                  selectedForecast
                    .diversity
                }
                note={`${selectedForecast.health.trend} health trajectory`}
              />
              <ForecastMetric
                label="Signature stability"
                value={
                  selectedForecast
                    .signatureStability
                }
                note={`${selectedForecast.confidence}% confidence`}
              />
            </div>

            <div className="future-forecast-detail mt-5">
              <article>
                <div className="future-state-heading">
                  <p className="layer3-kicker">
                    Bottle Future States
                  </p>
                  <span>
                    {
                      visibleBottleStates.length
                    }{" "}
                    owned
                  </span>
                </div>
                <div className="future-bottle-state-list mt-4">
                  {visibleBottleStates
                    .slice(
                      0,
                      8,
                    )
                    .map(
                      (bottle) => (
                        <div
                          key={
                            bottle.fragranceId
                          }
                        >
                          <div>
                            <small>
                              {
                                bottle.brand
                              }
                            </small>
                            <strong>
                              {
                                bottle.fragranceName
                              }
                            </strong>
                          </div>
                          <span
                            data-state={
                              bottle.state
                            }
                          >
                            {formatFutureState(
                              bottle.state,
                            )}
                          </span>
                        </div>
                      ),
                    )}
                </div>
              </article>

              <article>
                <p className="layer3-kicker">
                  Forecast Drivers
                </p>
                <div className="future-driver-list mt-4">
                  {selectedForecast
                    .drivers
                    .slice(
                      0,
                      6,
                    )
                    .map(
                      (driver) => (
                        <div
                          key={`${driver.kind}:${driver.title}`}
                          data-kind={
                            driver.kind
                          }
                        >
                          <strong>
                            {driver.kind ===
                            "positive"
                              ? "+"
                              : "−"}{" "}
                            {
                              driver.title
                            }
                          </strong>
                          <p>
                            {
                              driver.detail
                            }
                          </p>
                        </div>
                      ),
                    )}
                </div>
              </article>

              <article>
                <p className="layer3-kicker">
                  Future Role Coverage
                </p>
                <div className="future-role-list mt-4">
                  {selectedForecast
                    .roles
                    .filter(
                      (role) =>
                        role.status !==
                        "covered",
                    )
                    .slice(
                      0,
                      6,
                    )
                    .map(
                      (role) => (
                        <div
                          key={
                            role.role
                          }
                        >
                          <strong>
                            {
                              role.role
                            }
                          </strong>
                          <span>
                            {
                              role.status
                            }
                          </span>
                        </div>
                      ),
                    )}
                  {!selectedForecast
                    .roles.some(
                      (role) =>
                        role.status !==
                        "covered",
                    ) ? (
                    <p className="predictive-inline-empty">
                      No role gaps are projected at this horizon.
                    </p>
                  ) : null}
                </div>
              </article>

              <article>
                <p className="layer3-kicker">
                  DNA Forecast
                </p>
                <div className="future-dna-list mt-4">
                  {selectedForecast
                    .dna
                    .slice(
                      0,
                      5,
                    )
                    .map(
                      (dna) => (
                        <div
                          key={
                            dna.dimension
                          }
                        >
                          <strong className="capitalize">
                            {
                              dna.dimension
                            }
                          </strong>
                          <span>
                            {
                              dna.share
                            }
                            %
                          </span>
                          <small>
                            {dna.delta >
                            0
                              ? "+"
                              : ""}
                            {
                              dna.delta
                            }
                          </small>
                        </div>
                      ),
                    )}
                </div>
              </article>
            </div>

            {selectedForecast
              .milestones
              .length ? (
              <div className="future-milestone-list mt-5">
                {selectedForecast
                  .milestones
                  .map(
                    (
                      milestone,
                    ) => (
                      <article
                        key={
                          milestone.id
                        }
                      >
                        <small>
                          {
                            milestone.category
                          }
                        </small>
                        <strong>
                          {
                            milestone.title
                          }
                        </strong>
                        <p>
                          {
                            milestone.detail
                          }
                        </p>
                        <span>
                          {
                            milestone.confidence
                          }
                          % confidence
                        </span>
                      </article>
                    ),
                  )}
              </div>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="predictive-layout mt-6">
        <article className="layer3-panel">
          <p className="layer3-kicker">
            Bottle Forecast
          </p>

          <div className="predictive-bottle-list mt-5">
            {snapshot.bottlePredictions.map(
              (
                prediction,
              ) => (
                <div
                  key={
                    prediction.fragranceId
                  }
                >
                  <header>
                    <div>
                      <small>
                        {
                          prediction.brand
                        }
                      </small>
                      <strong>
                        {
                          prediction.fragranceName
                        }
                      </strong>
                    </div>
                    <span
                      data-status={
                        prediction.status
                      }
                    >
                      {
                        prediction.status
                      }
                    </span>
                  </header>

                  <div className="predictive-dual-score">
                    <div>
                      <small>
                        Retention risk
                      </small>
                      <strong>
                        {
                          prediction.retentionRisk
                        }
                        %
                      </strong>
                    </div>
                    <div>
                      <small>
                        Signature potential
                      </small>
                      <strong>
                        {
                          prediction.signaturePotential
                        }
                        %
                      </strong>
                    </div>
                  </div>

                  <p>
                    {
                      prediction.explanation
                    }
                  </p>
                  <footer>
                    {
                      prediction.confidence
                    }
                    % confidence · 90-day horizon
                  </footer>
                </div>
              ),
            )}

            {!snapshot.bottlePredictions.length ? (
              <EmptyState>
                Add fragrances to your collection before bottle-level predictions can be calculated.
              </EmptyState>
            ) : null}
          </div>
        </article>

        <article className="layer3-panel">
          <p className="layer3-kicker">
            Taste Drift
          </p>

          <div className="predictive-drift-list mt-5">
            {snapshot.tasteDrift.map(
              (
                signal,
              ) => (
                <div
                  key={
                    signal.dimension
                  }
                >
                  <header>
                    <strong>
                      {
                        signal.dimension
                      }
                    </strong>
                    <span>
                      {signal.delta >
                      0
                        ? "+"
                        : ""}
                      {
                        signal.delta
                      }
                    </span>
                  </header>
                  <div>
                    <i
                      style={{
                        width:
                          `${signal.previousScore}%`,
                      }}
                    />
                    <b
                      style={{
                        width:
                          `${signal.recentScore}%`,
                      }}
                    />
                  </div>
                  <p>
                    Earlier{" "}
                    {
                      signal.previousScore
                    }
                    /100 → Recent{" "}
                    {
                      signal.recentScore
                    }
                    /100
                  </p>
                </div>
              ),
            )}

            {!snapshot.tasteDrift.length ? (
              <EmptyState>
                Taste drift requires at least four recorded wear events that resolve to fragrances in the active database.
              </EmptyState>
            ) : null}
          </div>
        </article>
      </section>

      <section className="predictive-layout mt-6">
        <article className="layer3-panel">
          <p className="layer3-kicker">
            Learned Preference Model
          </p>

          <div className="predictive-affinity-columns mt-5">
            <AffinityColumn
              title="Families"
              items={
                snapshot.familyAffinities
              }
            />
            <AffinityColumn
              title="Accords"
              items={
                snapshot.accordAffinities
              }
            />
          </div>
        </article>

        <article className="layer3-panel">
          <p className="layer3-kicker">
            Adaptive Recommendations
          </p>

          <div className="predictive-recommendations mt-5">
            {snapshot.adaptiveRecommendations
              .slice(
                0,
                6,
              )
              .map(
                (
                  recommendation,
                  index,
                ) => (
                  <div
                    key={
                      recommendation.fragranceId
                    }
                  >
                    <span>
                      0
                      {index +
                        1}
                    </span>
                    <div>
                      <small>
                        {
                          recommendation.brand
                        }
                      </small>
                      <strong>
                        {
                          recommendation.fragranceName
                        }
                      </strong>
                      <p>
                        {
                          recommendation.summary
                        }
                      </p>
                    </div>
                    <aside>
                      <strong>
                        {
                          recommendation.probability
                        }
                        %
                      </strong>
                      <small>
                        {
                          recommendation.confidence
                        }
                        % confidence
                      </small>
                    </aside>
                  </div>
                ),
              )}

            {!snapshot.adaptiveRecommendations.length ? (
              <EmptyState>
                Adaptive recommendations need repeated wear evidence before learned preferences become strong enough to rank new fragrances.
              </EmptyState>
            ) : null}
          </div>
        </article>
      </section>

      <section className="layer3-panel mt-6">
        <div className="predictive-calibration-heading">
          <div>
            <p className="layer3-kicker">
              Prediction Calibration
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              The model measures how much evidence it actually has.
            </h2>
          </div>
          <span>
            {
              calibration.calibrationConfidence
            }
            %
          </span>
        </div>

        <div className="predictive-calibration-grid mt-5">
          <CalibrationMetric
            label="Recommendations shown"
            value={
              calibration.shown
            }
          />
          <CalibrationMetric
            label="Accepted"
            value={
              calibration.accepted
            }
          />
          <CalibrationMetric
            label="Ignored"
            value={
              calibration.ignored
            }
          />
          <CalibrationMetric
            label="Acceptance rate"
            value={
              calibration.acceptanceRate !==
              undefined
                ? `${calibration.acceptanceRate}%`
                : "—"
            }
          />
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon:
    Icon,
}: {
  label: string;
  value:
    string | number;
  icon:
    typeof Gauge;
}) {
  return (
    <article>
      <Icon
        size={17}
      />
      <small>
        {label}
      </small>
      <strong>
        {value}
      </strong>
    </article>
  );
}

function AffinityColumn({
  title,
  items,
}: {
  title: string;
  items:
    Array<{
      id: string;
      label: string;
      score: number;
      confidence: number;
      evidenceCount: number;
      direction:
        "rising" |
        "stable" |
        "falling";
    }>;
}) {
  return (
    <div>
      <h3>
        {title}
      </h3>
      {items
        .slice(
          0,
          7,
        )
        .map(
          (item) => (
            <article
              key={
                item.id
              }
            >
              <div>
                <strong>
                  {
                    item.label
                  }
                </strong>
                <small>
                  {
                    item.evidenceCount
                  }{" "}
                  wears
                </small>
              </div>
              <span>
                {
                  item.score
                }
                %
              </span>
            </article>
          ),
        )}

      {!items.length ? (
        <p className="predictive-inline-empty">
          No repeated wear preference has enough evidence yet.
        </p>
      ) : null}
    </div>
  );
}

function CalibrationMetric({
  label,
  value,
}: {
  label: string;
  value:
    string | number;
}) {
  return (
    <article>
      <small>
        {label}
      </small>
      <strong>
        {value}
      </strong>
    </article>
  );
}

function EmptyState({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="predictive-empty">
      {children}
    </div>
  );
}


function ForecastMetric({
  label,
  value,
  note,
}: {
  label: string;
  value:
    string | number;
  note: string;
}) {
  return (
    <article>
      <small>
        {label}
      </small>
      <strong>
        {value}
      </strong>
      <span>
        {note}
      </span>
    </article>
  );
}

function formatFutureState(
  state: string,
) {
  return state
    .split("-")
    .map(
      (word) =>
        word
          ? word[0]
              .toUpperCase() +
            word.slice(1)
          : word,
    )
    .join(" ");
}
