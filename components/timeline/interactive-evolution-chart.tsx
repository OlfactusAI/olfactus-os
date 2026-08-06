"use client";

import { useMemo, useState } from "react";

import type {
  TimelineEvent,
  TimelineMetricSnapshot,
} from "@/lib/timeline/types";

export type TimelineChartMetric =
  | "collectionHealth"
  | "rotation"
  | "diversity"
  | "seasonalBalance"
  | "redundancy"
  | "totalWears";

export type TimelineRange =
  | "7d"
  | "30d"
  | "90d"
  | "1y"
  | "all";

interface EvolutionPoint {
  timestamp: string;
  label: string;
  eventTitle: string;
  snapshot: TimelineMetricSnapshot;
}

const metricLabels: Record<
  TimelineChartMetric,
  string
> = {
  collectionHealth: "Collection Health",
  rotation: "Rotation",
  diversity: "DNA Diversity",
  seasonalBalance: "Seasonal Balance",
  redundancy: "Redundancy Control",
  totalWears: "Total Wears",
};

const metricKeys: TimelineChartMetric[] = [
  "collectionHealth",
  "rotation",
  "diversity",
  "seasonalBalance",
  "redundancy",
  "totalWears",
];

const ranges: Array<{
  value: TimelineRange;
  label: string;
}> = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "1y", label: "1Y" },
  { value: "all", label: "All" },
];

