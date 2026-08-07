"use client";

import {
  BrainCircuit,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Command,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  usePathname,
} from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useCollection,
} from "@/components/providers/collection-provider";
import {
  useCollectorIntelligence,
} from "@/components/providers/collector-intelligence-provider";
import {
  appendAnalystActivity,
} from "@/lib/analyst/activity-ledger";
import { appendMemoryEvent } from "@/lib/memory/store";
import {
  parseAnalystCommand,
} from "@/lib/analyst/commands";
import {
  runUnifiedAnalystCommand,
} from "@/lib/analyst/unified-engine";
import type {
  AnalystActionPreview,
  AnalystEvidence,
  AnalystResponse,
} from "@/lib/analyst/types";
import {
  buildEntityRegistry,
} from "@/lib/entities/registry";

const suggestions = [
  "Why is my Collection Health this score?",
  "What should I wear?",
  "Show my neglected bottles",
  "/compare Ganymede vs Reflection Man",
];

export function GlobalOlfactusAnalyst() {
  const pathname =
    usePathname();
  const {
    hydrated:
      collectionHydrated,
    logWear,
  } =
    useCollection();
  const {
    hydrated:
      intelligenceHydrated,
    api,
  } =
    useCollectorIntelligence();
  const catalog =
    api.getCatalogContext();
  const hydrated =
    collectionHydrated &&
    intelligenceHydrated;
  const [
    expanded,
    setExpanded,
  ] =
    useState(false);
  const [
    input,
    setInput,
  ] =
    useState("");
  const [
    response,
    setResponse,
  ] =
    useState<AnalystResponse | null>(
      null,
    );
  const [
    preview,
    setPreview,
  ] =
    useState<AnalystActionPreview | null>(
      null,
    );
  const [
    status,
    setStatus,
  ] =
    useState<string | null>(
      null,
    );
  const inputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const registry =
    useMemo(
      () =>
        buildEntityRegistry(
          catalog,
        ),
      [catalog],
    );

  useEffect(() => {
    function shortcut(
      event:
        KeyboardEvent,
    ) {
      if (
        (event.metaKey ||
          event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();
        setExpanded(true);
        requestAnimationFrame(
          () =>
            inputRef.current?.focus(),
        );
      }
    }

    window.addEventListener(
      "keydown",
      shortcut,
    );

    return () =>
      window.removeEventListener(
        "keydown",
        shortcut,
      );
  }, []);

  useEffect(() => {
    setStatus(null);
  }, [
    pathname,
  ]);

  if (
    !hydrated ||
    pathname === "/graph"
  ) {
    return null;
  }

  function submit(
    requested =
      input,
  ) {
    const value =
      requested.trim();

    if (!value) {
      return;
    }

    const command =
      parseAnalystCommand(
        value,
      );
    const result =
      runUnifiedAnalystCommand({
        command,
        api,
        registry,
      });

    setResponse(
      result.response,
    );
    setPreview(
      result.preview ??
      null,
    );
    setInput("");
    setStatus(null);

    appendAnalystActivity({
      kind: "query",
      summary:
        value,
      metadata: {
        pathname,
        intent:
          command.intent,
      },
    });
    appendMemoryEvent({
      type:
        command.intent ===
        "compare"
          ? "comparison-executed"
          : command.intent ===
              "recommend-owned"
            ? "recommendation-shown"
            : "search-executed",
      source:
        "analyst",
      confidence: 92,
      metadata: {
        pathname,
        intent:
          command.intent,
        query:
          value,
      },
    });
    appendAnalystActivity({
      kind: "response",
      summary:
        result.response.title,
      confidence:
        "confidence" in
        result.response
          ? result.response
              .confidence
          : undefined,
      metadata: {
        responseType:
          result.response.type,
      },
    });

    if (
      result.preview
    ) {
      appendAnalystActivity({
        kind:
          "action-proposed",
        summary:
          result.preview.summary,
        metadata: {
          action:
            result.preview.action,
          fragranceId:
            result.preview.fragranceId,
        },
      });
    }
  }

  function confirmPreview() {
    if (!preview) {
      return;
    }

    if (
      preview.action ===
      "record-wear"
    ) {
      logWear(
        preview.fragranceId,
      );
    }

    appendAnalystActivity({
      kind:
        "action-confirmed",
      summary:
        preview.summary,
      metadata: {
        action:
          preview.action,
        fragranceId:
          preview.fragranceId,
      },
    });
    appendMemoryEvent({
      type:
        preview.action ===
        "record-wear"
          ? "recommendation-accepted"
          : "decision-recorded",
      source:
        "analyst",
      entity: {
        type:
          "fragrance",
        id:
          preview.fragranceId,
        label:
          preview.fragranceName,
      },
      confidence: 100,
      metadata: {
        action:
          preview.action,
      },
    });

    setStatus(
      `${preview.fragranceName} wear recorded.`,
    );
    setPreview(null);
  }

  function cancelPreview() {
    if (!preview) {
      return;
    }

    appendAnalystActivity({
      kind:
        "action-canceled",
      summary:
        preview.summary,
      metadata: {
        action:
          preview.action,
        fragranceId:
          preview.fragranceId,
      },
    });

    setStatus(
      "Proposed action canceled. No collection data changed.",
    );
    setPreview(null);
  }

  const pageLabel =
    getWorkspaceLabel(
      pathname,
    );

  return (
    <aside
      className={`global-analyst proactive-analyst ${
        expanded
          ? "is-expanded"
          : ""
      }`}
      aria-label="OLFACTUS Analyst"
    >
      <button
        type="button"
        className="global-analyst-header"
        onClick={() =>
          setExpanded(
            (value) =>
              !value,
          )
        }
        aria-expanded={
          expanded
        }
      >
        <span className="global-analyst-mark">
          <BrainCircuit
            size={16}
          />
        </span>
        <span className="min-w-0 flex-1 text-left">
          <strong>
            OLFACTUS Analyst
          </strong>
          <small>
            {pageLabel}
          </small>
        </span>
        {expanded ? (
          <ChevronDown
            size={15}
          />
        ) : (
          <ChevronUp
            size={15}
          />
        )}
      </button>

      {expanded ? (
        <div className="global-analyst-body proactive-analyst-body">
          <div className="analyst-context-strip">
            <span>
              Current workspace
            </span>
            <strong>
              {pageLabel}
            </strong>
            <small>
              <Command
                size={11}
              />
              ⌘⇧K / Ctrl⇧K
            </small>
          </div>

          <div className="analyst-suggestions">
            {suggestions.map(
              (suggestion) => (
                <button
                  key={
                    suggestion
                  }
                  type="button"
                  onClick={() =>
                    submit(
                      suggestion,
                    )
                  }
                >
                  {
                    suggestion
                  }
                </button>
              ),
            )}
          </div>

          {response ? (
            <AnalystResponseCard
              response={
                response
              }
            />
          ) : (
            <div className="analyst-welcome">
              <p className="display-serif">
                Ask about your live collection.
              </p>
              <span>
                Answers distinguish verified, calculated, estimated, and unavailable evidence.
              </span>
            </div>
          )}

          {preview ? (
            <ActionPreview
              preview={
                preview
              }
              onConfirm={
                confirmPreview
              }
              onCancel={
                cancelPreview
              }
            />
          ) : null}

          {status ? (
            <div className="analyst-status">
              <ShieldCheck
                size={13}
              />
              {status}
            </div>
          ) : null}

          <form
            className="analyst-composer"
            onSubmit={(
              event,
            ) => {
              event.preventDefault();
              submit();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(
                event,
              ) =>
                setInput(
                  event.target
                    .value,
                )
              }
              placeholder="Ask OLFACTUS or enter /command"
              aria-label="Ask OLFACTUS Analyst"
            />
            <button
              type="submit"
              aria-label="Send"
            >
              <Send
                size={15}
              />
            </button>
          </form>
        </div>
      ) : null}
    </aside>
  );
}

function AnalystResponseCard({
  response,
}: {
  response:
    AnalystResponse;
}) {
  return (
    <section className="analyst-response-card">
      <header>
        <small>
          {
            response.type
          }
        </small>
        <strong>
          {
            response.title
          }
        </strong>
      </header>

      {response.type ===
      "health-explanation" ? (
        <>
          <div className="analyst-score-row">
            <strong>
              {
                response.score
              }
            </strong>
            <span>
              {
                response.confidence
              }
              % confidence
            </span>
          </div>
          <FactorList
            label="Strengths"
            items={
              response.positives
            }
            positive
          />
          <FactorList
            label="Friction"
            items={
              response.negatives
            }
          />
        </>
      ) : null}

      {response.type ===
      "recommendation" ? (
        <div className="analyst-primary-result">
          {response.fragranceName ? (
            <>
              <small>
                {
                  response.brand
                }
              </small>
              <strong>
                {
                  response.fragranceName
                }
              </strong>
              <span>
                Wear score{" "}
                {
                  response.score
                }
              </span>
            </>
          ) : null}
          <p>
            {
              response.summary
            }
          </p>
        </div>
      ) : null}

      {response.type ===
      "neglected" ? (
        <div className="analyst-list">
          {response.items.map(
            (
              item,
              index,
            ) => (
              <article
                key={
                  item.fragranceId
                }
              >
                <span>
                  0
                  {index + 1}
                </span>
                <div>
                  <strong>
                    {
                      item.fragranceName
                    }
                  </strong>
                  <small>
                    {
                      item.brand
                    }
                  </small>
                </div>
                <b>
                  {
                    item.days
                  }
                  d
                </b>
              </article>
            ),
          )}
          {!response.items.length ? (
            <p>
              No owned fragrances could be resolved.
            </p>
          ) : null}
        </div>
      ) : null}

      {response.type ===
      "comparison" ? (
        <div className="analyst-comparison">
          {response.entities.map(
            (entity) => (
              <article
                key={
                  entity.id
                }
              >
                <small>
                  {
                    entity.subtitle
                  }
                </small>
                <strong>
                  {
                    entity.name
                  }
                </strong>
                <span>
                  {
                    entity.confidence
                  }
                  % confidence
                </span>
                <span>
                  {
                    entity.connections
                  }{" "}
                  connections
                </span>
                <b>
                  {
                    entity.collectionStatus
                  }
                </b>
              </article>
            ),
          )}
        </div>
      ) : null}

      {response.type ===
      "message" ? (
        <p className="analyst-message">
          {
            response.message
          }
        </p>
      ) : null}

      <EvidenceList
        evidence={
          response.evidence
        }
      />
    </section>
  );
}

function FactorList({
  label,
  items,
  positive = false,
}: {
  label: string;
  items: string[];
  positive?: boolean;
}) {
  return (
    <div className="analyst-factors">
      <small>
        {label}
      </small>
      {items.map(
        (item) => (
          <p
            key={
              item
            }
          >
            {positive
              ? "+"
              : "−"}{" "}
            {item}
          </p>
        ),
      )}
    </div>
  );
}

function EvidenceList({
  evidence,
}: {
  evidence:
    AnalystEvidence[];
}) {
  return (
    <div className="analyst-evidence">
      <small>
        Evidence
      </small>
      {evidence.map(
        (
          item,
          index,
        ) => (
          <article
            key={`${item.kind}:${item.label}:${index}`}
          >
            <span
              data-kind={
                item.kind
              }
            >
              {
                item.kind
              }
            </span>
            <div>
              <strong>
                {
                  item.label
                }
              </strong>
              <p>
                {
                  item.detail
                }
              </p>
            </div>
          </article>
        ),
      )}
    </div>
  );
}

function ActionPreview({
  preview,
  onConfirm,
  onCancel,
}: {
  preview:
    AnalystActionPreview;
  onConfirm: () =>
    void;
  onCancel: () =>
    void;
}) {
  return (
    <section className="analyst-action-preview">
      <header>
        <Clock3
          size={14}
        />
        <div>
          <small>
            Proposed action
          </small>
          <strong>
            {
              preview.title
            }
          </strong>
        </div>
      </header>

      <p>
        {
          preview.summary
        }
      </p>

      <div>
        {preview.expectedEffects.map(
          (effect) => (
            <span
              key={
                effect
              }
            >
              • {effect}
            </span>
          ),
        )}
      </div>

      <footer>
        <button
          type="button"
          onClick={
            onCancel
          }
        >
          <X
            size={13}
          />
          Cancel
        </button>
        <button
          type="button"
          onClick={
            onConfirm
          }
        >
          <Check
            size={13}
          />
          Confirm
        </button>
      </footer>
    </section>
  );
}

function getWorkspaceLabel(
  pathname: string,
) {
  if (
    pathname.startsWith(
      "/entity/",
    )
  ) {
    return "Entity intelligence";
  }

  const labels:
    Record<
      string,
      string
    > = {
      "/today":
        "Today's intelligence",
      "/collection":
        "Collection intelligence",
      "/discover":
        "Discovery intelligence",
      "/simulator":
        "Simulator intelligence",
      "/deal-lab":
        "Deal intelligence",
      "/timeline":
        "Timeline intelligence",
      "/market":
        "Market intelligence",
      "/entities":
        "Entity intelligence",
    };

  return (
    labels[pathname] ??
    "System-wide intelligence"
  );
}
