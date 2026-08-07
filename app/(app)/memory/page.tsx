"use client";

import {
  Brain,
  CalendarClock,
  Database,
  Download,
  Fingerprint,
  RotateCcw,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  useRef,
} from "react";

import {
  useMemoryEngine,
} from "@/components/providers/memory-provider";

export default function MemoryPage() {
  const {
    hydrated,
    events,
    summary,
    insights,
    collectorDna,
    clear,
    exportLedger,
    importLedger,
  } =
    useMemoryEngine();
  const fileRef =
    useRef<HTMLInputElement>(
      null,
    );

  function download() {
    const blob =
      new Blob(
        [
          exportLedger(),
        ],
        {
          type:
            "application/json",
        },
      );
    const url =
      URL.createObjectURL(
        blob,
      );
    const anchor =
      document.createElement(
        "a",
      );
    anchor.href =
      url;
    anchor.download =
      `olfactus-memory-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(
      url,
    );
  }

  async function restore(
    file:
      File,
  ) {
    importLedger(
      await file.text(),
    );
  }

  if (!hydrated) {
    return (
      <div className="pb-12">
        <section className="layer3-hero">
          <p className="layer3-kicker">
            Intelligence Memory
          </p>
          <h1 className="display-serif mt-4 text-[clamp(4rem,8vw,8rem)] leading-[.85]">
            Loading collector memory…
          </h1>
        </section>
      </div>
    );
  }

  return (
    <div className="memory-workspace pb-12">
      <section className="layer3-hero memory-hero">
        <div>
          <p className="layer3-kicker">
            OLFACTUS Memory Engine
          </p>
          <h1 className="display-serif mt-4 text-[clamp(4rem,8vw,8rem)] leading-[.85]">
            Your intelligence
            <br />
            <span className="text-[var(--gold-bright)]">
              now has continuity.
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)]">
            Every recorded wear, collection change, navigation event, recommendation, and decision can now contribute to a persistent understanding of your collector journey.
          </p>
        </div>

        <Brain
          size={62}
          className="text-[var(--gold)]"
        />
      </section>

      <section className="memory-action-bar mt-6">
        <button
          type="button"
          onClick={
            download
          }
        >
          <Download
            size={14}
          />
          Export memory
        </button>
        <button
          type="button"
          onClick={() =>
            fileRef.current?.click()
          }
        >
          <Upload
            size={14}
          />
          Import memory
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "Clear the complete OLFACTUS memory ledger?",
              )
            ) {
              clear();
            }
          }}
        >
          <RotateCcw
            size={14}
          />
          Clear ledger
        </button>
        <input
          ref={fileRef}
          hidden
          type="file"
          accept="application/json"
          onChange={(
            event,
          ) => {
            const file =
              event.target
                .files?.[0];
            if (file) {
              void restore(
                file,
              );
            }
            event.target.value =
              "";
          }}
        />
      </section>

      <section className="memory-metric-grid mt-6">
        <MemoryMetric
          label="Memory events"
          value={
            summary.totalEvents
          }
          icon={
            Database
          }
        />
        <MemoryMetric
          label="Recorded wears"
          value={
            summary.wearCount
          }
          icon={
            CalendarClock
          }
        />
        <MemoryMetric
          label="Insights learned"
          value={
            insights.length
          }
          icon={
            Sparkles
          }
        />
        <MemoryMetric
          label="DNA traits"
          value={
            collectorDna.length
          }
          icon={
            Fingerprint
          }
        />
      </section>

      <section className="memory-layout mt-6">
        <article className="layer3-panel">
          <p className="layer3-kicker">
            Collector DNA
          </p>
          <div className="memory-dna-grid mt-5">
            {collectorDna
              .slice(
                0,
                8,
              )
              .map(
                (trait) => (
                  <div
                    key={
                      trait.id
                    }
                  >
                    <header>
                      <strong>
                        {
                          trait.label
                        }
                      </strong>
                      <span>
                        {
                          trait.score
                        }
                        %
                      </span>
                    </header>
                    <div className="memory-trait-track">
                      <i
                        style={{
                          width:
                            `${trait.score}%`,
                        }}
                      />
                    </div>
                    <p>
                      {
                        trait.explanation
                      }
                    </p>
                    <small>
                      {
                        trait.confidence
                      }
                      % confidence ·{" "}
                      {
                        trait.evidenceCount
                      }{" "}
                      events
                    </small>
                  </div>
                ),
              )}

            {!collectorDna.length ? (
              <MemoryEmpty>
                Collector DNA will emerge after repeated wears, searches, comparisons, and collection changes.
              </MemoryEmpty>
            ) : null}
          </div>
        </article>

        <article className="layer3-panel">
          <p className="layer3-kicker">
            Learned Insights
          </p>
          <div className="memory-insight-list mt-5">
            {insights.map(
              (insight) => (
                <div
                  key={
                    insight.id
                  }
                >
                  <small>
                    {
                      insight.category
                    }
                  </small>
                  <strong>
                    {
                      insight.title
                    }
                  </strong>
                  <p>
                    {
                      insight.statement
                    }
                  </p>
                  <span>
                    {
                      insight.confidence
                    }
                    % confidence ·{" "}
                    {
                      insight.evidenceCount
                    }{" "}
                    signals
                  </span>
                </div>
              ),
            )}

            {!insights.length ? (
              <MemoryEmpty>
                Insights require repeated evidence. OLFACTUS will not infer a behavioral pattern from one isolated action.
              </MemoryEmpty>
            ) : null}
          </div>
        </article>
      </section>

      <section className="layer3-panel mt-6">
        <div className="memory-section-heading">
          <div>
            <p className="layer3-kicker">
              Memory Timeline
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              The collector journey, event by event.
            </h2>
          </div>
          <span>
            {
              events.length
            }{" "}
            total
          </span>
        </div>

        <div className="memory-event-list mt-5">
          {[...events]
            .reverse()
            .slice(
              0,
              80,
            )
            .map(
              (event) => (
                <article
                  key={
                    event.id
                  }
                >
                  <div className="memory-event-mark" />
                  <div>
                    <small>
                      {
                        event.type
                      }{" "}
                      ·{" "}
                      {
                        event.source
                      }
                    </small>
                    <strong>
                      {
                        event.entity
                          ?.label ??
                        event.entity
                          ?.id ??
                        event.type
                      }
                    </strong>
                    <p>
                      {describeEvent(
                        event,
                      )}
                    </p>
                  </div>
                  <time>
                    {new Date(
                      event.timestamp,
                    ).toLocaleString()}
                  </time>
                </article>
              ),
            )}

          {!events.length ? (
            <MemoryEmpty>
              Memory begins with your next navigation, wear, collection change, or Analyst interaction.
            </MemoryEmpty>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function MemoryMetric({
  label,
  value,
  icon:
    Icon,
}: {
  label: string;
  value:
    number | string;
  icon:
    typeof Database;
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

function MemoryEmpty({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="memory-empty">
      {children}
    </div>
  );
}

function describeEvent(
  event:
    import("@/lib/memory/types").MemoryEvent,
): string {
  const metadata =
    event.metadata;

  switch (
    event.type
  ) {
    case "wear-recorded":
      return "Wear activity was added to persistent collector memory.";
    case "collection-added":
      return "A fragrance entered the active collection.";
    case "collection-removed":
      return "A fragrance left the active collection.";
    case "recommendation-shown":
      return "OLFACTUS presented a recommendation for evaluation.";
    case "comparison-executed":
      return "A comparison contributed to preference and decision memory.";
    case "navigation":
      return `Workspace opened: ${String(
        metadata.pathname ??
          event.entity?.id ??
          "unknown",
      )}.`;
    default:
      return "A structured intelligence event was recorded.";
  }
}
