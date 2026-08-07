"use client";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Beaker,
  CheckCircle2,
  FolderOpen,
  Gauge,
  Plus,
  Radar,
  Sparkles,
  RefreshCcw,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useCollection,
} from "@/components/providers/collection-provider";
import {
  useMemoryEngine,
} from "@/components/providers/memory-provider";
import {
  useCollectorIntelligence,
} from "@/components/providers/collector-intelligence-provider";
import {
  demoProfile,
} from "@/lib/data/demo";
import {
  simulateCollectionScenario,
  type SimulationStep,
} from "@/lib/intelligence/multi-step-simulator";
import {
  forecastSimulationScenario,
  type ForecastHorizonDays,
} from "@/lib/predictive/simulator-forecast";
import type {
  SimulationAction,
} from "@/lib/intelligence/neural-collection-simulator";
import {
  appendTimelineEvent,
} from "@/lib/timeline/event-ledger";
import {
  deleteSimulationScenario,
  loadSimulationScenarios,
  saveSimulationScenario,
  type StoredSimulationScenario,
} from "@/lib/simulator/scenario-storage";

export default function SimulatorPage() {
  const {
    owned,
    available,
    applyCollectionTransaction,
    undoLastTransaction,
  } = useCollection();
  const {
    api,
    state:
      collectorState,
  } =
    useCollectorIntelligence();
  const items =
    collectorState.collection;
  const catalog =
    api.getCatalogContext();
  const {
    events:
      memoryEvents,
    record:
      recordMemory,
  } =
    useMemoryEngine();

  const [
    action,
    setAction,
  ] =
    useState<SimulationAction>(
      "add",
    );
  const [
    candidateId,
    setCandidateId,
  ] = useState(
    available[0]?.id ??
      catalog[0]?.id ??
      "",
  );
  const [
    replaceId,
    setReplaceId,
  ] = useState(
    owned[0]?.fragrance
      .id ?? "",
  );
  const [
    steps,
    setSteps,
  ] =
    useState<SimulationStep[]>(
      [],
    );
  const [
    scenarioName,
    setScenarioName,
  ] = useState(
    "Next collection move",
  );
  const [
    saved,
    setSaved,
  ] = useState<
    StoredSimulationScenario[]
  >([]);
  const [
    applied,
    setApplied,
  ] = useState(false);
  const [
    forecastHorizon,
    setForecastHorizon,
  ] =
    useState<ForecastHorizonDays>(
      180,
    );

  useEffect(() => {
    setSaved(
      loadSimulationScenarios(),
    );
  }, []);

  const options =
    action === "remove"
      ? owned.map(
          (item) =>
            item.fragrance,
        )
      : available.length
        ? available
        : catalog;

  const effectiveCandidate =
    options.some(
      (fragrance) =>
        fragrance.id ===
        candidateId,
    )
      ? candidateId
      : options[0]?.id ??
        "";

  const result =
    useMemo(() => {
      if (!steps.length) {
        return null;
      }

      try {
        return simulateCollectionScenario({
          steps,
          collection:
            items,
          catalog,
          profile:
            demoProfile,
        });
      } catch {
        return null;
      }
    }, [
      catalog,
      items,
      steps,
    ]);

  const predictiveForecast =
    useMemo(() => {
      if (!result) {
        return null;
      }

      try {
        return forecastSimulationScenario({
          scenario:
            result,
          currentCollection:
            items,
          catalog,
          profile:
            demoProfile,
          events:
            memoryEvents,
          horizonDays:
            forecastHorizon,
        });
      } catch {
        return null;
      }
    }, [
      result,
      items,
      catalog,
      memoryEvents,
      forecastHorizon,
    ]);

  function addStep() {
    if (
      !effectiveCandidate
    ) {
      return;
    }

    setSteps(
      (current) => [
        ...current,
        {
          id:
            `step-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 7)}`,
          action,
          candidateId:
            effectiveCandidate,
          replaceId:
            action ===
            "replace"
              ? replaceId
              : undefined,
        },
      ],
    );
    setApplied(false);
  }

  function moveStep(
    index: number,
    direction:
      | -1
      | 1,
  ) {
    setSteps(
      (current) => {
        const target =
          index + direction;
        if (
          target < 0 ||
          target >=
            current.length
        ) {
          return current;
        }

        const next =
          [...current];
        [
          next[index],
          next[target],
        ] = [
          next[target],
          next[index],
        ];
        return next;
      },
    );
  }

  function applyScenario() {
    if (!result) return;

    applyCollectionTransaction({
      title: scenarioName,
      summary: `${steps.length} simulator action${steps.length === 1 ? "" : "s"} applied as one recoverable transaction.`,
      nextItems: result.projectedCollection,
      metadata: {
        actionCount: steps.length,
        healthDelta: result.aggregate.healthDelta,
        valueDelta: result.aggregate.valueDelta,
      },
    });

    appendTimelineEvent({
      type: "simulation_applied",
      title: "Simulation scenario applied",
      summary: `${steps.length} simulated action${steps.length === 1 ? "" : "s"} applied from “${scenarioName}.”`,
      metadata: {
        actionCount: steps.length,
        healthDelta: result.aggregate.healthDelta,
        valueDelta: result.aggregate.valueDelta,
      },
    });

    recordMemory({
      type:
        "simulation-applied",
      source:
        "simulator",
      confidence: 100,
      entity: {
        type:
          "collection",
        id:
          "active-collection",
        label:
          scenarioName,
      },
      metadata: {
        actionCount:
          steps.length,
        healthDelta:
          result.aggregate
            .healthDelta,
        valueDelta:
          result.aggregate
            .valueDelta,
        forecastHorizon:
          predictiveForecast
            ?.horizonDays,
        forecastHealth:
          predictiveForecast
            ?.health.forecast,
      },
    });

    setApplied(true);
  }

  function rollbackScenario() {
    const restored = undoLastTransaction();
    if (restored) setApplied(false);
  }

  function saveScenario() {
    if (!steps.length) {
      return;
    }

    const now =
      new Date().toISOString();
    const scenario:
      StoredSimulationScenario = {
        id:
          `scenario-${Date.now()}`,
        name:
          scenarioName.trim() ||
          "Untitled scenario",
        actions:
          steps.map(
            (step) => ({
              ...step,
            }),
          ),
        createdAt: now,
        updatedAt: now,
      };

    setSaved(
      saveSimulationScenario(
        scenario,
      ),
    );

    recordMemory({
      type:
        "simulation-created",
      source:
        "simulator",
      confidence: 100,
      entity: {
        type:
          "collection",
        id:
          scenario.id,
        label:
          scenario.name,
      },
      metadata: {
        actionCount:
          scenario.actions
            .length,
        forecastHorizon:
          predictiveForecast
            ?.horizonDays,
        forecastHealth:
          predictiveForecast
            ?.health.forecast,
        forecastConfidence:
          predictiveForecast
            ?.confidence,
      },
    });
  }

  function loadScenario(
    scenario:
      StoredSimulationScenario,
  ) {
    setScenarioName(
      scenario.name,
    );
    setSteps(
      scenario.actions.map(
        (step) => ({
          ...step,
        }),
      ),
    );
    setApplied(false);
  }

  return (
    <div className="pb-12">
      <section className="layer3-hero">
        <div>
          <p className="layer3-kicker">
            Neural Collection Simulator
          </p>
          <h1 className="display-serif mt-4 text-[clamp(3.8rem,7vw,7rem)] leading-[.88]">
            Ask the collection
            <br />
            <span className="text-[var(--gold-bright)]">
              what happens next.
            </span>
          </h1>
          <p className="mt-6 max-w-3xl text-[var(--muted)]">
            Build, reorder, save, and apply multi-step scenarios without changing the real collection until you confirm. Predictive Intelligence now estimates whether the simulated improvement is likely to last.
          </p>
        </div>
        <Beaker
          size={54}
          className="text-[var(--gold)]"
        />
      </section>

      <section className="mt-7 grid gap-5 xl:grid-cols-[.68fr_1.32fr]">
        <article className="layer3-panel">
          <p className="layer3-kicker">
            Scenario Builder
          </p>

          <label className="layer3-field mt-5">
            <span>
              Scenario name
            </span>
            <input
              value={
                scenarioName
              }
              onChange={(
                event,
              ) =>
                setScenarioName(
                  event.target
                    .value,
                )
              }
            />
          </label>

          <div className="mt-5 grid grid-cols-3 gap-2">
            {(
              [
                "add",
                "remove",
                "replace",
              ] as SimulationAction[]
            ).map(
              (value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setAction(
                      value,
                    );
                    setApplied(
                      false,
                    );
                  }}
                  className={`layer3-choice ${
                    action ===
                    value
                      ? "is-active"
                      : ""
                  }`}
                >
                  {value ===
                  "add" ? (
                    <Plus
                      size={14}
                    />
                  ) : value ===
                    "remove" ? (
                    <Trash2
                      size={14}
                    />
                  ) : (
                    <RefreshCcw
                      size={14}
                    />
                  )}
                  {value}
                </button>
              ),
            )}
          </div>

          <label className="layer3-field mt-5">
            <span>
              Fragrance
            </span>
            <select
              value={
                effectiveCandidate
              }
              onChange={(
                event,
              ) => {
                setCandidateId(
                  event.target
                    .value,
                );
                setApplied(
                  false,
                );
              }}
            >
              {options.map(
                (fragrance) => (
                  <option
                    key={
                      fragrance.id
                    }
                    value={
                      fragrance.id
                    }
                  >
                    {
                      fragrance.brand
                    }{" "}
                    —{" "}
                    {
                      fragrance.name
                    }
                  </option>
                ),
              )}
            </select>
          </label>

          {action ===
          "replace" ? (
            <label className="layer3-field mt-4">
              <span>
                Replace
              </span>
              <select
                value={
                  replaceId
                }
                onChange={(
                  event,
                ) =>
                  setReplaceId(
                    event.target
                      .value,
                  )
                }
              >
                {owned.map(
                  (item) => (
                    <option
                      key={
                        item
                          .fragrance
                          .id
                      }
                      value={
                        item
                          .fragrance
                          .id
                      }
                    >
                      {
                        item
                          .fragrance
                          .brand
                      }{" "}
                      —{" "}
                      {
                        item
                          .fragrance
                          .name
                      }
                    </option>
                  ),
                )}
              </select>
            </label>
          ) : null}

          <button
            type="button"
            className="layer3-apply mt-5"
            onClick={addStep}
            disabled={
              !effectiveCandidate
            }
          >
            Add action
            <ArrowRight
              size={15}
            />
          </button>

          <div className="mt-6 space-y-2">
            {steps.map(
              (step, index) => {
                const candidate =
                  catalog.find(
                    (item) =>
                      item.id ===
                      step.candidateId,
                  );
                const replaced =
                  step.replaceId
                    ? catalog.find(
                        (item) =>
                          item.id ===
                          step.replaceId,
                      )
                    : null;

                return (
                  <div
                    key={step.id}
                    className="layer3-step"
                  >
                    <span>
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="capitalize">
                        {
                          step.action
                        }
                      </strong>
                      <p>
                        {
                          candidate?.brand
                        }{" "}
                        {
                          candidate?.name
                        }
                        {replaced
                          ? ` replacing ${replaced.name}`
                          : ""}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        moveStep(
                          index,
                          -1,
                        )
                      }
                      disabled={
                        index === 0
                      }
                    >
                      <ArrowUp
                        size={13}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        moveStep(
                          index,
                          1,
                        )
                      }
                      disabled={
                        index ===
                        steps.length -
                          1
                      }
                    >
                      <ArrowDown
                        size={13}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSteps(
                          (
                            current,
                          ) =>
                            current.filter(
                              (
                                item,
                              ) =>
                                item.id !==
                                step.id,
                            ),
                        )
                      }
                    >
                      <Trash2
                        size={13}
                      />
                    </button>
                  </div>
                );
              },
            )}

            {!steps.length ? (
              <p className="text-sm text-[var(--muted)]">
                Add an action to begin the scenario.
              </p>
            ) : null}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="layer3-secondary"
              onClick={
                saveScenario
              }
              disabled={
                !steps.length
              }
            >
              <Save size={14} />
              Save
            </button>
            <button
              type="button"
              className="layer3-secondary"
              onClick={() => {
                setSteps([]);
                setApplied(
                  false,
                );
              }}
            >
              <Undo2
                size={14}
              />
              Reset
            </button>
          </div>
        </article>

        <article className="layer3-panel">
          <p className="layer3-kicker">
            Current vs Simulated
          </p>

          {result ? (
            <>
              <div className="mt-5 overflow-x-auto">
                <table className="layer3-compare-table">
                  <thead>
                    <tr>
                      <th>
                        Metric
                      </th>
                      <th>
                        Current
                      </th>
                      <th>
                        Simulated
                      </th>
                      <th>
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(
                      result.steps.at(
                        -1,
                      )?.result
                        .metrics ??
                        {},
                    ).map(
                      ([
                        key,
                        metric,
                      ]) => (
                        <tr key={key}>
                          <td>
                            {key.replace(
                              /([A-Z])/g,
                              " $1",
                            )}
                          </td>
                          <td>
                            {key ===
                            "value"
                              ? `$${metric.current}`
                              : metric.current}
                          </td>
                          <td>
                            {key ===
                            "value"
                              ? `$${metric.projected}`
                              : metric.projected}
                          </td>
                          <td
                            className={
                              metric.delta >=
                              0
                                ? "is-positive"
                                : "is-negative"
                            }
                          >
                            {metric.delta >=
                            0
                              ? "+"
                              : ""}
                            {
                              metric.delta
                            }
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                <div className="layer3-callout">
                  <strong>
                    {
                      result.risk
                        .label
                    }{" "}
                    aggregate risk ·{" "}
                    {
                      result.risk
                        .score
                    }
                    /100
                  </strong>
                  <p>
                    Risk is averaged across all actions and inherits readiness safeguards.
                  </p>
                </div>
                <div className="layer3-callout">
                  <strong>
                    {
                      result.steps
                        .length
                    }{" "}
                    action
                    {result.steps
                      .length === 1
                      ? ""
                      : "s"}
                  </strong>
                  <p>
                    Projected collection:{" "}
                    {
                      result
                        .projectedCollection
                        .length
                    }{" "}
                    bottles.
                  </p>
                </div>
              </div>

              <section className="predictive-simulator mt-6">
                <div className="predictive-simulator-heading">
                  <div>
                    <p className="layer3-kicker">
                      Predictive Simulator
                    </p>
                    <h3 className="display-serif mt-2 text-3xl">
                      What happens after the novelty fades?
                    </h3>
                  </div>
                  <Radar
                    size={26}
                  />
                </div>

                <div className="predictive-horizon-picker mt-4">
                  {(
                    [
                      90,
                      180,
                      365,
                    ] as ForecastHorizonDays[]
                  ).map(
                    (days) => (
                      <button
                        key={
                          days
                        }
                        type="button"
                        className={
                          forecastHorizon ===
                          days
                            ? "is-active"
                            : ""
                        }
                        onClick={() =>
                          setForecastHorizon(
                            days,
                          )
                        }
                      >
                        {days ===
                        90
                          ? "90 days"
                          : days ===
                              180
                            ? "6 months"
                            : "1 year"}
                      </button>
                    ),
                  )}
                </div>

                {predictiveForecast ? (
                  <>
                    <div className="predictive-simulator-metrics mt-4">
                      <article>
                        <small>
                          Immediate health
                        </small>
                        <strong>
                          {
                            predictiveForecast
                              .health
                              .immediate
                          }
                        </strong>
                      </article>
                      <article>
                        <small>
                          Forecast health
                        </small>
                        <strong>
                          {
                            predictiveForecast
                              .health
                              .forecast
                          }
                        </strong>
                        <span>
                          {
                            predictiveForecast
                              .health.low
                          }
                          –
                          {
                            predictiveForecast
                              .health.high
                          }{" "}
                          range
                        </span>
                      </article>
                      <article>
                        <small>
                          Active rotation
                        </small>
                        <strong>
                          {
                            predictiveForecast
                              .projectedActiveRotation
                          }
                        </strong>
                        <span>
                          of{" "}
                          {
                            result
                              .projectedCollection
                              .length
                          }{" "}
                          bottles
                        </span>
                      </article>
                      <article>
                        <small>
                          Forecast confidence
                        </small>
                        <strong>
                          {
                            predictiveForecast
                              .confidence
                          }
                          %
                        </strong>
                        <span>
                          {
                            predictiveForecast
                              .evidenceEvents
                          }{" "}
                          predictive events
                        </span>
                      </article>
                    </div>

                    <div className="predictive-verdict mt-4">
                      <Sparkles
                        size={16}
                      />
                      <div>
                        <small>
                          OLFACTUS Forecast
                        </small>
                        <strong>
                          {
                            predictiveForecast
                              .verdict
                          }
                        </strong>
                        <p>
                          Health trend:{" "}
                          {
                            predictiveForecast
                              .health.trend
                          }{" "}
                          ·{" "}
                          {
                            predictiveForecast
                              .projectedNeglected
                          }{" "}
                          projected neglected ·{" "}
                          {
                            predictiveForecast
                              .projectedHighRisk
                          }{" "}
                          high-risk bottles
                        </p>
                      </div>
                    </div>

                    {predictiveForecast
                      .candidateForecasts
                      .some(
                        (candidate) =>
                          candidate.action !==
                          "remove",
                      ) ? (
                      <div className="predictive-candidate-grid mt-4">
                        {predictiveForecast
                          .candidateForecasts
                          .filter(
                            (candidate) =>
                              candidate.action !==
                              "remove",
                          )
                          .map(
                            (candidate) => (
                              <article
                                key={`${candidate.action}:${candidate.fragranceId}`}
                              >
                                <header>
                                  <div>
                                    <small>
                                      {
                                        candidate.brand
                                      }
                                    </small>
                                    <strong>
                                      {
                                        candidate.fragranceName
                                      }
                                    </strong>
                                  </div>
                                  <span>
                                    {
                                      candidate.confidence
                                    }
                                    % confidence
                                  </span>
                                </header>

                                <div>
                                  <ForecastStat
                                    label="Est. wears / month"
                                    value={
                                      candidate.estimatedWearsPerMonth ??
                                      "—"
                                    }
                                  />
                                  <ForecastStat
                                    label="Retention"
                                    value={
                                      candidate.retentionProbability !==
                                      undefined
                                        ? `${candidate.retentionProbability}%`
                                        : "—"
                                    }
                                  />
                                  <ForecastStat
                                    label="Neglect risk"
                                    value={
                                      candidate.neglectProbability !==
                                      undefined
                                        ? `${candidate.neglectProbability}%`
                                        : "—"
                                    }
                                  />
                                  <ForecastStat
                                    label="Signature"
                                    value={
                                      candidate.signaturePotential !==
                                      undefined
                                        ? `${candidate.signaturePotential}%`
                                        : "—"
                                    }
                                  />
                                </div>
                              </article>
                            ),
                          )}
                      </div>
                    ) : null}

                    <div className="predictive-reason-grid mt-4">
                      <article>
                        <small>
                          Why
                        </small>
                        {predictiveForecast
                          .reasons
                          .map(
                            (reason) => (
                              <p
                                key={
                                  reason
                                }
                              >
                                +{" "}
                                {
                                  reason
                                }
                              </p>
                            ),
                          )}
                      </article>
                      <article>
                        <small>
                          Uncertainty
                        </small>
                        {predictiveForecast
                          .limitations
                          .map(
                            (limitation) => (
                              <p
                                key={
                                  limitation
                                }
                              >
                                •{" "}
                                {
                                  limitation
                                }
                              </p>
                            ),
                          )}
                      </article>
                    </div>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-[var(--muted)]">
                    Predictive forecasting is unavailable for this scenario.
                  </p>
                )}
              </section>

              <button
                type="button"
                className="layer3-apply mt-6"
                onClick={
                  applyScenario
                }
              >
                {applied ? (
                  <>
                    <CheckCircle2
                      size={15}
                    />
                    Applied
                  </>
                ) : (
                  <>
                    Apply complete scenario
                    <ArrowRight
                      size={15}
                    />
                  </>
                )}
              </button>
              {applied ? (
                <button
                  type="button"
                  className="layer3-secondary mt-3"
                  onClick={rollbackScenario}
                >
                  <Undo2 size={14} />
                  Undo applied scenario
                </button>
              ) : null}
            </>
          ) : (
            <p className="mt-6 text-[var(--muted)]">
              Add one or more actions to compare the projected collection.
            </p>
          )}

          <div className="mt-8 border-t border-[var(--border)] pt-6">
            <div className="flex items-center gap-2">
              <FolderOpen
                size={16}
                className="text-[var(--gold)]"
              />
              <p className="layer3-kicker">
                Saved Scenarios
              </p>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {saved.map(
                (scenario) => (
                  <div
                    key={
                      scenario.id
                    }
                    className="layer3-saved"
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() =>
                        loadScenario(
                          scenario,
                        )
                      }
                    >
                      <strong>
                        {
                          scenario.name
                        }
                      </strong>
                      <small>
                        {
                          scenario
                            .actions
                            .length
                        }{" "}
                        action
                        {scenario
                          .actions
                          .length ===
                        1
                          ? ""
                          : "s"}
                      </small>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSaved(
                          deleteSimulationScenario(
                            scenario.id,
                          ),
                        )
                      }
                    >
                      <Trash2
                        size={13}
                      />
                    </button>
                  </div>
                ),
              )}

              {!saved.length ? (
                <p className="text-sm text-[var(--muted)]">
                  Saved scenarios will appear here.
                </p>
              ) : null}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}


function ForecastStat({
  label,
  value,
}: {
  label: string;
  value:
    string | number;
}) {
  return (
    <div>
      <small>
        {label}
      </small>
      <strong>
        {value}
      </strong>
    </div>
  );
}
