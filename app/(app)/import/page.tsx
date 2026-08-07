"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
  Download,
  FileJson,
  FileSpreadsheet,
  Filter,
  RotateCcw,
  Save,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import { fragrances } from "@/lib/data/fragrances";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import {
  canCommitImportSession,
  commitImportSession,
  createImportSession,
  loadImportedCatalog,
  parseImportPayload,
  resolveImportConflict,
  saveImportedCatalog,
  saveLastImportReport,
  updateImportDecision,
  type ImportCommitReport,
  type ImportDecision,
  type ImportFormat,
  type ImportRecordMatch,
  type ImportSession,
} from "@/lib/database/import";

type ClassificationFilter = "all" | ImportRecordMatch["classification"];

export default function ImportPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [format, setFormat] = useState<ImportFormat>("json");
  const [sourceLabel, setSourceLabel] = useState("Manual import");
  const [strict, setStrict] = useState(false);
  const [payload, setPayload] = useState("");
  const [session, setSession] = useState<ImportSession | null>(null);
  const [report, setReport] = useState<ImportCommitReport | null>(null);
  const [filter, setFilter] = useState<ClassificationFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const baseCatalog = useMemo(() => {
    const byId = new Map<string, FragranceRecord>();
    for (const item of [...fragrances, ...loadImportedCatalog()]) {
      byId.set(item.id, item);
    }
    return [...byId.values()];
  }, [report]);

  const visibleRecords = useMemo(() => {
    if (!session) return [];
    return session.records.filter(
      (record) => filter === "all" || record.match.classification === filter,
    );
  }, [filter, session]);

  function stageImport() {
    setError(null);
    setReport(null);
    const parsed = parseImportPayload({
      format,
      input: payload,
      options: { sourceLabel, strict },
    });

    if (parsed.rowsParsed === 0) {
      setError(parsed.diagnostics[0]?.message ?? "No valid records were parsed.");
      return;
    }

    setSession(
      createImportSession({
        incoming: parsed.records,
        catalog: baseCatalog,
        sourceFormat: format,
        sourceLabel,
      }),
    );
  }

  async function handleFile(file: File) {
    setPayload(await file.text());
    setFormat(file.name.toLowerCase().endsWith(".csv") ? "csv" : "json");
    setSourceLabel(file.name);
    setError(null);
  }

  function changeDecision(stageId: string, decision: ImportDecision) {
    if (!session) return;
    setSession(updateImportDecision({ session, stageId, decision }));
  }

  function resolveConflict(
    stageId: string,
    field: string,
    resolution: "existing" | "incoming" | "merge",
  ) {
    if (!session) return;
    setSession(resolveImportConflict({ session, stageId, field, resolution }));
  }

  function commit() {
    if (!session) return;
    const result = commitImportSession({ session, catalog: baseCatalog });

    saveImportedCatalog(
      result.catalog.filter(
        (item) => !fragrances.some((baseItem) => baseItem.id === item.id),
      ),
    );
    saveLastImportReport(result.report);
    setReport(result.report);
    setConfirming(false);
  }

  function downloadReport() {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `olfactus-import-${report.commitId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setPayload("");
    setSession(null);
    setReport(null);
    setError(null);
    setConfirming(false);
    setFilter("all");
  }

  return (
    <div className="import-page pb-14">
      <section className="import-hero rounded-[36px] border border-[rgba(232,200,127,.2)] p-6 sm:p-10 xl:p-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="import-kicker">Global Database Import</p>
            <h1 className="display-serif mt-5 max-w-5xl text-[clamp(4rem,8vw,8rem)] leading-[.86] tracking-[-.06em]">
              Import.
              <span className="block text-[var(--gold-bright)]">Review. Commit.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--muted)]">
              Upload JSON or CSV data, inspect matches, resolve conflicts, and
              commit approved records to your local OLFACTUS catalog.
            </p>
          </div>
          <div className="import-model-chip">GDI-2.0.0</div>
        </div>
      </section>

      <section className="mt-7 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <article className="import-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="import-kicker">Source</p>
              <h2 className="display-serif mt-3 text-4xl">Upload or paste data</h2>
            </div>
            <button type="button" className="import-icon-button" onClick={reset}>
              <RotateCcw size={17} />
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".json,.csv,application/json,text/csv"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleFile(file);
            }}
          />

          <button
            type="button"
            className="import-dropzone mt-6"
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const file = event.dataTransfer.files[0];
              if (file) void handleFile(file);
            }}
          >
            <UploadCloud size={30} />
            <strong>Drop JSON or CSV here</strong>
            <span>or click to choose a file</span>
          </button>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <label className="import-field">
              <span>Format</span>
              <select
                value={format}
                onChange={(event) => setFormat(event.target.value as ImportFormat)}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </label>
            <label className="import-field">
              <span>Source label</span>
              <input
                value={sourceLabel}
                onChange={(event) => setSourceLabel(event.target.value)}
              />
            </label>
          </div>

          <label className="import-check mt-4">
            <input
              type="checkbox"
              checked={strict}
              onChange={(event) => setStrict(event.target.checked)}
            />
            Strict validation
          </label>

          <label className="import-field mt-5">
            <span className="flex items-center gap-2">
              <ClipboardPaste size={14} />
              Raw payload
            </span>
            <textarea
              value={payload}
              onChange={(event) => setPayload(event.target.value)}
              placeholder={
                format === "json"
                  ? '[{"name":"Aventus","brand":"Creed","concentration":"Eau de Parfum"}]'
                  : "name,brand,concentration\nAventus,Creed,Eau de Parfum"
              }
            />
          </label>

          {error ? (
            <div className="import-error mt-4">
              <AlertTriangle size={16} />
              {error}
            </div>
          ) : null}

          <button
            type="button"
            className="import-primary mt-5 w-full"
            onClick={stageImport}
            disabled={!payload.trim()}
          >
            Analyze Import
          </button>
        </article>

        <article className="import-panel">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="import-kicker">Preview</p>
              <h2 className="display-serif mt-3 text-4xl">Staged actions</h2>
            </div>
            <Filter size={18} className="text-[var(--gold)]" />
          </div>

          {session ? (
            <>
              <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
                <SummaryMetric label="Total" value={session.summary.total} />
                <SummaryMetric label="Create" value={session.summary.create} />
                <SummaryMetric label="Merge" value={session.summary.merge} />
                <SummaryMetric label="Update" value={session.summary.update} />
                <SummaryMetric label="Skip" value={session.summary.skip} />
                <SummaryMetric label="Review" value={session.summary.review} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(
                  [
                    "all",
                    "new",
                    "exact-duplicate",
                    "probable-duplicate",
                    "possible-variant",
                    "safe-update",
                    "conflicting-update",
                    "manual-review",
                  ] as ClassificationFilter[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={filter === item ? "import-filter is-active" : "import-filter"}
                    onClick={() => setFilter(item)}
                  >
                    {item.replaceAll("-", " ")}
                  </button>
                ))}
              </div>

              <div className="mt-5 space-y-3">
                {visibleRecords.map((record) => (
                  <article key={record.stageId} className="import-record">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="import-kicker">
                          {record.match.classification} · {record.match.confidence}%
                        </p>
                        <h3 className="display-serif mt-2 text-3xl">
                          {record.incoming.name}
                        </h3>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          {record.incoming.brand} · {record.incoming.concentration} ·{" "}
                          {record.incoming.releaseYear ?? "Year unknown"}
                        </p>
                      </div>
                      <select
                        className="import-decision"
                        value={record.decision}
                        onChange={(event) =>
                          changeDecision(record.stageId, event.target.value as ImportDecision)
                        }
                      >
                        {["create", "skip", "merge", "update", "reject", "review"].map(
                          (decision) => (
                            <option key={decision} value={decision}>
                              {decision}
                            </option>
                          ),
                        )}
                      </select>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                      {record.match.explanation}
                    </p>

                    {record.match.matchedFragranceId ? (
                      <p className="mt-3 text-xs text-[var(--gold-bright)]">
                        Existing match: {record.match.matchedFragranceId}
                      </p>
                    ) : null}

                    {record.match.conflicts
                      .filter((conflict) => conflict.status === "conflict")
                      .map((conflict) => (
                        <div key={conflict.field} className="import-conflict mt-4">
                          <div>
                            <strong>{conflict.field}</strong>
                            <small>Existing: {String(conflict.existingValue)}</small>
                            <small>Incoming: {String(conflict.incomingValue)}</small>
                          </div>
                          <div className="import-resolution-grid">
                            {(["existing", "incoming", "merge"] as const).map(
                              (resolution) => (
                                <button
                                  key={resolution}
                                  type="button"
                                  className={
                                    record.resolvedConflicts[conflict.field] === resolution
                                      ? "is-active"
                                      : ""
                                  }
                                  onClick={() =>
                                    resolveConflict(
                                      record.stageId,
                                      conflict.field,
                                      resolution,
                                    )
                                  }
                                >
                                  {resolution}
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      ))}
                  </article>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-5">
                <div>
                  <p className="text-sm text-[var(--muted)]">Blocking reviews</p>
                  <p className="display-serif mt-1 text-3xl">
                    {session.summary.blockingReviewCount}
                  </p>
                </div>
                <button
                  type="button"
                  className="import-primary"
                  disabled={!canCommitImportSession(session)}
                  onClick={() => setConfirming(true)}
                >
                  <Save size={15} />
                  Commit Import
                </button>
              </div>
            </>
          ) : (
            <div className="import-empty mt-6">
              <FileJson size={24} />
              <FileSpreadsheet size={24} />
              <p>Analyze a payload to build the preview.</p>
            </div>
          )}
        </article>
      </section>

      {report ? (
        <section className="import-panel mt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="import-kicker">Completed Import</p>
              <h2 className="display-serif mt-3 text-5xl">
                {report.success ? "Commit successful" : "Commit completed with failures"}
              </h2>
            </div>
            {report.success ? (
              <CheckCircle2 size={27} className="text-[var(--gold-bright)]" />
            ) : (
              <XCircle size={27} />
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
            <SummaryMetric label="Created" value={report.createdCount} />
            <SummaryMetric label="Updated" value={report.updatedCount} />
            <SummaryMetric label="Merged" value={report.mergedCount} />
            <SummaryMetric label="Skipped" value={report.skippedCount} />
            <SummaryMetric label="Rejected" value={report.rejectedCount} />
            <SummaryMetric label="Failed" value={report.failedCount} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-[var(--muted)]">
              Resulting catalog: {report.resultingCatalogSize} fragrances
            </p>
            <button type="button" className="import-secondary" onClick={downloadReport}>
              <Download size={15} />
              Download JSON Report
            </button>
          </div>
        </section>
      ) : null}

      {confirming && session ? (
        <div className="import-modal-backdrop">
          <section className="import-modal">
            <p className="import-kicker">Confirm Commit</p>
            <h2 className="display-serif mt-4 text-5xl">Apply staged changes?</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              This persists approved imported records in this browser. It does not
              rewrite your project source files.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <SummaryMetric label="Create" value={session.summary.create} />
              <SummaryMetric label="Merge" value={session.summary.merge} />
              <SummaryMetric label="Update" value={session.summary.update} />
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="import-secondary"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
              <button type="button" className="import-primary" onClick={commit}>
                Confirm Commit
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="import-summary-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
