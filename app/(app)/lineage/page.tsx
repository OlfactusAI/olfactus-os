"use client";

import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  Dna,
  GitBranch,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";
import { useCollection } from "@/components/providers/collection-provider";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import {
  analyzeLineageIntelligence,
} from "@/lib/intelligence/lineage-intelligence-engine";
import {
  analyzeFamilyRedundancy,
  analyzeUpgrade,
} from "@/lib/intelligence/upgrade-intelligence-engine";
import {
  createLineageRegistry,
} from "@/lib/lineage/registry";
import {
  inferLineageRegistry,
} from "@/lib/lineage/inference";
import type {
  FragranceLine,
  LineageNode,
} from "@/lib/lineage/types";

export default function LineagePage() {
  const { items } = useCollection();

  const {
    catalog,
    importedIds,
    readinessById,
    isHydrated: catalogHydrated,
  } = useActiveFragranceCatalog();
  const [query, setQuery] =
    useState("");
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const database = useMemo(
    () =>
      buildGlobalFragranceDatabase({
        catalog,
      }),
    [catalog],
  );

  const registry = useMemo(
    () =>
      createLineageRegistry(
        inferLineageRegistry(
          database,
        ),
      ),
    [database],
  );

  const intelligence = useMemo(
    () =>
      analyzeLineageIntelligence({
        database,
        registry,
        inferMissing: false,
      }),
    [database, registry],
  );

  const visibleLines = useMemo(() => {
    const normalized =
      query.trim().toLowerCase();

    return intelligence.lines.filter(
      (line) =>
        !normalized ||
        line.canonicalName
          .toLowerCase()
          .includes(normalized) ||
        line.members.some((node) => {
          const fragrance =
            database.fragrances.find(
              (item) =>
                item.id ===
                node.fragranceId,
            );
          return (
            fragrance?.name
              .toLowerCase()
              .includes(normalized) ??
            false
          );
        }),
    );
  }, [
    database.fragrances,
    intelligence.lines,
    query,
  ]);

  const selected =
    selectedId
      ? intelligence.lines.find(
          (line) =>
            line.id ===
            selectedId,
        ) ?? null
      : null;

  useEffect(() => {
    const parameters =
      new URLSearchParams(
        window.location.search,
      );
    const fragranceId =
      parameters.get("fragrance");
    const lineId =
      parameters.get("line");
    const brand =
      parameters.get("brand");
    const perfumer =
      parameters.get("perfumer");

    if (brand) {
      setQuery(brand);
    } else if (perfumer) {
      setQuery(perfumer);
    }

    if (lineId) {
      const direct =
        intelligence.lines.find(
          (line) =>
            line.id === lineId,
        );

      if (direct) {
        setSelectedId(
          direct.id,
        );
        setQuery(
          direct.canonicalName,
        );
        return;
      }
    }

    if (fragranceId) {
      const match =
        intelligence.lines.find(
          (line) =>
            line.members.some(
              (member) =>
                member.fragranceId === fragranceId,
            ),
        );
      if (match) {
        setSelectedId(match.id);
      }
    }
  }, [intelligence.lines]);

  return (
    <div className="lineage-page pb-12">
      <section className="lineage-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="lineage-grid pointer-events-none absolute inset-0" />
        <div className="lineage-aura pointer-events-none absolute -right-48 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="lineage-mark">
              <GitBranch size={18} />
            </span>
            <div>
              <p className="lineage-kicker">
                OLFACTUS Lineage Intelligence
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Family trees, chronology, DNA inheritance, and performance evolution · LIE-1.0.0
              </p>
            </div>
          </div>

          <span className="lineage-status-chip">
            {visibleLines.length} line
            {visibleLines.length === 1
              ? ""
              : "s"}
          </span>
        </div>

        <div className="relative mt-10 grid gap-10 xl:grid-cols-[1.08fr_.92fr] xl:items-end">
          <div>
            <p className="lineage-kicker">
              Fragrance Evolution
            </p>
            <h1 className="display-serif mt-5 max-w-5xl text-[clamp(4.1rem,8vw,8.4rem)] leading-[.84] tracking-[-.065em]">
              See the family.
              <span className="block text-[var(--gold-bright)]">
                Track the evolution.
              </span>
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Follow originals, flankers, successors, concentrations,
              DNA inheritance, and performance movement across a
              fragrance line.
            </p>
          </div>

          <div className="lineage-search-shell">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Search fragrance lines…"
              aria-label="Search fragrance lines"
            />
            {query ? (
              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
                aria-label="Clear lineage search"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {visibleLines.map((line) => (
          <LineCard
            key={line.id}
            line={line}
            database={database}
            onOpen={() =>
              setSelectedId(line.id)
            }
          />
        ))}
      </section>

      {!visibleLines.length ? (
        <section className="lineage-empty mt-8">
          <GitBranch size={24} />
          <h2 className="display-serif mt-5 text-4xl">
            No complete lineages yet.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--muted)]">
            The current curated catalog contains mostly one representative
            per fragrance line. Add or import related flankers to activate
            family trees automatically.
          </p>
        </section>
      ) : null}

      {selected ? (
        <LineageDossier
          line={selected}
          database={database}
          collection={items}
          onClose={() =>
            setSelectedId(null)
          }
        />
      ) : null}
    </div>
  );
}

