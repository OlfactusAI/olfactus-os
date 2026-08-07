"use client";

import Link from "next/link";
import {
  GitBranch,
  Network,
  Sparkles,
} from "lucide-react";
import {
  useMemo,
} from "react";

import {
  useCollection,
} from "@/components/providers/collection-provider";
import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  getLineageSystemContext,
} from "@/lib/intelligence/lineage-system-integration";

export function LineageIntegrationCard({
  fragranceId,
  compact = false,
}: {
  fragranceId: string;
  compact?: boolean;
}) {
  const { items } =
    useCollection();

  const context = useMemo(
    () =>
      getLineageSystemContext({
        fragranceId,
        catalog: fragrances,
        collection: items,
      }),
    [
      fragranceId,
      items,
    ],
  );

  return (
    <article
      className={`system-lineage-card ${
        compact
          ? "is-compact"
          : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="system-lineage-kicker">
            Lineage Intelligence
          </p>
          <h3 className="display-serif mt-3 text-3xl">
            {context.hasKnownLineage
              ? context.lineName
              : "Lineage awaiting data"}
          </h3>
        </div>
        <GitBranch
          size={19}
          className="text-[var(--gold)]"
        />
      </div>

      {context.hasKnownLineage ? (
        <>
          <div className="mt-5 grid grid-cols-3 gap-2">
            <IntegrationMetric
              label="Releases"
              value={
                context.memberCount
              }
            />
            <IntegrationMetric
              label="Inheritance"
              value={
                context.dnaInheritance ??
                0
              }
            />
            <IntegrationMetric
              label="Evolution"
              value={
                context.evolutionScore ??
                0
              }
            />
          </div>

          {context.buyConfidence !==
          undefined ? (
            <div className="mt-4 system-lineage-upgrade">
              <Sparkles
                size={15}
              />
              <span>
                {
                  context.upgradeVerdict
                    ?.replaceAll(
                      "-",
                      " ",
                    )
                }{" "}
                ·{" "}
                {
                  context.buyConfidence
                }
                % confidence
              </span>
            </div>
          ) : null}
        </>
      ) : (
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          This fragrance currently has no verified or inferable
          family members in the local catalog. The integration
          will activate automatically when related releases are
          imported.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link
          href={
            context.lineageHref
          }
          className="system-lineage-action"
        >
          <GitBranch size={14} />
          Lineage
        </Link>
        <Link
          href={context.graphHref}
          className="system-lineage-action"
        >
          <Network size={14} />
          Connections
        </Link>
      </div>
    </article>
  );
}

function IntegrationMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="system-lineage-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
