"use client";

import {
  ArrowDown,
  BrainCircuit,
} from "lucide-react";

import type {
  RecommendationTrace,
} from "@/lib/intelligence-everywhere/types";

export function RecommendationTraceView({
  trace,
}: {
  trace:
    RecommendationTrace;
}) {
  return (
    <section className="recommendation-trace">
      <header>
        <div>
          <small>
            Recommendation Trace
          </small>
          <h3 className="display-serif">
            {
              trace.recommendation
            }
          </h3>
        </div>
        <div>
          <BrainCircuit
            size={18}
          />
          <strong>
            {
              trace.confidence
            }
            %
          </strong>
        </div>
      </header>

      <div className="recommendation-trace-steps">
        {trace.steps.map(
          (
            step,
            index,
          ) => (
            <div
              key={
                step.id
              }
            >
              <article>
                <small>
                  {
                    step.label
                  }
                </small>
                <strong>
                  {
                    step.value
                  }
                </strong>
                <p>
                  {
                    step.explanation
                  }
                </p>
              </article>
              {index <
              trace.steps.length -
                1 ? (
                <ArrowDown
                  size={14}
                />
              ) : null}
            </div>
          ),
        )}
      </div>
    </section>
  );
}
