"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  ChevronDown,
  ChevronUp,
  Clock3,
  Network,
  RotateCcw,
  ShieldCheck,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import type {
  CollectorAssistantInsight,
} from "@/lib/intelligence/collector-assistant-engine";
import {
  loadAssistantFeedback,
  saveAssistantFeedback,
} from "@/lib/intelligence/assistant-feedback";

export function CollectorAssistantPanel({
  insights,
}: {
  insights:
    CollectorAssistantInsight[];
}) {
  const [
    hiddenIds,
    setHiddenIds,
  ] =
    useState<Set<string>>(
      new Set(),
    );
  const [
    expandedId,
    setExpandedId,
  ] = useState<
    string | null
  >(null);

  useEffect(() => {
    const feedback =
      loadAssistantFeedback();
    setHiddenIds(
      new Set(
        feedback
          .filter(
            (item) =>
              item.feedback ===
                "dismissed" ||
              item.feedback ===
                "remind-later",
          )
          .map(
            (item) =>
              item.insightId,
          ),
      ),
    );
  }, []);

  const visible =
    insights.filter(
      (insight) =>
        !hiddenIds.has(
          insight.id,
        ),
    );

  function feedback(
    insightId: string,
    value:
      | "helpful"
      | "inaccurate"
      | "dismissed"
      | "remind-later",
  ) {
    saveAssistantFeedback(
      insightId,
      value,
    );

    if (
      value ===
        "dismissed" ||
      value ===
        "remind-later"
    ) {
      setHiddenIds(
        (current) =>
          new Set([
            ...current,
            insightId,
          ]),
      );
    }
  }

  return (
    <section className="layer3-panel mt-8">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="layer3-kicker">
            AI Collector Assistant
          </p>
          <h2 className="display-serif mt-3 text-4xl">
            What needs your attention.
          </h2>
        </div>
        <BrainCircuit
          className="text-[var(--gold)]"
          size={28}
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        {visible.map(
          (insight) => {
            const expanded =
              expandedId ===
              insight.id;

            return (
              <article
                key={
                  insight.id
                }
                className="layer3-insight"
              >
                <span
                  className={`layer3-priority is-${insight.priority}`}
                >
                  {
                    insight.priority
                  }
                </span>
                <div className="flex items-center gap-2 text-[var(--gold-bright)]">
                  {insight.type ===
                  "rotation" ? (
                    <RotateCcw
                      size={15}
                    />
                  ) : insight.type ===
                    "overlap" ? (
                    <Network
                      size={15}
                    />
                  ) : insight.priority ===
                    "high" ? (
                    <AlertTriangle
                      size={15}
                    />
                  ) : (
                    <ShieldCheck
                      size={15}
                    />
                  )}
                  <strong>
                    {
                      insight.title
                    }
                  </strong>
                </div>

                <p>
                  {
                    insight.message
                  }
                </p>

                <button
                  type="button"
                  className="assistant-evidence-toggle"
                  onClick={() =>
                    setExpandedId(
                      expanded
                        ? null
                        : insight.id,
                    )
                  }
                >
                  {expanded ? (
                    <ChevronUp
                      size={13}
                    />
                  ) : (
                    <ChevronDown
                      size={13}
                    />
                  )}
                  Why this appeared
                </button>

                {expanded ? (
                  <div className="assistant-evidence">
                    {insight.evidence.map(
                      (item) => (
                        <div
                          key={
                            item.label
                          }
                        >
                          <span>
                            {
                              item.label
                            }
                          </span>
                          <strong>
                            {
                              item.value
                            }
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                ) : null}

                <Link
                  href={
                    insight.href
                  }
                  className="assistant-primary-action"
                >
                  {
                    insight.action
                  }
                  <ArrowRight
                    size={14}
                  />
                </Link>

                <div className="assistant-feedback-actions">
                  <button
                    type="button"
                    title="Helpful"
                    onClick={() =>
                      feedback(
                        insight.id,
                        "helpful",
                      )
                    }
                  >
                    <ThumbsUp
                      size={12}
                    />
                  </button>
                  <button
                    type="button"
                    title="Inaccurate"
                    onClick={() =>
                      feedback(
                        insight.id,
                        "inaccurate",
                      )
                    }
                  >
                    <ThumbsDown
                      size={12}
                    />
                  </button>
                  <button
                    type="button"
                    title="Remind later"
                    onClick={() =>
                      feedback(
                        insight.id,
                        "remind-later",
                      )
                    }
                  >
                    <Clock3
                      size={12}
                    />
                  </button>
                  <button
                    type="button"
                    title="Dismiss"
                    onClick={() =>
                      feedback(
                        insight.id,
                        "dismissed",
                      )
                    }
                  >
                    <X size={12} />
                  </button>
                </div>
              </article>
            );
          },
        )}

        {!visible.length ? (
          <p className="text-sm text-[var(--muted)]">
            No active assistant alerts. Dismissed insights remain stored locally.
          </p>
        ) : null}
      </div>
    </section>
  );
}
