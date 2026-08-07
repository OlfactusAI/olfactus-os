"use client";

import type {
  RecommendationExplanationV2,
} from "@/lib/recommendation-v2/explanation-view-model";

export function RecommendationExplanationPanel({
  explanation,
}: {
  explanation:
    RecommendationExplanationV2;
}) {
  return (
    <section className="layer3-panel mt-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="layer3-kicker">
            Explain Score
          </p>
          <h3 className="mt-2 text-xl font-semibold">
            {explanation.brand}{" "}
            {explanation.fragranceName}
          </h3>
        </div>

        <div className="text-right">
          <small className="block text-[var(--muted)]">
            NRE 2.0 score
          </small>
          <strong className="text-3xl">
            {explanation.score}
          </strong>
          <small className="ml-2 text-[var(--muted)]">
            {explanation.confidence}% confidence
          </small>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {explanation.trace.map(
          (step) => (
            <article
              key={step.factor}
              className="rounded-2xl border border-white/10 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <strong>
                  {step.label}
                </strong>
                <span>
                  {step.contribution > 0
                    ? "+"
                    : ""}
                  {step.contribution}
                </span>
              </div>

              <p className="mt-2 text-sm text-[var(--muted)]">
                {step.explanation}
              </p>
            </article>
          ),
        )}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 p-5">
          <small className="text-[var(--muted)]">
            Strengths
          </small>
          <ul className="mt-3 space-y-2 text-sm">
            {(
              explanation.strengths.length
                ? explanation.strengths
                : [
                    "No major positive factor was isolated.",
                  ]
            ).map(
              (item) => (
                <li key={item}>
                  • {item}
                </li>
              ),
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-white/10 p-5">
          <small className="text-[var(--muted)]">
            Friction
          </small>
          <ul className="mt-3 space-y-2 text-sm">
            {(
              explanation.friction.length
                ? explanation.friction
                : [
                    "No major negative factor was isolated.",
                  ]
            ).map(
              (item) => (
                <li key={item}>
                  • {item}
                </li>
              ),
            )}
          </ul>
        </article>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/10 p-5">
          <small className="text-[var(--muted)]">
            Opportunity Cost
          </small>

          <strong className="mt-2 block text-2xl">
            {explanation.opportunityCost.netGain >= 0
              ? "+"
              : ""}
            {Math.round(
              explanation.opportunityCost.netGain,
            )}
          </strong>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {
              explanation.opportunityCost
                .explanation
            }
          </p>
        </article>

        <article className="rounded-2xl border border-white/10 p-5">
          <small className="text-[var(--muted)]">
            Collection Impact Preview
          </small>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <span>
              Health{" "}
              {signed(
                explanation.collectionImpact
                  .healthDelta,
              )}
            </span>
            <span>
              Diversity{" "}
              {signed(
                explanation.collectionImpact
                  .diversityDelta,
              )}
            </span>
            <span>
              Redundancy{" "}
              {signed(
                explanation.collectionImpact
                  .redundancyDelta,
              )}
            </span>
            <span>
              Roles{" "}
              {signed(
                explanation.collectionImpact
                  .roleCoverageDelta,
              )}
            </span>
          </div>

          <p className="mt-3 text-sm text-[var(--muted)]">
            Rotation{" "}
            {
              explanation.collectionImpact
                .projectedRotation
            }
          </p>
        </article>
      </div>
    </section>
  );
}

function signed(
  value: number,
) {
  return `${
    value > 0
      ? "+"
      : ""
  }${value}`;
}