export function InteractiveEvolutionChart({
  events,
}: {
  events: TimelineEvent[];
}) {
  const [range, setRange] =
    useState<TimelineRange>("all");
  const [activeMetrics, setActiveMetrics] =
    useState<TimelineChartMetric[]>([
      "collectionHealth",
      "rotation",
      "diversity",
    ]);
  const [hoveredIndex, setHoveredIndex] =
    useState<number | null>(null);
  const [comparisonEventId, setComparisonEventId] =
    useState<string>("");

  const points = useMemo(
    () => buildEvolutionPoints(events, range),
    [events, range],
  );

  const comparison = useMemo(
    () =>
      buildComparison(
        events,
        comparisonEventId,
      ),
    [comparisonEventId, events],
  );

  function toggleMetric(
    metric: TimelineChartMetric,
  ) {
    setActiveMetrics((current) =>
      current.includes(metric)
        ? current.length === 1
          ? current
          : current.filter(
              (item) => item !== metric,
            )
        : [...current, metric].slice(-4),
    );
  }

  const hovered =
    hoveredIndex == null
      ? null
      : points[hoveredIndex] ?? null;

  return (
    <section className="interactive-evolution-chart">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="timeline-range-switch">
          {ranges.map((item) => (
            <button
              key={item.value}
              type="button"
              className={
                range === item.value
                  ? "is-active"
                  : ""
              }
              onClick={() =>
                setRange(item.value)
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="text-xs text-[var(--muted)]">
          {points.length} retained snapshots
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {metricKeys.map((metric) => (
          <button
            key={metric}
            type="button"
            className={`timeline-metric-chip ${
              activeMetrics.includes(metric)
                ? "is-active"
                : ""
            }`}
            onClick={() => toggleMetric(metric)}
          >
            {metricLabels[metric]}
          </button>
        ))}
      </div>

      <div className="timeline-svg-wrap mt-7">
        {points.length >= 2 ? (
          <svg
            viewBox="0 0 1000 390"
            role="img"
            aria-label="Interactive collection evolution chart"
            className="timeline-svg-chart"
            onMouseLeave={() =>
              setHoveredIndex(null)
            }
          >
            <defs>
              <linearGradient
                id="timelineArea"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  stopOpacity=".16"
                />
                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {[0, 1, 2, 3, 4].map((row) => {
              const y = 35 + row * 75;
              return (
                <line
                  key={row}
                  x1="54"
                  y1={y}
                  x2="970"
                  y2={y}
                  className="timeline-grid-line"
                />
              );
            })}

            {activeMetrics.map(
              (metric, metricIndex) => {
                const coordinates =
                  getCoordinates(
                    points,
                    metric,
                  );
                const path = toPath(coordinates);
                const area = `${path} L ${
                  coordinates.at(-1)?.x ?? 0
                } 350 L ${
                  coordinates[0]?.x ?? 0
                } 350 Z`;

                return (
                  <g
                    key={metric}
                    className={`timeline-series timeline-series-${metricIndex}`}
                  >
                    {metricIndex === 0 ? (
                      <path
                        d={area}
                        className="timeline-area-path"
                      />
                    ) : null}
                    <path
                      d={path}
                      className="timeline-line-path"
                    />
                    {coordinates.map(
                      (coordinate, index) => (
                        <circle
                          key={`${metric}-${index}`}
                          cx={coordinate.x}
                          cy={coordinate.y}
                          r={
                            hoveredIndex === index
                              ? 6
                              : 4
                          }
                          className="timeline-point"
                        />
                      ),
                    )}
                  </g>
                );
              },
            )}

            {points.map((point, index) => {
              const x = xPosition(
                index,
                points.length,
              );
              return (
                <g key={point.timestamp}>
                  <rect
                    x={x - 22}
                    y="20"
                    width="44"
                    height="335"
                    fill="transparent"
                    onMouseEnter={() =>
                      setHoveredIndex(index)
                    }
                  />
                  <line
                    x1={x}
                    y1="350"
                    x2={x}
                    y2="358"
                    className="timeline-axis-tick"
                  />
                  <text
                    x={x}
                    y="378"
                    textAnchor="middle"
                    className="timeline-axis-label"
                  >
                    {point.label}
                  </text>
                </g>
              );
            })}

            {hovered ? (
              <line
                x1={xPosition(
                  hoveredIndex!,
                  points.length,
                )}
                y1="25"
                x2={xPosition(
                  hoveredIndex!,
                  points.length,
                )}
                y2="350"
                className="timeline-hover-line"
              />
            ) : null}
          </svg>
        ) : (
          <div className="timeline-chart-empty">
            Continue using OLFACTUS to build
            enough longitudinal snapshots for an
            interactive trend.
          </div>
        )}

        {hovered ? (
          <div
            className="timeline-chart-tooltip"
            style={{
              left: `${Math.min(
                82,
                Math.max(
                  8,
                  (hoveredIndex! /
                    Math.max(
                      1,
                      points.length - 1,
                    )) *
                    100,
                ),
              )}%`,
            }}
          >
            <p className="text-[.54rem] font-bold uppercase tracking-[.13em] text-[var(--gold)]">
              {hovered.label}
            </p>
            <p className="mt-1 text-sm font-semibold">
              {hovered.eventTitle}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2">
              {activeMetrics.map((metric) => (
                <div key={metric}>
                  <p className="text-[.48rem] uppercase tracking-[.1em] text-[var(--muted)]">
                    {metricLabels[metric]}
                  </p>
                  <p className="mt-1 text-sm text-[var(--gold-bright)]">
                    {hovered.snapshot[metric]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-7 border-t border-[var(--border)] pt-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[.58rem] font-bold uppercase tracking-[.15em] text-[var(--gold)]">
              Before / After Event
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Measure how a major collection event
              changed the retained metrics.
            </p>
          </div>

          <select
            value={comparisonEventId}
            onChange={(event) =>
              setComparisonEventId(
                event.target.value,
              )
            }
            className="timeline-comparison-select"
          >
            <option value="">
              Select an event
            </option>
            {events
              .filter((event) =>
                [
                  "bottle_added",
                  "bottle_removed",
                  "favorite_changed",
                ].includes(event.type),
              )
              .map((event) => (
                <option
                  key={event.id}
                  value={event.id}
                >
                  {new Date(
                    event.timestamp,
                  ).toLocaleDateString()}{" "}
                  — {event.title}
                </option>
              ))}
          </select>
        </div>

        {comparison ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {(
              [
                "collectionHealth",
                "rotation",
                "diversity",
              ] as TimelineChartMetric[]
            ).map((metric) => {
              const before =
                comparison.before[metric];
              const after =
                comparison.after[metric];
              const delta = after - before;

              return (
                <div
                  key={metric}
                  className="timeline-comparison-card"
                >
                  <p className="text-[.52rem] font-bold uppercase tracking-[.12em] text-[var(--muted)]">
                    {metricLabels[metric]}
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <p className="display-serif text-3xl">
                      {before}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      →
                    </p>
                    <p className="display-serif text-3xl text-[var(--gold-bright)]">
                      {after}
                    </p>
                  </div>
                  <p
                    className={`mt-3 text-sm ${
                      delta >= 0
                        ? "text-[var(--success)]"
                        : "text-[var(--warning)]"
                    }`}
                  >
                    {delta >= 0 ? "+" : ""}
                    {delta} points
                  </p>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function buildEvolutionPoints(
  events: TimelineEvent[],
  range: TimelineRange,
): EvolutionPoint[] {
  const cutoff = rangeCutoff(range);

  return events
    .filter(
      (
        event,
      ): event is TimelineEvent & {
        snapshot: TimelineMetricSnapshot;
      } =>
        Boolean(event.snapshot) &&
        (cutoff == null ||
          new Date(
            event.timestamp,
          ).getTime() >= cutoff),
    )
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() -
        new Date(b.timestamp).getTime(),
    )
    .slice(-24)
    .map((event) => ({
      timestamp: event.timestamp,
      label: new Date(
        event.timestamp,
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      eventTitle: event.title,
      snapshot: event.snapshot,
    }));
}

function buildComparison(
  events: TimelineEvent[],
  eventId: string,
) {
  if (!eventId) return null;

  const ordered = [...events].sort(
    (a, b) =>
      new Date(a.timestamp).getTime() -
      new Date(b.timestamp).getTime(),
  );
  const eventIndex = ordered.findIndex(
    (event) => event.id === eventId,
  );
  if (eventIndex < 0) return null;

  const before = [...ordered]
    .slice(0, eventIndex + 1)
    .reverse()
    .find((event) => event.snapshot)?.snapshot;

  const after = ordered
    .slice(eventIndex + 1)
    .find((event) => event.snapshot)?.snapshot;

  if (!before || !after) return null;

  return { before, after };
}

function getCoordinates(
  points: EvolutionPoint[],
  metric: TimelineChartMetric,
) {
  const values = points.map(
    (point) => point.snapshot[metric],
  );
  const max =
    metric === "totalWears"
      ? Math.max(...values, 1)
      : 100;

  return points.map((point, index) => ({
    x: xPosition(index, points.length),
    y:
      350 -
      (point.snapshot[metric] / max) * 300,
  }));
}

function xPosition(
  index: number,
  length: number,
) {
  if (length <= 1) return 512;
  return 54 + (index / (length - 1)) * 916;
}

function toPath(
  coordinates: Array<{
    x: number;
    y: number;
  }>,
) {
  return coordinates
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${
          point.x
        } ${point.y}`,
    )
    .join(" ");
}

function rangeCutoff(
  range: TimelineRange,
) {
  if (range === "all") return null;

  const days = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "1y": 365,
  }[range];

  return Date.now() - days * 86_400_000;
}
