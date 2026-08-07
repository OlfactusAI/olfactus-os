"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  loadReferenceRegistry,
} from "@/lib/reference-registry/storage";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";

export function RegistryDetail({
  referenceId,
}: {
  referenceId: string;
}) {
  const [
    record,
    setRecord,
  ] =
    useState<
      ReferenceRegistryRecord |
      undefined
    >();

  useEffect(
    () => {
      setRecord(
        loadReferenceRegistry().find(
          (item) =>
            item.referenceId ===
            referenceId,
        ),
      );
    },
    [
      referenceId,
    ],
  );

  if (!record) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8 text-sm text-white/55">
        Reference not found in local registry.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          {record.referenceId}
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">
          {record.fragranceId}
        </h1>
        <div className="mt-5 flex flex-wrap gap-3">
          <Pill
            value={
              record.lifecycle
            }
          />
          <Pill
            value={
              record.productionStatus
            }
          />
          <Pill
            value={`Quality ${record.referenceQuality}%`}
          />
          <Pill
            value={`Confidence ${record.confidence}%`}
          />
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <h2 className="text-xl font-semibold text-white">
          Engine coverage
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(
            record.coverage,
          ).map(
            (
              [
                key,
                value,
              ],
            ) => (
              <div
                key={
                  key
                }
                className="rounded-2xl border border-white/10 p-4"
              >
                <p className="text-2xl font-semibold text-white">
                  {value}%
                </p>
                <p className="mt-1 text-xs capitalize text-white/40">
                  {key}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <h2 className="text-xl font-semibold text-white">
          Version history
        </h2>
        <div className="mt-5 space-y-3">
          {record.versions.map(
            (version) => (
              <div
                key={
                  version.versionId
                }
                className="rounded-2xl border border-white/10 p-4"
              >
                <p className="text-sm font-semibold text-white">
                  {version.calibrationVersion}
                </p>
                <p className="mt-1 text-xs text-white/40">
                  {version.status} · {version.certificateId}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <h2 className="text-xl font-semibold text-white">
          Registry timeline
        </h2>
        <div className="mt-5 space-y-3">
          {record.timeline.map(
            (event) => (
              <div
                key={
                  event.eventId
                }
                className="border-l border-white/15 pl-4"
              >
                <p className="text-sm font-medium capitalize text-white/75">
                  {event.type}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  {event.detail}
                </p>
                <p className="mt-1 text-[11px] text-white/25">
                  {event.timestamp} · {event.actor}
                </p>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function Pill({
  value,
}: {
  value: string;
}) {
  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium capitalize text-white/65">
      {value}
    </span>
  );
}
