"use client";

import { BrainCircuit, RotateCcw, Save, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";
import { useCollection } from "@/components/providers/collection-provider";
import { useMemoryEngine } from "@/components/providers/memory-provider";
import { simulatePredictiveAddition } from "@/lib/predictive/simulator-engine";
import {
  clearPredictiveScenario,
  readPredictiveScenario,
  writePredictiveScenario,
} from "@/lib/predictive/simulator-store";
import type { ProjectionHorizon } from "@/lib/predictive/simulator-types";

const horizons: Array<{ value: ProjectionHorizon; label: string }> = [
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
  { value: 180, label: "6 months" },
  { value: 365, label: "1 year" },
];

export function PredictiveSimulator() {
  const { catalog } = useActiveFragranceCatalog();
  const { items, analysis, hydrated: collectionHydrated } = useCollection();
  const { events, hydrated: memoryHydrated, record } = useMemoryEngine();

  const candidates = useMemo(() => {
    const owned = new Set(items.map((item) => item.fragranceId));
    return catalog
      .filter((fragrance) => !owned.has(fragrance.id))
      .sort((a, b) =>
        `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`),
      );
  }, [catalog, items]);

  const [fragranceId, setFragranceId] = useState("");
  const [horizonDays, setHorizonDays] =
    useState<ProjectionHorizon>(180);
  const [clientReady, setClientReady] = useState(false);

  useEffect(() => {
    const saved = readPredictiveScenario();
    if (
      saved &&
      candidates.some((candidate) => candidate.id === saved.fragranceId)
    ) {
      setFragranceId(saved.fragranceId);
      setHorizonDays(saved.horizonDays);
    } else if (candidates[0]) {
      setFragranceId(candidates[0].id);
    }
    setClientReady(true);
  }, [candidates]);

  const result = useMemo(
    () =>
      fragranceId
        ? simulatePredictiveAddition({
            fragranceId,
            horizonDays,
            collection: items,
            catalog,
            events,
            currentHealth: analysis.score,
          })
        : null,
    [fragranceId, horizonDays, items, catalog, events, analysis.score],
  );

  if (!clientReady || !collectionHydrated || !memoryHydrated) {
    return (
      <section className="layer3-panel mt-6">
        <p className="layer3-kicker">Predictive Simulator</p>
        <h2 className="display-serif mt-3 text-4xl">
          Calibrating future collection state…
        </h2>
      </section>
    );
  }

  if (!result) {
    return (
      <section className="layer3-panel mt-6">
        <p className="layer3-kicker">Predictive Simulator</p>
        <div className="predictive-empty mt-5">
          No unowned fragrance is currently available to simulate.
        </div>
      </section>
    );
  }

  const metrics = result.metrics;

  function saveScenario() {
    writePredictiveScenario({ fragranceId, horizonDays });
    record({
      type: "simulation-created",
      source: "simulator",
      entity: {
        type: "fragrance",
        id: fragranceId,
        label: result.fragranceName,
      },
      confidence: metrics.confidence,
      metadata: {
        horizonDays,
        verdict: result.verdict,
        neglectRisk: metrics.neglectRisk,
        signaturePotential: metrics.signaturePotential,
      },
    });
  }

  function resetScenario() {
    clearPredictiveScenario();
    setHorizonDays(180);
    if (candidates[0]) setFragranceId(candidates[0].id);
  }

  return (
    <section className="predictive-simulator mt-6">
      <div className="predictive-simulator-header">
        <div>
          <p className="layer3-kicker">
            Neural Collection Simulator · Predictive Mode
          </p>
          <h2 className="display-serif mt-3 text-5xl">
            What happens after the excitement fades?
          </h2>
          <p>
            Immediate collection impact plus a forward-looking forecast using
            Memory, preference affinity, overlap, rotation, and taste drift.
          </p>
        </div>
        <BrainCircuit size={46} />
      </div>

      <div className="predictive-simulator-controls mt-5">
        <label>
          <span>Simulate fragrance</span>
          <select
            value={fragranceId}
            onChange={(event) => setFragranceId(event.target.value)}
          >
            {candidates.map((fragrance) => (
              <option key={fragrance.id} value={fragrance.id}>
                {fragrance.brand} — {fragrance.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span>Projection horizon</span>
          <div className="predictive-horizon-buttons">
            {horizons.map((horizon) => (
              <button
                type="button"
                key={horizon.value}
                data-active={horizonDays === horizon.value}
                onClick={() => setHorizonDays(horizon.value)}
              >
                {horizon.label}
              </button>
            ))}
          </div>
        </div>

        <div className="predictive-scenario-actions">
          <button type="button" onClick={saveScenario}>
            <Save size={13} />
            Save
          </button>
          <button type="button" onClick={resetScenario}>
            <RotateCcw size={13} />
            Reset
          </button>
        </div>
      </div>

      <div className="predictive-simulator-hero mt-5">
        <div>
          <small>{result.brand}</small>
          <h3 className="display-serif">{result.fragranceName}</h3>
          <span>{horizonDays}-day projection</span>
        </div>
        <aside>
          <small>Predicted verdict</small>
          <strong>{result.verdict}</strong>
          <p>{result.summary}</p>
        </aside>
      </div>

      <div className="predictive-simulator-score-grid mt-5">
        <Score
          label="Collection Health"
          value={`${metrics.currentHealth} → ${metrics.immediateHealth}`}
          note={`${metrics.projectedHealthLow}–${metrics.projectedHealthHigh} forecast`}
        />
        <Score
          label="Redundancy"
          value={`+${metrics.redundancyDelta}%`}
          note="Immediate overlap pressure"
        />
        <Score
          label="Wear Frequency"
          value={`${metrics.estimatedWearsPerMonth}/mo`}
          note="Estimated future rotation"
        />
        <Score
          label="Signature Potential"
          value={`${metrics.signaturePotential}%`}
          note="Long-term signature signal"
        />
        <Score
          label="Neglect Risk"
          value={`${metrics.neglectRisk}%`}
          note="Future inactivity pressure"
        />
        <Score
          label="Retention"
          value={`${metrics.retentionProbability}%`}
          note={`${metrics.confidence}% model confidence`}
        />
      </div>

      <div className="predictive-simulator-bottom mt-5">
        <article>
          <p className="layer3-kicker">Collection Impact</p>
          <div className="predictive-impact-grid mt-4">
            <Impact label="Diversity" value={metrics.diversityDelta} />
            <Impact label="Role coverage" value={metrics.roleCoverageDelta} />
            <Impact label="Confidence" value={metrics.confidence} />
          </div>
        </article>

        <article>
          <p className="layer3-kicker">Prediction Evidence</p>
          <div className="predictive-evidence-list mt-4">
            {result.evidence.map((evidence, index) => (
              <div key={`${evidence.kind}:${evidence.label}:${index}`}>
                <span data-kind={evidence.kind}>{evidence.kind}</span>
                <div>
                  <strong>{evidence.label}</strong>
                  <p>{evidence.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <div className="predictive-guardrail mt-5">
        <ShieldCheck size={14} />
        <p>
          <strong>Predictive guardrail:</strong> this scenario never changes
          the real collection. Sparse Memory evidence lowers confidence and
          longer horizons widen uncertainty.
        </p>
      </div>
    </section>
  );
}

function Score({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article>
      <small>{label}</small>
      <strong>{value}</strong>
      <span>{note}</span>
    </article>
  );
}

function Impact({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <small>{label}</small>
      <strong>
        {label !== "Confidence" && value >= 0 ? "+" : ""}
        {value}%
      </strong>
    </div>
  );
}