function LineCard({
  line,
  database,
  onOpen,
}: {
  line: FragranceLine;
  database: ReturnType<
    typeof buildGlobalFragranceDatabase
  >;
  onOpen: () => void;
}) {
  const original =
    database.fragrances.find(
      (fragrance) =>
        fragrance.id ===
        line.originalFragranceId,
    );

  return (
    <article className="lineage-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="lineage-kicker">
            {original?.brand ??
              "Unknown Brand"}
          </p>
          <h2 className="display-serif mt-3 text-4xl">
            {line.canonicalName}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {line.members.length} release
            {line.members.length === 1
              ? ""
              : "s"}{" "}
            · {line.averageInheritance}% average inheritance
          </p>
        </div>
        <span className="lineage-status-chip">
          {line.confidence} confidence
        </span>
      </div>

      <div className="mt-6 lineage-mini-tree">
        {line.members
          .slice(0, 5)
          .map((node, index) => {
            const fragrance =
              database.fragrances.find(
                (item) =>
                  item.id ===
                  node.fragranceId,
              );
            return (
              <div
                key={node.fragranceId}
                className="lineage-mini-node"
              >
                <span>
                  {index + 1}
                </span>
                <div>
                  <strong>
                    {fragrance?.name ??
                      node.fragranceId}
                  </strong>
                  <small>
                    {fragrance?.concentration ??
                      node.concentrationId}
                  </small>
                </div>
              </div>
            );
          })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-2">
        <Metric
          label="Inheritance"
          value={
            line.averageInheritance
          }
        />
        <Metric
          label="Evolution"
          value={
            line.averageEvolution
          }
        />
        <Metric
          label="Active"
          value={
            line.activeMemberIds
              .length
          }
        />
      </div>

      <button
        type="button"
        className="lineage-primary-action mt-7 w-full"
        onClick={onOpen}
      >
        Explore Lineage
        <ArrowRight size={15} />
      </button>
    </article>
  );
}

function LineageDossier({
  line,
  database,
  collection,
  onClose,
}: {
  line: FragranceLine;
  database: ReturnType<
    typeof buildGlobalFragranceDatabase
  >;
  collection: ReturnType<
    typeof useCollection
  >["items"];
  onClose: () => void;
}) {
  const original =
    database.fragrances.find(
      (fragrance) =>
        fragrance.id ===
        line.originalFragranceId,
    );


  const ownedIds =
    new Set(
      collection.map(
        (item) =>
          item.fragranceId,
      ),
    );

  const lineFragrances =
    line.members
      .map((node) =>
        database.fragrances.find(
          (fragrance) =>
            fragrance.id ===
            node.fragranceId,
        ),
      )
      .filter(
        (
          fragrance,
        ): fragrance is NonNullable<
          typeof fragrance
        > =>
          fragrance !== undefined,
      );

  const ownedMembers =
    lineFragrances.filter(
      (fragrance) =>
        ownedIds.has(
          fragrance.id,
        ),
    );

  const candidateMembers =
    lineFragrances.filter(
      (fragrance) =>
        !ownedIds.has(
          fragrance.id,
        ),
    );

  const upgradeAnalysis =
    ownedMembers[0] &&
    candidateMembers[0]
      ? analyzeUpgrade({
          owned:
            ownedMembers[0],
          candidate:
            candidateMembers[0],
          collection,
        })
      : null;

  const redundancyAnalysis =
    analyzeFamilyRedundancy({
      line,
      database,
      collection,
    });

  return (
    <div className="lineage-dossier-backdrop">
      <section className="lineage-dossier">
        <button
          type="button"
          className="lineage-dossier-close"
          onClick={onClose}
          aria-label="Close lineage dossier"
        >
          <X size={18} />
        </button>

        <p className="lineage-kicker">
          {original?.brand ??
            "Fragrance Line"}
        </p>
        <h2 className="display-serif mt-4 text-6xl">
          {line.canonicalName}
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {line.members.length} generations and releases ·{" "}
          {line.averageInheritance}% inherited DNA
        </p>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <GitBranch
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="lineage-kicker">
              Family Tree
            </p>
          </div>

          <div className="mt-5 lineage-family-tree">
            {line.members.map(
              (node, index) => (
                <FamilyNode
                  key={
                    node.fragranceId
                  }
                  node={node}
                  index={index}
                  database={database}
                />
              ),
            )}
          </div>
        </div>

        <div className="mt-9">
          <div className="flex items-center gap-3">
            <Dna
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="lineage-kicker">
              DNA Evolution
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {line.members.map(
              (node) => {
                const fragrance =
                  database.fragrances.find(
                    (item) =>
                      item.id ===
                      node.fragranceId,
                  );

                return (
                  <div
                    key={
                      node.fragranceId
                    }
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p>
                        {fragrance?.name ??
                          node.fragranceId}
                      </p>
                      <p className="display-serif text-2xl text-[var(--gold-bright)]">
                        {
                          node.dnaInheritance
                        }
                        %
                      </p>
                    </div>
                    <div className="lineage-bar mt-2">
                      <span
                        style={{
                          width: `${node.dnaInheritance}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

        <div className="mt-9">
          <div className="flex items-center gap-3">
            <BarChart3
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="lineage-kicker">
              Performance Evolution
            </p>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="lineage-table">
              <thead>
                <tr>
                  <th>Release</th>
                  <th>Longevity</th>
                  <th>Projection</th>
                  <th>Δ Longevity</th>
                  <th>Δ Projection</th>
                </tr>
              </thead>
              <tbody>
                {line.members.map(
                  (node) => {
                    const fragrance =
                      database.fragrances.find(
                        (item) =>
                          item.id ===
                          node.fragranceId,
                      );

                    return (
                      <tr
                        key={
                          node.fragranceId
                        }
                      >
                        <td>
                          {fragrance?.name ??
                            node.fragranceId}
                        </td>
                        <td>
                          {
                            fragrance
                              ?.performance
                              .longevity
                          }
                        </td>
                        <td>
                          {
                            fragrance
                              ?.performance
                              .projection
                          }
                        </td>
                        <td>
                          {signed(
                            node
                              .performanceDelta
                              .longevity,
                          )}
                        </td>
                        <td>
                          {signed(
                            node
                              .performanceDelta
                              .projection,
                          )}
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-9">
          <div className="flex items-center gap-3">
            <Sparkles
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="lineage-kicker">
              Upgrade Intelligence
            </p>
          </div>

          {upgradeAnalysis ? (
            <div className="lineage-upgrade-panel mt-5">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Metric
                  label="Buy Confidence"
                  value={
                    upgradeAnalysis.buyConfidence
                  }
                />
                <Metric
                  label="Complement"
                  value={
                    upgradeAnalysis.complementScore
                  }
                />
                <Metric
                  label="Replacement"
                  value={
                    upgradeAnalysis.replacementScore
                  }
                />
                <Metric
                  label="DNA Separation"
                  value={
                    upgradeAnalysis.dnaSeparation
                  }
                />
                <Metric
                  label="Collection Gain"
                  value={
                    upgradeAnalysis.collectionGain
                  }
                />
                <Metric
                  label="Upgrade"
                  value={
                    upgradeAnalysis.upgradeScore
                  }
                />
              </div>
              <p className="lineage-verdict mt-5">
                {upgradeAnalysis.verdict.replaceAll(
                  "-",
                  " ",
                )}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {
                  upgradeAnalysis.explanation
                }
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Own at least one release and leave another unowned to activate
              the Upgrade Advisor.
            </p>
          )}
        </div>

        <div className="mt-9">
          <div className="flex items-center gap-3">
            <BarChart3
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="lineage-kicker">
              Family Redundancy
            </p>
          </div>

          <div className="lineage-upgrade-panel mt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--muted)]">
                  Owned releases
                </p>
                <p className="display-serif mt-2 text-4xl">
                  {
                    redundancyAnalysis.ownedMemberIds
                      .length
                  }
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--muted)]">
                  Family redundancy
                </p>
                <p className="display-serif mt-2 text-4xl text-[var(--gold-bright)]">
                  {
                    redundancyAnalysis.familyRedundancy
                  }
                  %
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              {
                redundancyAnalysis.summary
              }
            </p>

            <div className="mt-5 space-y-2">
              {redundancyAnalysis.items.map(
                (item) => {
                  const fragrance =
                    database.fragrances.find(
                      (candidate) =>
                        candidate.id ===
                        item.fragranceId,
                    );

                  return (
                    <div
                      key={item.fragranceId}
                      className="lineage-redundancy-row"
                    >
                      <span>
                        <strong>
                          {fragrance?.name ??
                            item.fragranceId}
                        </strong>
                        <small>
                          {item.reason}
                        </small>
                      </span>
                      <span className="lineage-status-chip">
                        {item.recommendation.replaceAll(
                          "-",
                          " ",
                        )}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>

        <div className="mt-9">
          <div className="flex items-center gap-3">
            <Sparkles
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="lineage-kicker">
              Concentration Progression
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {line.members.map(
              (node) => {
                const fragrance =
                  database.fragrances.find(
                    (item) =>
                      item.id ===
                      node.fragranceId,
                  );

                return (
                  <article
                    key={
                      node.fragranceId
                    }
                    className="lineage-concentration-card"
                  >
                    <p className="lineage-kicker">
                      Generation{" "}
                      {node.generation}
                    </p>
                    <h3 className="display-serif mt-3 text-3xl">
                      {fragrance?.concentration ??
                        node.concentrationId}
                    </h3>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {fragrance?.name ??
                        node.fragranceId}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <span>
                        Evolution
                      </span>
                      <strong>
                        {
                          node.evolutionScore
                        }
                      </strong>
                    </div>
                  </article>
                );
              },
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FamilyNode({
  node,
  index,
  database,
}: {
  node: LineageNode;
  index: number;
  database: ReturnType<
    typeof buildGlobalFragranceDatabase
  >;
}) {
  const fragrance =
    database.fragrances.find(
      (item) =>
        item.id ===
        node.fragranceId,
    );

  return (
    <div className="lineage-family-node">
      <div className="lineage-family-index">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1">
        <p className="display-serif text-3xl">
          {fragrance?.name ??
            node.fragranceId}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {fragrance?.concentration ??
            node.concentrationId}{" "}
          · {node.relationship} ·{" "}
          {node.releaseYear ??
            "Year unknown"}
        </p>
      </div>
      {index <
      database.fragrances.length ? (
        <ChevronRight
          size={17}
          className="text-[var(--gold)]"
        />
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="lineage-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function signed(value: number) {
  return value > 0
    ? `+${value}`
    : String(value);
}
