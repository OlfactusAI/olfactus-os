"use client";

import {
  ArrowRight,
  Radar,
} from "lucide-react";

import {
  usePredictiveIntelligence,
} from "@/components/providers/predictive-provider";

export function PredictiveAhead() {
  const {
    hydrated,
    collectionForecast,
  } =
    usePredictiveIntelligence();

  if (!hydrated) {
    return null;
  }

  const current =
    collectionForecast
      .points.find(
        (point) =>
          point.horizon ===
          "now",
      );
  const future =
    collectionForecast
      .points.find(
        (point) =>
          point.horizon ===
          "90d",
      );

  if (
    !current ||
    !future
  ) {
    return (
      <section className="predictive-ahead mt-6">
        <header>
          <div>
            <p className="layer3-kicker">
              Ahead
            </p>
            <h2 className="display-serif mt-2 text-4xl">
              Your next 90 days.
            </h2>
          </div>
          <Radar
            size={26}
          />
        </header>

        <div className="predictive-ahead-empty mt-5">
          Forecast signals are still calibrating. OLFACTUS will populate this panel as collection and memory evidence becomes available.
        </div>
      </section>
    );
  }

  const signature =
    future.bottleStates.find(
      (bottle) =>
        bottle.state ===
        "signature-candidate",
    );
  const roleGap =
    future.roles.find(
      (role) =>
        role.status !==
        "covered",
    );
  const dnaShift =
    future.dna
      .slice()
      .sort(
        (a, b) =>
          Math.abs(
            b.delta,
          ) -
          Math.abs(
            a.delta,
          ),
      )[0];

  return (
    <section className="predictive-ahead mt-6">
      <header>
        <div>
          <p className="layer3-kicker">
            Ahead
          </p>
          <h2 className="display-serif mt-2 text-4xl">
            Your next 90 days.
          </h2>
        </div>
        <Radar
          size={26}
        />
      </header>

      <div className="predictive-ahead-grid mt-5">
        <article>
          <small>
            Collection Health
          </small>
          <strong>
            {
              current.health
                .center
            }
            <ArrowRight
              size={15}
            />
            {
              future.health
                .center
            }
          </strong>
          <span>
            {
              future.health.low
            }
            –
            {
              future.health.high
            }{" "}
            forecast range
          </span>
        </article>

        <article>
          <small>
            Next risk
          </small>
          <strong>
            {
              future.neglectedCount
            }{" "}
            bottle
            {
              future.neglectedCount ===
              1
                ? ""
                : "s"
            }
          </strong>
          <span>
            projected near neglect
          </span>
        </article>

        <article>
          <small>
            Strongest future signal
          </small>
          <strong>
            {signature
              ?.fragranceName ??
              collectionForecast
                .strongestFutureSignal ??
              "Stable trajectory"}
          </strong>
          <span>
            {signature
              ? "Signature candidate"
              : `${future.confidence}% forecast confidence`}
          </span>
        </article>

        <article>
          <small>
            Likely role gap
          </small>
          <strong>
            {roleGap
              ?.role ??
              "None"}
          </strong>
          <span>
            {roleGap
              ? roleGap.status
              : "Coverage remains intact"}
          </span>
        </article>

        <article>
          <small>
            DNA trajectory
          </small>
          <strong className="capitalize">
            {dnaShift
              ?.dimension ??
              "Stable"}
          </strong>
          <span>
            {dnaShift
              ? `${dnaShift.delta > 0 ? "+" : ""}${dnaShift.delta} share points`
              : "No strong shift detected"}
          </span>
        </article>
      </div>
    </section>
  );
}
