"use client";

import Link from "next/link";
import {
  Bookmark,
  Check,
  ChevronDown,
  ChevronUp,
  Compass,
  Filter,
  FlaskConical,
  GitCompareArrows,
  Library,
  RotateCcw,
  Search,
  Sparkles,
  Tags,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useCollection } from "@/components/providers/collection-provider";
import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import {
  getRelatedExplorerFragrances,
  searchFragranceExplorer,
  type ExplorerFilters,
  type ExplorerSort,
} from "@/lib/database/fragrance-explorer-engine";
import {
  buildFragranceSearchIndex,
} from "@/lib/database/search-index";
import {
  readSavedExplorerSearches,
  writeSavedExplorerSearches,
  type SavedExplorerSearch,
} from "@/lib/database/explorer-search-storage";
import type {
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import { LineageIntegrationCard } from "@/components/lineage/lineage-integration-card";

const emptyFilters: ExplorerFilters = {};

export default function ExplorerPage() {
  const {
    items,
    addFragrance,
  } = useCollection();

  const {
    catalog,
    importedIds,
    readinessById,
    isHydrated: catalogHydrated,
  } = useActiveFragranceCatalog();

  const database = useMemo(
    () =>
      buildGlobalFragranceDatabase({
        catalog,
      }),
    [catalog],
  );

  const index = useMemo(
    () =>
      buildFragranceSearchIndex(
        database,
      ),
    [database],
  );

  const ownedIds = useMemo(
    () =>
      new Set(
        items.map(
          (item) =>
            item.fragranceId,
        ),
      ),
    [items],
  );

  const [query, setQuery] =
    useState("");
  const [filters, setFilters] =
    useState<ExplorerFilters>(
      emptyFilters,
    );
  const [sort, setSort] =
    useState<ExplorerSort>(
      "relevance",
    );
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [compareIds, setCompareIds] =
    useState<string[]>([]);
  const [savedSearches, setSavedSearches] =
    useState<SavedExplorerSearch[]>(
      [],
    );
  const [filtersOpen, setFiltersOpen] =
    useState(true);

  useEffect(() => {
    setSavedSearches(
      readSavedExplorerSearches(),
    );
  }, []);

  const results = useMemo(
    () =>
      searchFragranceExplorer({
        database,
        index,
        query,
        filters,
        sort,
        ownedIds,
      }),
    [
      database,
      filters,
      index,
      ownedIds,
      query,
      sort,
    ],
  );

  const selected =
    selectedId
      ? database.fragrances.find(
          (fragrance) =>
            fragrance.id ===
            selectedId,
        ) ?? null
      : null;

  const compared =
    compareIds
      .map((id) =>
        database.fragrances.find(
          (fragrance) =>
            fragrance.id === id,
        ),
      )
      .filter(Boolean) as
      GlobalFragranceRecord[];

  const brands = unique(
    database.fragrances.map(
      (item) => item.brand,
    ),
  );
  const families = unique(
    database.fragrances.map(
      (item) => item.family,
    ),
  );
  const concentrations = unique(
    database.fragrances.map(
      (item) =>
        item.concentration,
    ),
  );

  function updateFilter<
    Key extends keyof ExplorerFilters,
  >(
    key: Key,
    value: ExplorerFilters[Key],
  ) {
    setFilters((current) => ({
      ...current,
      [key]:
        value === "" ||
        value === 0
          ? undefined
          : value,
    }));
  }

  function resetSearch() {
    setQuery("");
    setFilters(emptyFilters);
    setSort("relevance");
  }

  function saveCurrentSearch() {
    const label =
      query.trim() ||
      [
        filters.brand,
        filters.family,
        filters.role,
        filters.season,
      ]
        .filter(Boolean)
        .join(" · ") ||
      "Explorer Search";

    const search: SavedExplorerSearch = {
      id: `search-${Date.now()}`,
      label,
      query,
      createdAt:
        new Date().toISOString(),
      filters: {
        brand: filters.brand,
        family: filters.family,
        concentration:
          filters.concentration,
        availability:
          filters.availabilityStatus,
        minimumQuality:
          filters.minimumDataQuality,
        minimumLongevity:
          filters.minimumLongevity,
        minimumProjection:
          filters.minimumProjection,
      },
    };

    const next = [
      search,
      ...savedSearches.filter(
        (item) =>
          item.label !== search.label,
      ),
    ].slice(0, 12);

    setSavedSearches(next);
    writeSavedExplorerSearches(next);
  }

  function loadSavedSearch(
    saved: SavedExplorerSearch,
  ) {
    setQuery(saved.query);
    setFilters({
      brand: saved.filters.brand,
      family:
        saved.filters.family,
      concentration:
        saved.filters
          .concentration,
      availabilityStatus:
        saved.filters
          .availability,
      minimumDataQuality:
        saved.filters
          .minimumQuality,
      minimumLongevity:
        saved.filters
          .minimumLongevity,
      minimumProjection:
        saved.filters
          .minimumProjection,
    });
  }

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (value) => value !== id,
        );
      }

      if (current.length >= 3) {
        return [
          current[1],
          current[2],
          id,
        ].filter(Boolean);
      }

      return [...current, id];
    });
  }

  return (
    <div className="explorer-page pb-12">
      {importedIds.size > 0 ? (
        <div className="active-catalog-banner">
          <strong>{importedIds.size} imported fragrance{importedIds.size === 1 ? "" : "s"} active</strong>
          <span>Readiness safeguards are applied to incomplete records.</span>
        </div>
      ) : null}
      <section className="explorer-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="explorer-grid pointer-events-none absolute inset-0" />
        <div className="explorer-aura pointer-events-none absolute -right-48 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="explorer-mark">
              <Compass size={18} />
            </span>
            <div>
              <p className="explorer-kicker">
                OLFACTUS Fragrance Explorer
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Advanced search and match intelligence · FEX-1.0.0
              </p>
            </div>
          </div>
          <span className="explorer-status-chip">
            {results.length} result
            {results.length === 1
              ? ""
              : "s"}
          </span>
        </div>

        <div className="relative mt-10 grid gap-8 xl:grid-cols-[1.15fr_.85fr] xl:items-end">
          <div>
            <p className="explorer-kicker">
              Search Everything
            </p>
            <h1 className="display-serif mt-5 max-w-5xl text-[clamp(4.1rem,8vw,8.3rem)] leading-[.84] tracking-[-.065em]">
              Find by scent.
              <span className="block text-[var(--gold-bright)]">
                Filter by intelligence.
              </span>
            </h1>
          </div>

          <div className="explorer-search-shell">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Iris office scent, woody formal, amber winter…"
              aria-label="Search fragrances"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() =>
                  setQuery("")
                }
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[310px_1fr]">
        <aside className="explorer-panel h-fit p-6 xl:sticky xl:top-5">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4"
            onClick={() =>
              setFiltersOpen(
                (value) => !value,
              )
            }
          >
            <span className="flex items-center gap-3">
              <Filter
                size={17}
                className="text-[var(--gold)]"
              />
              <span className="explorer-kicker">
                Filters
              </span>
            </span>
            {filtersOpen ? (
              <ChevronUp size={17} />
            ) : (
              <ChevronDown size={17} />
            )}
          </button>

          {filtersOpen ? (
            <div className="mt-6 space-y-5">
              <SelectFilter
                label="Brand"
                value={
                  filters.brand ?? ""
                }
                options={brands}
                onChange={(value) =>
                  updateFilter(
                    "brand",
                    value,
                  )
                }
              />
              <SelectFilter
                label="Family"
                value={
                  filters.family ?? ""
                }
                options={families}
                onChange={(value) =>
                  updateFilter(
                    "family",
                    value,
                  )
                }
              />
              <SelectFilter
                label="Concentration"
                value={
                  filters.concentration ??
                  ""
                }
                options={concentrations}
                onChange={(value) =>
                  updateFilter(
                    "concentration",
                    value,
                  )
                }
              />
              <SelectFilter
                label="Role"
                value={
                  filters.role ?? ""
                }
                options={[
                  "office",
                  "casual",
                  "date",
                  "formal",
                  "summer",
                  "winter",
                  "creative",
                  "signature",
                  "travel",
                ]}
                onChange={(value) =>
                  updateFilter(
                    "role",
                    value,
                  )
                }
              />
              <SelectFilter
                label="Season"
                value={
                  filters.season ?? ""
                }
                options={[
                  "spring",
                  "summer",
                  "fall",
                  "winter",
                ]}
                onChange={(value) =>
                  updateFilter(
                    "season",
                    value,
                  )
                }
              />
              <SelectFilter
                label="Availability"
                value={
                  filters.availabilityStatus ??
                  ""
                }
                options={[
                  "widely-available",
                  "limited",
                  "discontinued",
                  "unknown",
                ]}
                onChange={(value) =>
                  updateFilter(
                    "availabilityStatus",
                    value,
                  )
                }
              />
              <RangeFilter
                label="Minimum Quality"
                value={
                  filters.minimumDataQuality ??
                  0
                }
                onChange={(value) =>
                  updateFilter(
                    "minimumDataQuality",
                    value,
                  )
                }
              />
              <RangeFilter
                label="Minimum Longevity"
                value={
                  filters.minimumLongevity ??
                  0
                }
                onChange={(value) =>
                  updateFilter(
                    "minimumLongevity",
                    value,
                  )
                }
              />
              <RangeFilter
                label="Minimum Projection"
                value={
                  filters.minimumProjection ??
                  0
                }
                onChange={(value) =>
                  updateFilter(
                    "minimumProjection",
                    value,
                  )
                }
              />
              <RangeFilter
                label="Minimum Fresh DNA"
                value={
                  filters.minimumFreshDna ??
                  0
                }
                onChange={(value) =>
                  updateFilter(
                    "minimumFreshDna",
                    value,
                  )
                }
              />
              <RangeFilter
                label="Minimum Artistic DNA"
                value={
                  filters.minimumArtisticDna ??
                  0
                }
                onChange={(value) =>
                  updateFilter(
                    "minimumArtisticDna",
                    value,
                  )
                }
              />

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  className="explorer-secondary-action"
                  onClick={resetSearch}
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
                <button
                  type="button"
                  className="explorer-secondary-action"
                  onClick={
                    saveCurrentSearch
                  }
                >
                  <Bookmark size={14} />
                  Save
                </button>
              </div>
            </div>
          ) : null}

          {savedSearches.length ? (
            <div className="mt-7 border-t border-[var(--border)] pt-6">
              <p className="explorer-kicker">
                Saved Searches
              </p>
              <div className="mt-4 space-y-2">
                {savedSearches
                  .slice(0, 5)
                  .map((saved) => (
                    <button
                      type="button"
                      key={saved.id}
                      className="explorer-saved-search"
                      onClick={() =>
                        loadSavedSearch(
                          saved,
                        )
                      }
                    >
                      {saved.label}
                    </button>
                  ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div>
          <div className="explorer-toolbar">
            <div>
              <p className="explorer-kicker">
                Results
              </p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {results.length} matching fragrances
              </p>
            </div>

            <select
              value={sort}
              onChange={(event) =>
                setSort(
                  event.target
                    .value as ExplorerSort,
                )
              }
              className="explorer-sort"
            >
              <option value="relevance">
                Relevance
              </option>
              <option value="quality">
                Data Quality
              </option>
              <option value="longevity">
                Longevity
              </option>
              <option value="projection">
                Projection
              </option>
              <option value="newest">
                Newest
              </option>
              <option value="name">
                Name
              </option>
            </select>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {results.map(
              (result) => (
                <article
                  key={
                    result.fragrance.id
                  }
                  className="explorer-result"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[.12em] text-[var(--gold)]">
                        {
                          result.fragrance
                            .brand
                        }
                      </p>
                      <h2 className="display-serif mt-3 text-3xl">
                        {
                          result.fragrance
                            .name
                        }
                      </h2>
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
                    </div>

                    <button
                      type="button"
                      className={`explorer-compare-toggle ${
                        compareIds.includes(
                          result.fragrance
                            .id,
                        )
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() =>
                        toggleCompare(
                          result.fragrance
                            .id,
                        )
                      }
                      aria-label="Toggle comparison"
                    >
                      <GitCompareArrows
                        size={15}
                      />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {result.whyMatched.map(
                      (reason) => (
                        <span
                          key={reason}
                          className="explorer-match-chip"
                        >
                          {reason}
                        </span>
                      ),
                    )}
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-2">
                    <CardMetric
                      label="Quality"
                      value={
                        result.fragrance
                          .dataQualityScore
                      }
                    />
                    <CardMetric
                      label="Longevity"
                      value={
                        result.fragrance
                          .performance
                          .longevity
                      }
                    />
                    <CardMetric
                      label="Projection"
                      value={
                        result.fragrance
                          .performance
                          .projection
                      }
                    />
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="explorer-primary-action"
                      onClick={() =>
                        setSelectedId(
                          result.fragrance
                            .id,
                        )
                      }
                    >
                      Explore
                    </button>

                    {result.owned ? (
                      <span className="explorer-owned">
                        <Check size={14} />
                        Owned
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="explorer-secondary-action"
                        onClick={() =>
                          addFragrance(
                            result.fragrance
                              .id,
                          )
                        }
                      >
                        <Library size={14} />
                        Add
                      </button>
                    )}
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </section>

      {compared.length ? (
        <section className="mt-8 explorer-panel p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="explorer-kicker">
                Compare Mode
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Side-by-side intelligence.
              </h2>
            </div>
            <button
              type="button"
              className="explorer-secondary-action"
              onClick={() =>
                setCompareIds([])
              }
            >
              Clear Compare
            </button>
          </div>

          <div className="mt-7 overflow-x-auto">
            <table className="explorer-compare-table">
              <thead>
                <tr>
                  <th>Fragrance</th>
                  <th>Family</th>
                  <th>Longevity</th>
                  <th>Projection</th>
                  <th>Fresh</th>
                  <th>Artistic</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {compared.map(
                  (fragrance) => (
                    <tr
                      key={fragrance.id}
                    >
                      <td>
                        <strong>
                          {
                            fragrance.name
                          }
                        </strong>
                        <span>
                          {
                            fragrance.brand
                          }
                        </span>
                      </td>
                      <td>
                        {
                          fragrance.family
                        }
                      </td>
                      <td>
                        {
                          fragrance
                            .performance
                            .longevity
                        }
                      </td>
                      <td>
                        {
                          fragrance
                            .performance
                            .projection
                        }
                      </td>
                      <td>
                        {
                          fragrance.dna
                            .fresh
                        }
                      </td>
                      <td>
                        {
                          fragrance.dna
                            .artistic
                        }
                      </td>
                      <td>
                        {
                          fragrance
                            .dataQualityScore
                        }
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {selected ? (
        <ExplorerDetail
          fragrance={selected}
          owned={ownedIds.has(
            selected.id,
          )}
          onClose={() =>
            setSelectedId(null)
          }
          onAdd={() =>
            addFragrance(
              selected.id,
            )
          }
          related={getRelatedExplorerFragrances({
            candidate: selected,
            database,
          }).map(
            (item) =>
              item.fragrance,
          )}
          onSelectRelated={
            setSelectedId
          }
        />
      ) : null}
    </div>
  );
}

function ExplorerDetail({
  fragrance,
  owned,
  onClose,
  onAdd,
  related,
  onSelectRelated,
}: {
  fragrance: GlobalFragranceRecord;
  owned: boolean;
  onClose: () => void;
  onAdd: () => void;
  related: GlobalFragranceRecord[];
  onSelectRelated: (
    id: string,
  ) => void;
}) {
  return (
    <div className="explorer-detail-backdrop">
      <section className="explorer-detail">
        <button
          type="button"
          className="explorer-detail-close"
          onClick={onClose}
          aria-label="Close detail panel"
        >
          <X size={18} />
        </button>

        <p className="explorer-kicker">
          {fragrance.brand}
        </p>
        <h2 className="display-serif mt-4 text-5xl">
          {fragrance.name}
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {fragrance.concentration} ·{" "}
          {fragrance.family}
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <CardMetric
            label="Longevity"
            value={
              fragrance.performance
                .longevity
            }
          />
          <CardMetric
            label="Projection"
            value={
              fragrance.performance
                .projection
            }
          />
          <CardMetric
            label="Fresh DNA"
            value={
              fragrance.dna.fresh
            }
          />
          <CardMetric
            label="Artistic DNA"
            value={
              fragrance.dna
                .artistic
            }
          />
        </div>

        <div className="mt-7">
          <p className="explorer-kicker">
            Roles
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {fragrance.roles.map(
              (role) => (
                <span
                  key={role}
                  className="explorer-match-chip"
                >
                  {role}
                </span>
              ),
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-2">
          {owned ? (
            <span className="explorer-owned">
              <Check size={14} />
              In Collection
            </span>
          ) : (
            <button
              type="button"
              className="explorer-primary-action"
              onClick={onAdd}
            >
              <Library size={15} />
              Add to Collection
            </button>
          )}

          <Link
            href={`/deal-lab?fragrance=${fragrance.id}`}
            className="explorer-secondary-action"
          >
            <Tags size={15} />
            Deal Lab
          </Link>

          <Link
            href={`/decisions?fragrance=${fragrance.id}`}
            className="explorer-secondary-action"
          >
            <FlaskConical size={15} />
            Decision Lab
          </Link>

          <Link
            href={`/graph?fragrance=${fragrance.id}`}
            className="explorer-secondary-action"
          >
            <Sparkles size={15} />
            Knowledge Graph
          </Link>
        </div>

        <div className="mt-8">
          <LineageIntegrationCard
            fragranceId={fragrance.id}
          />
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-7">
          <p className="explorer-kicker">
            Related Fragrances
          </p>
          <div className="mt-4 space-y-2">
            {related.map((item) => (
              <button
                type="button"
                key={item.id}
                className="explorer-related"
                onClick={() =>
                  onSelectRelated(
                    item.id,
                  )
                }
              >
                <span>
                  <strong>
                    {item.name}
                  </strong>
                  <small>
                    {item.brand} ·{" "}
                    {item.family}
                  </small>
                </span>
                <span>
                  Explore
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SelectFilter({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label className="explorer-filter-field">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
      >
        <option value="">
          Any
        </option>
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function RangeFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (
    value: number,
  ) => void;
}) {
  return (
    <label className="explorer-filter-field">
      <span>
        {label} · {value}
      </span>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
      />
    </label>
  );
}

function CardMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="explorer-card-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function unique(values: string[]) {
  return [
    ...new Set(values),
  ].sort((a, b) =>
    a.localeCompare(b),
  );
}
