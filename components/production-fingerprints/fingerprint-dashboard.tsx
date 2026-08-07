"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loadReferenceConsensusRuns,
} from "@/lib/reference-lab/consensus-storage";
import {
  buildProductionFingerprintBundle,
} from "@/lib/production-fingerprints/builder";
import {
  synchronizeRegistryCoverageFromFingerprints,
} from "@/lib/production-fingerprints/coverage";
import {
  loadProductionFingerprintBundles,
  saveProductionFingerprintBundle,
} from "@/lib/production-fingerprints/storage";
import {
  loadReferenceRegistry,
  saveReferenceRegistry,
} from "@/lib/reference-registry/storage";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";
import type {
  ProductionFingerprintBundle,
} from "@/lib/production-fingerprints/types";

export function FingerprintDashboard() {
  const [
    records,
    setRecords,
  ] =
    useState<
      ReferenceRegistryRecord[]
    >([]);

  const [
    bundles,
    setBundles,
  ] =
    useState<
      ProductionFingerprintBundle[]
    >([]);

  const [
    selectedReferenceId,
    setSelectedReferenceId,
  ] =
    useState("");

  const [
    notice,
    setNotice,
  ] =
    useState("");

  useEffect(
    () => {
      const registry =
        loadReferenceRegistry();

      setRecords(
        registry,
      );
      setBundles(
        loadProductionFingerprintBundles(),
      );
      setSelectedReferenceId(
        registry[
          0
        ]?.referenceId ??
          "",
      );
    },
    [],
  );

  const record =
    useMemo(
      () =>
        records.find(
          (item) =>
            item.referenceId ===
            selectedReferenceId,
        ),
      [
        records,
        selectedReferenceId,
      ],
    );

  const bundle =
    useMemo(
      () =>
        bundles.find(
          (item) =>
            item.referenceId ===
              selectedReferenceId &&
            item.versionId ===
              record
                ?.currentVersionId,
        ),
      [
        bundles,
        selectedReferenceId,
        record,
      ],
    );

  const build =
    () => {
      if (!record) {
        return;
      }

      const run =
        loadReferenceConsensusRuns().find(
          (item) =>
            item.fragranceId ===
              record.fragranceId &&
            item.versionId ===
              record.currentVersionId &&
            item.snapshot
              .consensusId ===
              record.certificate
                .consensusId,
        );

      if (!run) {
        setNotice(
          "The certified consensus snapshot for this registry record could not be found.",
        );
        return;
      }

      try {
        const timestamp =
          new Date()
            .toISOString();

        const nextBundle =
          buildProductionFingerprintBundle({
            record,
            run,
            timestamp,
          });

        const nextBundles =
          saveProductionFingerprintBundle(
            nextBundle,
          );

        const updatedRecord =
          synchronizeRegistryCoverageFromFingerprints({
            record,
            bundle:
              nextBundle,
            timestamp,
          });

        const nextRecords =
          records.map(
            (item) =>
              item.referenceId ===
              updatedRecord.referenceId
                ? updatedRecord
                : item,
          );

        saveReferenceRegistry(
          nextRecords,
        );
        setRecords(
          nextRecords,
        );
        setBundles(
          nextBundles,
        );
        setNotice(
          nextBundle.productionReady
            ? "All required production fingerprints are complete. Registry coverage synchronized to production-ready levels."
            : `Fingerprint bundle generated at ${nextBundle.overallCompleteness}% completeness. Missing certified consensus domains remain blocked.`,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof
            Error
            ? error.message
            : "Unable to build production fingerprints.",
        );
      }
    };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          OLFACTUS Production Intelligence
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Production Fingerprint Builder
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Derive runtime fingerprints strictly from the consensus snapshot named by a locked Gold Standard certificate. Missing certified domains remain missing—no default intelligence is generated.
            </p>
          </div>

          <div className="min-w-[300px]">
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/40">
              Certified reference
            </label>
            <select
              value={
                selectedReferenceId
              }
              onChange={(
                event,
              ) => {
                setSelectedReferenceId(
                  event
                    .target
                    .value,
                );
                setNotice("");
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            >
              {records.length ===
                0 && (
                <option value="">
                  No registered references
                </option>
              )}
              {records.map(
                (item) => (
                  <option
                    key={
                      item.referenceId
                    }
                    value={
                      item.referenceId
                    }
                  >
                    {item.fragranceId}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      {!record ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8 text-sm text-white/50">
          Register a Gold Standard certificate before building production fingerprints.
        </section>
      ) : (
        <>
          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-semibold text-white">
                  {record.fragranceId}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  {record.referenceId} · {record.currentVersionId}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  build
                }
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
              >
                Build + synchronize fingerprints
              </button>
            </div>
          </section>

          {bundle ? (
            <FingerprintBundlePanel
              bundle={
                bundle
              }
            />
          ) : (
            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8">
              <h2 className="text-xl font-semibold text-white">
                No production fingerprint bundle yet
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/50">
                Building will inspect the certified consensus and create only fingerprints supported by its reviewed metrics.
              </p>
            </section>
          )}
        </>
      )}

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function FingerprintBundlePanel({
  bundle,
}: {
  bundle:
    ProductionFingerprintBundle;
}) {
  return (
    <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
      <div className="grid gap-5 md:grid-cols-3">
        <Metric
          label="Bundle completeness"
          value={`${bundle.overallCompleteness}%`}
        />
        <Metric
          label="Fingerprints"
          value={
            String(
              bundle.fingerprints
                .length,
            )
          }
        />
        <Metric
          label="Production readiness"
          value={
            bundle.productionReady
              ? "READY"
              : "BLOCKED"
          }
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {bundle.fingerprints.map(
          (fingerprint) => (
            <div
              key={
                fingerprint.fingerprintId
              }
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold capitalize text-white">
                    {fingerprint.kind.replace(
                      /-/g,
                      " ",
                    )}
                  </p>
                  <p className="mt-1 text-xs text-white/35">
                    {fingerprint.metrics.length} normalized consensus metrics
                  </p>
                </div>
                <span className="text-sm font-semibold text-white">
                  {fingerprint.completeness}%
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full bg-white/65"
                  style={{
                    width:
                      `${fingerprint.completeness}%`,
                  }}
                />
              </div>

              {fingerprint.blockers.length >
                0 && (
                <ul className="mt-3 space-y-1 text-xs leading-5 text-white/40">
                  {fingerprint.blockers.map(
                    (blocker) => (
                      <li
                        key={
                          blocker
                        }
                      >
                        • {blocker}
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xl font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
    </div>
  );
}
