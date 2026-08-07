"use client";

import {
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import {
  useState,
} from "react";

import type {
  ExplainedScore,
} from "@/lib/intelligence-everywhere/types";

export function ExplainedScoreCard({
  explanation,
}: {
  explanation:
    ExplainedScore;
}) {
  const [
    open,
    setOpen,
  ] =
    useState(false);

  return (
    <article className="explained-score-card">
      <div className="explained-score-head">
        <div>
          <small>
            {
              explanation.label
            }
          </small>
          <strong>
            {
              explanation.score
            }
          </strong>
        </div>
        <button
          type="button"
          onClick={() =>
            setOpen(
              (value) =>
                !value,
            )
          }
        >
          Why?
          <ChevronDown
            size={13}
          />
        </button>
      </div>

      {open ? (
        <div className="explained-score-body">
          <div>
            <h4>
              Strengths
            </h4>
            {explanation.positives.map(
              (item) => (
                <p
                  key={item}
                >
                  + {item}
                </p>
              ),
            )}
          </div>

          <div>
            <h4>
              Friction
            </h4>
            {explanation.negatives.map(
              (item) => (
                <p
                  key={item}
                >
                  − {item}
                </p>
              ),
            )}
          </div>

          <footer>
            <ShieldCheck
              size={13}
            />
            {
              explanation.confidence
            }
            % confidence ·{" "}
            {
              explanation.evidence
                .length
            }{" "}
            evidence signals
          </footer>
        </div>
      ) : null}
    </article>
  );
}
