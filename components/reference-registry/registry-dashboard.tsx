"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  loadReferenceGoldStandardCertificates,
} from "@/lib/reference-lab/certification-storage";
import {
  registerCertifiedReference,
} from "@/lib/reference-registry/registry";
import {
  loadReferenceRegistry,
  saveReferenceRegistry,
  upsertReferenceRegistryRecord,
} from "@/lib/reference-registry/storage";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";

export function RegistryDashboard() {
  const [
    records,
    setRecords,
  ] =
    useState<
      ReferenceRegistryRecord[]
    >([]);

  const [
    query,
    setQuery,
  ] =
    useState("");

  const [
    notice,
    setNotice,
  ] =
    useState("");

  useEffect(
    () => {
      setRecords(
        loadReferenceRegistry(),
      );
    },
    [],
  );

  const filtered =
    useMemo(
      () => {
        const normalized =
          query
            .trim()
            .toLowerCase();

        if (!normalized) {
          return records;
        }

        return records.filter(
          (record) =>
            record.fragranceId
              .toLowerCase()
              .includes(
                normalized,
              ) ||
            record.referenceId
              .toLowerCase()
              .includes(
                normalized,
              ),
        );
      },
      [
        records,
        query,
      ],
    );

  const importCertificates =
    () => {
      const certificates =
        loadReferenceGoldStandardCertificates();

      let next = [
        ...records,
      ];

      for (
        const certificate
        of certificates
      ) {
        if (
          next.some(
            (record) =>
              record.currentCertificateId ===
              certificate.certificateId,
          )
        ) {
          continue;
        }

        const record =
          registerCertifiedReference({
            certificate,
            actor:
              "registry:system",
            timestamp:
              new Date()
                .toISOString(),
          });

        next = [
          ...next,
          record,
        ];
      }

      saveReferenceRegistry(
        next,
      );
      setRecords(
        next,
      );
      setNotice(
        `Registry synchronized · ${next.length} certified reference${next.length === 1 ? "" : "s"}.`,
      );
    };

  const stats = {
    registered:
      records.length,
    ready:
      records.filter(
        (record) =>
          record.productionStatus ===
          "ready",
      ).length,
    active:
      records.filter(
        (record) =>
          record.productionStatus ===
          "active",
      ).length,
    blocked:
      records.filter(
        (record) =>
          record.productionStatus ===
          "blocked",
      ).length,
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-white/45">
          OLFACTUS Intelligence Platform
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Reference Registry
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              The permanent registry for certified OLFACTUS reference intelligence. Registration records provenance and lifecycle; production activation remains a separate governed process.
            </p>
          </div>

          <button
            type="button"
            onClick={
              importCertificates
            }
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
          >
            Sync Gold Standard certificates
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Registered"
          value={
            stats.registered
          }
        />
        <Stat
          label="Production ready"
          value={
            stats.ready
          }
        />
        <Stat
          label="Active"
          value={
            stats.active
          }
        />
        <Stat
          label="Blocked"
          value={
            stats.blocked
          }
        />
      </section>

      <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
        <input
          value={
            query
          }
          onChange={(
            event,
          ) =>
            setQuery(
              event.target.value,
            )
          }
          placeholder="Search reference ID or fragrance…"
          className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
        />

        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          {filtered.length ===
            0 ? (
            <div className="p-6 text-sm text-white/50">
              No registered references yet.
            </div>
          ) : (
            filtered.map(
              (record) => (
                <a
                  key={
                    record.referenceId
                  }
                  href={`/reference-registry/${encodeURIComponent(record.referenceId)}`}
                  className="grid gap-4 border-b border-white/10 p-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_repeat(4,130px)] md:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {record.fragranceId}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {record.referenceId}
                    </p>
                  </div>
                  <Cell
                    label="Lifecycle"
                    value={
                      record.lifecycle
                    }
                  />
                  <Cell
                    label="Production"
                    value={
                      record.productionStatus
                    }
                  />
                  <Cell
                    label="Quality"
                    value={`${record.referenceQuality}%`}
                  />
                  <Cell
                    label="Confidence"
                    value={`${record.confidence}%`}
                  />
                </a>
              ),
            )
          )}
        </div>
      </section>

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="text-3xl font-semibold text-white">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
    </div>
  );
}

function Cell({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium capitalize text-white/75">
        {value}
      </p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/30">
        {label}
      </p>
    </div>
  );
}
