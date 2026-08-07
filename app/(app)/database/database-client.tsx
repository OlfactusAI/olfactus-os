"use client";

import {
  BadgeCheck,
  Database,
  FileSearch,
  Fingerprint,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Tags,
  UsersRound,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import {
  useSearchParams,
} from "next/navigation";

import { fragrances } from "@/lib/data/fragrances";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import { findDuplicateFragrances } from "@/lib/database/duplicate-detection";
import {
  buildFragranceSearchIndex,
  searchGlobalFragranceDatabase,
} from "@/lib/database/search-index";
import { validateGlobalFragranceDatabase } from "@/lib/database/validation";
import { DatabaseEntityDossier } from "@/components/database/entity-dossier";

export default function DatabaseClient() {
  const searchParams =
    useSearchParams();
  const [query, setQuery] =
    useState("");

  const noteId =
    searchParams.get("note");
  const accordId =
    searchParams.get("accord");
  const ingredientId =
    searchParams.get(
      "ingredient",
    );

  const database = useMemo(
    () =>
      buildGlobalFragranceDatabase({
        catalog: fragrances,
      }),
    [],
  );

  const searchIndex = useMemo(
    () =>
      buildFragranceSearchIndex(
        database,
      ),
    [database],
  );

  const validation = useMemo(
    () =>
      validateGlobalFragranceDatabase(
        database,
      ),
    [database],
  );

  const duplicates = useMemo(
    () =>
      findDuplicateFragrances(
        database.fragrances,
      ),
    [database],
  );

  const results = useMemo(
    () =>
      searchGlobalFragranceDatabase({
        database,
        index: searchIndex,
        query,
        limit: 12,
      }),
    [
      database,
      query,
      searchIndex,
    ],
  );

  return (
    <div className="database-page pb-12">
      <section className="database-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="database-grid pointer-events-none absolute inset-0" />
        <div className="database-aura pointer-events-none absolute -right-48 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="database-command-mark">
              <Database size={18} />
            </span>
            <div>
              <p className="database-kicker">
                OLFACTUS Global Database
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Normalized fragrance intelligence · GFD-1.0.0
              </p>
            </div>
          </div>
          <span className="database-status-chip">
            Foundation online
          </span>
        </div>

        <div className="relative mt-10 grid gap-10 xl:grid-cols-[1.12fr_.88fr] xl:items-end">
          <div>
            <p className="database-kicker">
              Data Foundation
            </p>
            <h1 className="display-serif mt-5 max-w-5xl text-[clamp(4.2rem,8vw,8.4rem)] leading-[.84] tracking-[-.065em]">
              One fragrance universe.
              <span className="block text-[var(--gold-bright)]">
                Structured for intelligence.
              </span>
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Brands, perfumers, notes, accords, concentrations,
              countries, relationships, ratings, and assets now
              share one normalized database model.
            </p>
          </div>

          <div className="database-quality-card">
            <p className="database-kicker">
              Database Quality
            </p>
            <p className="display-serif mt-4 text-7xl leading-none text-[var(--gold-bright)]">
              {validation.score}
            </p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {validation.valid
                ? "Validation passed"
                : `${validation.counts.errors} errors require attention`}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <MiniMetric
                label="Fragrances"
                value={
                  database.fragrances
                    .length
                }
              />
              <MiniMetric
                label="Entities"
                value={
                  database.brands
                    .length +
                  database.perfumers
                    .length +
                  database.notes.length +
                  database.accords
                    .length
                }
              />
            </div>
          </div>
        </div>
      </section>

      <DatabaseEntityDossier
        database={database}
        noteId={noteId}
        accordId={accordId}
        ingredientId={
          ingredientId
        }
      />

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DatabaseMetric
          icon={<Layers3 size={19} />}
          label="Fragrances"
          value={database.fragrances.length}
          explanation="Normalized fragrance records."
        />
        <DatabaseMetric
          icon={<Tags size={19} />}
          label="Brands"
          value={database.brands.length}
          explanation="Canonical brand identities."
        />
        <DatabaseMetric
          icon={<UsersRound size={19} />}
          label="Perfumers"
          value={database.perfumers.length}
          explanation="Normalized creator records."
        />
        <DatabaseMetric
          icon={<Fingerprint size={19} />}
          label="Duplicate Candidates"
          value={duplicates.length}
          explanation="Potential records requiring review."
        />
      </section>

      <section className="mt-8 database-panel p-7 sm:p-9">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="database-kicker">
              Search Index
            </p>
            <h2 className="display-serif mt-3 text-4xl">
              Search the normalized catalog.
            </h2>
          </div>
          <div className="database-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Brand, fragrance, note, accord…"
              aria-label="Search global fragrance database"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.map((result) => (
            <article
              key={
                result.fragrance.id
              }
              className="database-result"
            >
              <p className="text-xs uppercase tracking-[.12em] text-[var(--gold)]">
                {
                  result.fragrance
                    .brand
                }
              </p>
              <p className="display-serif mt-3 text-3xl">
                {
                  result.fragrance
                    .name
                }
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {
                  result.fragrance
                    .concentration
                }{" "}
                ·{" "}
                {
                  result.fragrance
                    .family
                }
              </p>
              <div className="mt-5 flex items-center justify-between gap-4">
                <span className="database-pill">
                  Quality{" "}
                  {
                    result.fragrance
                      .dataQualityScore
                  }
                </span>
                <span className="text-xs text-[var(--muted)]">
                  Search {result.score}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <article className="database-panel p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <ShieldCheck
              size={18}
              className="text-[var(--gold)]"
            />
            <div>
              <p className="database-kicker">
                Validation
              </p>
              <h2 className="display-serif mt-2 text-4xl">
                Data integrity status.
              </h2>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            <StatusMetric
              label="Errors"
              value={
                validation.counts
                  .errors
              }
            />
            <StatusMetric
              label="Warnings"
              value={
                validation.counts
                  .warnings
              }
            />
            <StatusMetric
              label="Info"
              value={
                validation.counts.info
              }
            />
          </div>

          <div className="mt-7 divide-y divide-[var(--border)]">
            {validation.issues
              .slice(0, 6)
              .map(
                (
                  issue,
                  index,
                ) => (
                  <div
                    key={`${issue.entityId}-${issue.field}-${index}`}
                    className="py-4"
                  >
                    <p className="font-semibold">
                      {issue.message}
                    </p>
                    <p className="mt-1 text-xs text-[var(--muted)]">
                      {
                        issue.entityType
                      }{" "}
                      · {issue.entityId}
                    </p>
                  </div>
                ),
              )}

            {!validation.issues
              .length ? (
              <div className="flex items-center gap-3 py-5 text-[var(--success)]">
                <BadgeCheck size={18} />
                All foundation checks passed.
              </div>
            ) : null}
          </div>
        </article>

        <article className="database-panel database-analyst p-7 sm:p-9">
          <div className="flex items-center gap-3">
            <Sparkles
              size={18}
              className="text-[var(--gold)]"
            />
            <p className="database-kicker">
              Database Intelligence
            </p>
          </div>

          <blockquote className="display-serif mt-7 text-3xl leading-[1.4]">
            “The catalog now separates fragrance identity from
            reusable brands, perfumers, notes, accords,
            concentrations, countries, assets, ratings, and
            relationships. This foundation can scale without
            duplicating the same metadata across every record.”
          </blockquote>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <MiniMetric
              label="Notes"
              value={
                database.notes.length
              }
            />
            <MiniMetric
              label="Accords"
              value={
                database.accords.length
              }
            />
            <MiniMetric
              label="Concentrations"
              value={
                database
                  .concentrations.length
              }
            />
            <MiniMetric
              label="Countries"
              value={
                database.countries
                  .length
              }
            />
          </div>
        </article>
      </section>
    </div>
  );
}

function DatabaseMetric({
  icon,
  label,
  value,
  explanation,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  explanation: string;
}) {
  return (
    <article className="database-stat">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      <small>{explanation}</small>
    </article>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="database-mini">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function StatusMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="database-status">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
