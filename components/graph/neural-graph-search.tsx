"use client";

import {
  ArrowRight,
  BrainCircuit,
  Search,
  Sparkles,
} from "lucide-react";

import type {
  NeuralGraphSearchOutput,
} from "@/lib/intelligence/neural-graph-search";

const suggestions = [
  "Show fragrances closest to Ganymede",
  "Find the best bridge between fresh and amber",
  "Show underused bottles with high strategic value",
  "Which candidate expands my collection the most?",
  "Show office fragrances with low overlap",
];

export function NeuralGraphSearch({
  value,
  onChange,
  onSubmit,
  result,
  onSelectNode,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  result: NeuralGraphSearchOutput | null;
  onSelectNode: (nodeId: string) => void;
}) {
  return (
    <section className="neural-graph-search graph-panel">
      <div className="flex items-center gap-3">
        <BrainCircuit
          size={18}
          className="text-[var(--gold-bright)]"
        />
        <div>
          <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
            Neural Graph Search
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Natural-language graph traversal
          </p>
        </div>
      </div>

      <div className="neural-search-box mt-6">
        <Search size={18} />
        <input
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit();
            }
          }}
          placeholder="Ask the graph a fragrance question"
        />
        <button
          type="button"
          onClick={onSubmit}
        >
          Analyze
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="neural-search-suggestion"
            onClick={() => {
              onChange(suggestion);
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {result ? (
        <div className="mt-7">
          <div className="rounded-[22px] border border-[rgba(232,200,127,.18)] bg-black/10 p-5">
            <div className="flex items-center gap-3">
              <Sparkles
                size={15}
                className="text-[var(--gold)]"
              />
              <p className="text-[.55rem] font-bold uppercase tracking-[.14em] text-[var(--gold)]">
                Graph Answer
              </p>
            </div>
            <p className="display-serif mt-4 text-3xl leading-[1.25]">
              {result.answer}
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {result.results.map(
              (item, index) => (
                <button
                  key={item.node.id}
                  type="button"
                  className="neural-result-card"
                  onClick={() =>
                    onSelectNode(
                      item.node.id,
                    )
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="display-serif text-2xl text-[var(--gold)]">
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <span className="text-sm text-[var(--gold-bright)]">
                      {item.score}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-[var(--gold)]">
                    {item.node.subtitle}
                  </p>
                  <p className="display-serif mt-1 text-3xl text-left">
                    {item.node.label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-left text-[var(--muted)]">
                    {item.explanation}
                  </p>
                </button>
              ),
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
