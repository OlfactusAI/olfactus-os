"use client";

import {
  Brain,
} from "lucide-react";

import {
  useIntelligenceEverywhere,
} from "@/components/providers/intelligence-everywhere-provider";

export function MemoryInsights() {
  const {
    memories,
  } =
    useIntelligenceEverywhere();

  return (
    <section className="memory-insights">
      <header>
        <Brain
          size={15}
        />
        <div>
          <small>
            Memory Engine
          </small>
          <strong>
            Learned behavior
          </strong>
        </div>
      </header>

      <div>
        {memories
          .slice(
            0,
            5,
          )
          .map(
            (memory) => (
              <article
                key={
                  memory.id
                }
              >
                <p>
                  {
                    memory.statement
                  }
                </p>
                <span>
                  {
                    memory.confidence
                  }
                  % confidence ·{" "}
                  {
                    memory.evidenceCount
                  }{" "}
                  observations
                </span>
              </article>
            ),
          )}

        {!memories.length ? (
          <p className="intelligence-empty">
            OLFACTUS will surface patterns after enough wear, purchase, and rotation evidence accumulates.
          </p>
        ) : null}
      </div>
    </section>
  );
}
