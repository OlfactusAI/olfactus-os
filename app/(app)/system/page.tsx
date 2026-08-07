"use client";

import { useCollectorIntelligence } from "@/components/providers/collector-intelligence-provider";

import { Download, RefreshCcw, RotateCcw, ShieldCheck, Upload, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCollection } from "@/components/providers/collection-provider";
import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";
import {
  collectEntityDiagnostics,
  measureEntityRegistryBuildTime,
} from "@/lib/system/entity-diagnostics";
import { readIntelligenceEvents } from "@/lib/intelligence-everywhere/events";
import { readMemoryInsights } from "@/lib/intelligence-everywhere/memory";
import { collectSystemDiagnostics } from "@/lib/system/diagnostics";
import {
  clearOlfactusCaches,
  downloadOlfactusBackup,
  restoreOlfactusBackup,
} from "@/lib/system/backup";
import { olfactusSystemManifest } from "@/lib/os/system-manifest";
import { readRecoveryLedger } from "@/lib/recovery/action-ledger";

export default function SystemPage() {
  const { api: collectorIntelligenceApi } = useCollectorIntelligence();
  const globalGraphMetrics = collectorIntelligenceApi.getGlobalGraphMetrics();

  const { undoLastTransaction, redoLastTransaction } = useCollection();
  const { catalog } = useActiveFragranceCatalog();
  const [hydrated, setHydrated] = useState(false);
  const entityDiagnostics = collectEntityDiagnostics(catalog);
  const [
    registryBuildTimeMs,
    setRegistryBuildTimeMs,
  ] =
    useState<number | null>(
      null,
    );
  const intelligenceEventCount =
    hydrated
      ? readIntelligenceEvents().length
      : 0;
  const memoryInsightCount =
    hydrated
      ? readMemoryInsights().length
      : 0;
  const [diagnostics, setDiagnostics] = useState({
    version: olfactusSystemManifest.version,
    release: olfactusSystemManifest.release,
    engineCount: olfactusSystemManifest.engines.length,
    importedCount: 0,
    timelineEvents: 0,
    savedScenarios: 0,
    localStorage: {
      bytes: 0,
      kilobytes: 0,
      keys: 0,
    },
    readiness: {
      ready: 0,
      partial: 0,
      "search-only": 0,
      blocked: 0,
    },
    undoCount: 0,
    redoCount: 0,
  });
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const refresh = () => setDiagnostics(collectSystemDiagnostics());

  useEffect(() => {
    setDiagnostics(
      collectSystemDiagnostics(),
    );
    setHydrated(true);

    const update = () =>
      setDiagnostics(
        collectSystemDiagnostics(),
      );

    window.addEventListener(
      "olfactus:recovery-updated",
      update,
    );
    window.addEventListener(
      "olfactus:timeline-updated",
      update,
    );
    window.addEventListener(
      "olfactus:active-catalog-refresh",
      update,
    );

    return () => {
      window.removeEventListener(
        "olfactus:recovery-updated",
        update,
      );
      window.removeEventListener(
        "olfactus:timeline-updated",
        update,
      );
      window.removeEventListener(
        "olfactus:active-catalog-refresh",
        update,
      );
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    setRegistryBuildTimeMs(
      measureEntityRegistryBuildTime(
        catalog,
      ),
    );
  }, [
    catalog,
    hydrated,
  ]);

  async function restore(file: File) {
    try {
      const value = JSON.parse(await file.text());
      const count = restoreOlfactusBackup(value);
      setMessage(`Restored ${count} local data areas. Refreshing…`);
      window.setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Restore failed.");
    }
  }

  const cards = [
    ["Version", diagnostics.version],
    ["Engines", diagnostics.engineCount],
    ["Imported records", diagnostics.importedCount],
    ["Timeline events", diagnostics.timelineEvents],
    ["Saved scenarios", diagnostics.savedScenarios],
    ["Storage", `${diagnostics.localStorage.kilobytes} KB`],
    ["Undo available", diagnostics.undoCount],
    ["Redo available", diagnostics.redoCount],
  ];

  return (
    <div className="pb-12">
      <section className="layer3-hero">
        <div>
          <p className="layer3-kicker">System Intelligence</p>
          <h1 className="display-serif mt-4 text-[clamp(3.8rem,7vw,7rem)] leading-[.88]">
            Recovery, diagnostics
            <br />
            <span className="text-[var(--gold-bright)]">and control.</span>
          </h1>
          <p className="mt-6 max-w-3xl text-[var(--muted)]">
            Inspect local data, reverse collection transactions, export a complete backup, and restore OLFACTUS safely.
          </p>
        </div>
        <Wrench size={52} className="text-[var(--gold)]" />
      </section>

      <section className="system-metric-grid mt-7">
        {cards.map(([label, value]) => (
          <article key={String(label)} className="layer3-panel">
            <small>{label}</small>
            <strong>
              {hydrated ? value : "—"}
            </strong>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-2">
        <article className="layer3-panel">
          <p className="layer3-kicker">Recovery Ledger</p>
          <h2 className="display-serif mt-3 text-4xl">Undo without fear.</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button className="layer3-apply" onClick={() => { undoLastTransaction(); refresh(); }}>
              <RotateCcw size={15} /> Undo
            </button>
            <button className="layer3-secondary" onClick={() => { redoLastTransaction(); refresh(); }}>
              <RefreshCcw size={15} /> Redo
            </button>
          </div>
          <div className="mt-5 space-y-2">
            {(hydrated
              ? readRecoveryLedger().past
              : []
            ).slice().reverse().slice(0, 8).map((action) => (
              <div className="system-action-row" key={action.id}>
                <ShieldCheck size={14} />
                <div><strong>{action.title}</strong><small>{action.summary}</small></div>
              </div>
            ))}
          </div>
        </article>

        <article className="layer3-panel">
          <p className="layer3-kicker">Backup & Restore</p>
          <h2 className="display-serif mt-3 text-4xl">Own your data.</h2>
          <div className="mt-5 grid gap-3">
            <button className="layer3-apply" onClick={() => downloadOlfactusBackup(olfactusSystemManifest.version)}>
              <Download size={15} /> Export OLFACTUS backup
            </button>
            <button className="layer3-secondary" onClick={() => fileRef.current?.click()}>
              <Upload size={15} /> Restore backup
            </button>
            <input
              ref={fileRef}
              className="hidden"
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void restore(file);
              }}
            />
            <button className="layer3-secondary" onClick={() => { clearOlfactusCaches(); setMessage("Caches cleared while preserving OLFACTUS data."); }}>
              <RefreshCcw size={15} /> Clear local caches
            </button>
          </div>
          {message ? <p className="mt-4 text-sm text-[var(--muted)]">{message}</p> : null}
        </article>
      </section>




      <section className="layer3-panel mt-6">
        <p className="layer3-kicker">
          Live Intelligence Integration
        </p>
        <div className="system-metric-grid mt-5">
          <article>
            <small>
              Dashboard selectors
            </small>
            <strong>
              Active
            </strong>
          </article>
          <article>
            <small>
              Demo values
            </small>
            <strong>
              Removed
            </strong>
          </article>
          <article>
            <small>
              Event synchronization
            </small>
            <strong>
              Active
            </strong>
          </article>
          <article>
            <small>
              Dashboard preferences
            </small>
            <strong>
              Local
            </strong>
          </article>
        </div>
      </section>

      <section className="layer3-panel mt-6">
        <p className="layer3-kicker">
          Intelligence Everywhere Diagnostics
        </p>
        <div className="system-metric-grid mt-5">
          <article>
            <small>
              Intelligence events
            </small>
            <strong>
              {hydrated
                ? intelligenceEventCount
                : "—"}
            </strong>
          </article>
          <article>
            <small>
              Memory insights
            </small>
            <strong>
              {hydrated
                ? memoryInsightCount
                : "—"}
            </strong>
          </article>
          <article>
            <small>
              Explainable score engine
            </small>
            <strong>
              Active
            </strong>
          </article>
          <article>
            <small>
              Recommendation trace
            </small>
            <strong>
              Active
            </strong>
          </article>
        </div>
      </section>

      <section className="layer3-panel mt-6">
        <p className="layer3-kicker">
          Entity Registry Diagnostics
        </p>
        <div className="system-metric-grid mt-5">
          <article>
            <small>
              Registered entities
            </small>
            <strong>
              {hydrated
                ? entityDiagnostics.entityCount
                : "—"}
            </strong>
          </article>
          <article>
            <small>
              Relationships
            </small>
            <strong>
              {hydrated
                ? entityDiagnostics.relationshipCount
                : "—"}
            </strong>
          </article>
          <article>
            <small>
              Orphans
            </small>
            <strong>
              {hydrated
                ? entityDiagnostics.orphanCount
                : "—"}
            </strong>
          </article>
          <article>
            <small>
              Broken links
            </small>
            <strong>
              {hydrated
                ? entityDiagnostics.brokenRelationshipCount
                : "—"}
            </strong>
          </article>
          <article>
            <small>
              Duplicate aliases
            </small>
            <strong>
              {hydrated
                ? entityDiagnostics.duplicateAliasCount
                : "—"}
            </strong>
          </article>
          <article>
            <small>
              Missing confidence
            </small>
            <strong>
              {hydrated
                ? entityDiagnostics.missingConfidenceCount
                : "—"}
            </strong>
          </article>
          <article>
            <small>
              Registry build
            </small>
            <strong>
              {hydrated &&
              registryBuildTimeMs !==
                null
                ? `${registryBuildTimeMs}ms`
                : "—"}
            </strong>
          </article>
        </div>
      </section>

            <section className="layer3-panel mt-6">
        <p className="layer3-kicker">Global Intelligence Network</p>
        <div className="system-metric-grid mt-5">
          <article><small>Entities</small><strong>{hydrated ? globalGraphMetrics.entityCount : "—"}</strong></article>
          <article><small>Relationships</small><strong>{hydrated ? globalGraphMetrics.relationshipCount : "—"}</strong></article>
          <article><small>Entity types</small><strong>{hydrated ? globalGraphMetrics.entityTypeCount : "—"}</strong></article>
          <article><small>Relationship types</small><strong>{hydrated ? globalGraphMetrics.relationshipTypeCount : "—"}</strong></article>
          <article><small>Average degree</small><strong>{hydrated ? globalGraphMetrics.averageDegree : "—"}</strong></article>
          <article><small>Graph density</small><strong>{hydrated ? `${globalGraphMetrics.density}%` : "—"}</strong></article>
          <article><small>Connected components</small><strong>{hydrated ? globalGraphMetrics.connectedComponents : "—"}</strong></article>
          <article><small>Orphans</small><strong>{hydrated ? globalGraphMetrics.orphanCount : "—"}</strong></article>
          <article><small>Integrity</small><strong>{hydrated ? `${globalGraphMetrics.integrityScore}%` : "—"}</strong></article>
        </div>
      </section>

<section className="layer3-panel mt-6">
        <p className="layer3-kicker">Imported Data Readiness</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          {Object.entries(diagnostics.readiness).map(([level, count]) => (
            <div className="system-readiness" key={level}>
              <span>{level}</span><strong>{count}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
