"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  firstLiveReferenceTarget,
} from "@/lib/reference-live/aventus";
import {
  activateFirstLiveReference,
  traceLiveReference,
} from "@/lib/reference-live/orchestrator";
import {
  proveRuntimeReferenceTraceability,
} from "@/lib/reference-live/runtime-proof";

const operator =
  "production:first-live-reference-admin";

export function AventusLiveReference() {
  const [
    refresh,
    setRefresh,
  ] =
    useState(0);

  const [
    notice,
    setNotice,
  ] =
    useState("");

  const trace =
    useMemo(
      () =>
        traceLiveReference(
          firstLiveReferenceTarget
            .fragranceId,
        ),
      [
        refresh,
      ],
    );

  const proof =
    trace.runtimeEntity
      ? proveRuntimeReferenceTraceability(
          trace.runtimeEntity,
        )
      : undefined;

  const activate =
    () => {
      try {
        const result =
          activateFirstLiveReference({
            fragranceId:
              firstLiveReferenceTarget
                .fragranceId,
            actor:
              operator,
            timestamp:
              new Date()
                .toISOString(),
          });

        setNotice(
          result.traceAfter.live
            ? "Aventus is live and fully traceable to its certified consensus."
            : "Activation did not complete.",
        );
        setRefresh(
          (value) =>
            value +
            1,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Unable to activate Aventus.",
        );
      }
    };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          OLFACTUS First Live Reference
        </p>

        <div className="mt-2 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Creed Aventus
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              End-to-end proof that a live OLFACTUS runtime reference is backed by reviewed claims, certified consensus, a locked Gold Standard certificate, production fingerprints, and an approved activation package.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge
              value={
                trace.live
                  ? "RUNTIME ACTIVE"
                  : trace.readyToActivate
                    ? "READY TO ACTIVATE"
                    : "BLOCKED"
              }
            />
            <Badge
              value={
                trace.certificate
                  ? "GOLD STANDARD"
                  : "NOT CERTIFIED"
              }
            />
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <h2 className="text-xl font-semibold text-white">
          End-to-end provenance chain
        </h2>
        <p className="mt-1 text-sm text-white/45">
          Every stage must pass. OLFACTUS will not generate missing calibration data to force activation.
        </p>

        <div className="mt-5 space-y-3">
          {trace.checks.map(
            (check) => (
              <div
                key={
                  check.stage
                }
                className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 px-4 py-4 md:flex-row md:items-center"
              >
                <div>
                  <p className="text-sm font-semibold capitalize text-white">
                    {check.stage.replace(
                      /-/g,
                      " ",
                    )}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/40">
                    {check.detail}
                  </p>
                </div>
                <span className="text-xs font-semibold text-white">
                  {check.passed
                    ? "PASS"
                    : "BLOCK"}
                </span>
              </div>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={
            activate
          }
          disabled={
            !trace.readyToActivate ||
            trace.live
          }
          className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
        >
          {trace.live
            ? "Aventus is live"
            : "Activate first live Gold Standard reference"}
        </button>
      </section>

      {trace.runtimeEntity && (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
          <h2 className="text-xl font-semibold text-white">
            Runtime traceability proof
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Traceable"
              value={
                proof?.traceable
                  ? "YES"
                  : "NO"
              }
            />
            <Metric
              label="Runtime fingerprints"
              value={
                String(
                  trace.runtimeEntity
                    .fingerprints
                    .length,
                )
              }
            />
            <Metric
              label="Certificate"
              value={
                trace.runtimeEntity
                  .certificateId
              }
            />
            <Metric
              label="Consensus"
              value={
                trace.runtimeEntity
                  .sourceConsensusId
              }
            />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-white/35">
              Certificate hash
            </p>
            <p className="mt-2 break-all text-sm text-white/65">
              {trace.runtimeEntity
                .certificateHash}
            </p>
          </div>
        </section>
      )}

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function Badge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold tracking-[0.1em] text-white/70">
      {value}
    </span>
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
    <div className="rounded-2xl border border-white/10 p-4">
      <p className="break-all text-sm font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/35">
        {label}
      </p>
    </div>
  );
}
