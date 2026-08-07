"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Crown,
  Dna,
  GitCompareArrows,
  Landmark,
  Library,
  Network,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  X,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useSearchParams,
} from "next/navigation";

import { useCollection } from "@/components/providers/collection-provider";
import { useActiveFragranceCatalog } from "@/components/providers/active-catalog-provider";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import {
  analyzeBrandIntelligence,
  compareBrands,
  searchAndSortBrands,
  type BrandIntelligenceProfile,
} from "@/lib/intelligence/brand-intelligence-engine";

const dnaOrder = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
] as const;

export default function BrandsClient() {
  const searchParams =
    useSearchParams();
  const { items } = useCollection();

  const {
    catalog,
    importedIds,
    readinessById,
    isHydrated: catalogHydrated,
  } = useActiveFragranceCatalog();
  const [query, setQuery] =
    useState("");
  const [sort, setSort] =
    useState<
      | "name"
      | "quality"
      | "performance"
      | "artistic"
      | "coverage"
    >("name");
  const [selectedId, setSelectedId] =
    useState<string | null>(null);
  const [compareIds, setCompareIds] =
    useState<string[]>([]);

  const database = useMemo(
    () =>
      buildGlobalFragranceDatabase({
        catalog,
      }),
    [catalog],
  );

  const intelligence = useMemo(
    () =>
      analyzeBrandIntelligence({
        database,
        collection: items,
      }),
    [database, items],
  );

  const brands = useMemo(
    () =>
      searchAndSortBrands({
        brands:
          intelligence.brands,
        query,
        sort,
      }),
    [
      intelligence.brands,
      query,
      sort,
    ],
  );

  const selected =
    selectedId
      ? intelligence.brands.find(
          (brand) =>
            brand.brandId ===
            selectedId,
        ) ?? null
      : null;

  const compared =
    compareIds
      .map((id) =>
        intelligence.brands.find(
          (brand) =>
            brand.brandId === id,
        ),
      )
      .filter(Boolean) as
      BrandIntelligenceProfile[];

  const comparison =
    compareBrands(compared);

  useEffect(() => {
    const requested =
      searchParams.get("brand");

    if (!requested) return;

    const match =
      intelligence.brands.find(
        (brand) =>
          brand.brandId ===
            requested ||
          brand.name
            .toLowerCase() ===
            requested.toLowerCase(),
      );

    if (match) {
      setSelectedId(
        match.brandId,
      );
      setQuery(
        match.name,
      );
    }
  }, [
    intelligence.brands,
    searchParams,
  ]);

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
    <div className="brands-page pb-12">
      <section className="brands-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="brands-grid pointer-events-none absolute inset-0" />
        <div className="brands-aura pointer-events-none absolute -right-48 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="brands-mark">
              <Landmark size={18} />
            </span>
            <div>
              <p className="brands-kicker">
                OLFACTUS Brand Intelligence
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Brand portfolios, DNA, performance, and collection fit · BIO-1.0.0
              </p>
            </div>
          </div>
          <span className="brands-status-chip">
            {brands.length} brand
            {brands.length === 1
              ? ""
              : "s"}
          </span>
        </div>

        <div className="relative mt-10 grid gap-10 xl:grid-cols-[1.1fr_.9fr] xl:items-end">
          <div>
            <p className="brands-kicker">
              BRAND-OS 1.0
            </p>
            <h1 className="display-serif mt-5 max-w-5xl text-[clamp(4.1rem,8vw,8.4rem)] leading-[.84] tracking-[-.065em]">
              Understand the house.
              <span className="block text-[var(--gold-bright)]">
                Not just the bottle.
              </span>
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Every fragrance house becomes an intelligence
              dossier built from its portfolio, DNA,
              performance, collection coverage, and market
              position.
            </p>
          </div>

          <div className="brands-search-shell">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Search brands, categories, identities…"
              aria-label="Search brands"
            />
            {query ? (
              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
                aria-label="Clear brand search"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 brands-toolbar">
        <div>
          <p className="brands-kicker">
            Brand Directory
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Aggregated from the normalized global database.
          </p>
        </div>
        <select
          value={sort}
          onChange={(event) =>
            setSort(
              event.target
                .value as typeof sort,
            )
          }
          className="brands-sort"
        >
          <option value="name">
            Alphabetical
          </option>
          <option value="quality">
            Data Quality
          </option>
          <option value="performance">
            Performance
          </option>
          <option value="artistic">
            Artistic Score
          </option>
          <option value="coverage">
            Collection Coverage
          </option>
        </select>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {brands.map((brand) => (
          <article
            key={brand.brandId}
            className="brand-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[.12em] text-[var(--gold)]">
                  {brand.category}
                </p>
                <h2 className="display-serif mt-3 text-4xl">
                  {brand.name}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {brand.fragranceCount} fragrance
                  {brand.fragranceCount === 1
                    ? ""
                    : "s"}{" "}
                  · {brand.perfumerCount} perfumer
                  {brand.perfumerCount === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              <button
                type="button"
                className={`brand-compare-toggle ${
                  compareIds.includes(
                    brand.brandId,
                  )
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  toggleCompare(
                    brand.brandId,
                  )
                }
                aria-label="Toggle brand comparison"
              >
                <GitCompareArrows
                  size={15}
                />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <CardMetric
                label="Quality"
                value={
                  brand.averageDataQuality
                }
              />
              <CardMetric
                label="Longevity"
                value={
                  brand.averageLongevity
                }
              />
              <CardMetric
                label="Artistic"
                value={
                  brand.averageArtistic
                }
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <p className="brands-kicker">
                  Coverage
                </p>
                <p className="text-sm text-[var(--gold-bright)]">
                  {brand.collectionOwnedCount} owned ·{" "}
                  {brand.collectionCoverage}%
                </p>
              </div>
              <div className="brand-coverage-bar mt-3">
                <span
                  style={{
                    width: `${brand.collectionCoverage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {brand.identity
                .slice(0, 4)
                .map((trait) => (
                  <span
                    key={trait}
                    className="brand-identity-chip"
                  >
                    {trait}
                  </span>
                ))}
            </div>

            <button
              type="button"
              className="brand-primary-action mt-7 w-full"
              onClick={() =>
                setSelectedId(
                  brand.brandId,
                )
              }
            >
              Explore Brand
              <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </section>

      {compared.length > 1 ? (
        <section className="mt-8 brands-panel p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="brands-kicker">
                Brand Comparison
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Compare entire houses.
              </h2>
            </div>
            <button
              type="button"
              className="brand-secondary-action"
              onClick={() =>
                setCompareIds([])
              }
            >
              Clear Comparison
            </button>
          </div>

          <div className="mt-7 overflow-x-auto">
            <table className="brand-compare-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {compared.map(
                    (brand) => (
                      <th
                        key={
                          brand.brandId
                        }
                      >
                        {brand.name}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {comparison.map(
                  (row) => (
                    <tr key={row.metric}>
                      <td>{row.metric}</td>
                      {compared.map(
                        (brand) => (
                          <td
                            key={
                              brand.brandId
                            }
                          >
                            {
                              row.values[
                                brand.brandId
                              ]
                            }
                          </td>
                        ),
                      )}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {selected ? (
        <BrandDossier
          brand={selected}
          onClose={() =>
            setSelectedId(null)
          }
        />
      ) : null}
    </div>
  );
}

function BrandDossier({
  brand,
  onClose,
}: {
  brand: BrandIntelligenceProfile;
  onClose: () => void;
}) {
  return (
    <div className="brand-dossier-backdrop">
      <section className="brand-dossier">
        <button
          type="button"
          className="brand-dossier-close"
          onClick={onClose}
          aria-label="Close brand dossier"
        >
          <X size={18} />
        </button>

        <p className="brands-kicker">
          {brand.category}
        </p>
        <h2 className="display-serif mt-4 text-6xl">
          {brand.name}
        </h2>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {brand.fragranceCount} fragrances ·{" "}
          {brand.perfumerCount} perfumers ·{" "}
          {brand.collectionCoverage}% collection coverage
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <CardMetric
            label="Longevity"
            value={
              brand.averageLongevity
            }
          />
          <CardMetric
            label="Projection"
            value={
              brand.averageProjection
            }
          />
          <CardMetric
            label="Versatility"
            value={
              brand.versatilityScore
            }
          />
          <CardMetric
            label="Data Quality"
            value={
              brand.averageDataQuality
            }
          />
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <Dna
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="brands-kicker">
              Brand DNA
            </p>
          </div>
          <div className="mt-5 space-y-4">
            {dnaOrder.map(
              (dimension) => (
                <div key={dimension}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="capitalize">
                      {dimension}
                    </p>
                    <p className="display-serif text-2xl text-[var(--gold-bright)]">
                      {
                        brand.dna[
                          dimension
                        ]
                      }
                    </p>
                  </div>
                  <div className="brand-dna-bar mt-2">
                    <span
                      style={{
                        width: `${brand.dna[dimension]}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <Star
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="brands-kicker">
              Signature Releases
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {brand.signatureFragrances.map(
              (fragrance) => (
                <div
                  key={fragrance.id}
                  className="brand-signature-row"
                >
                  <span>
                    <strong>
                      {fragrance.name}
                    </strong>
                    <small>
                      {fragrance.concentration} ·{" "}
                      {fragrance.family}
                    </small>
                  </span>
                  <Link
                    href={`/explorer?fragrance=${fragrance.id}`}
                  >
                    Explore
                  </Link>
                </div>
              ),
            )}
          </div>
        </div>

        {brand.nextPurchase ? (
          <div className="mt-8 brand-next-purchase">
            <div className="flex items-center gap-3">
              <Sparkles
                size={17}
                className="text-[var(--gold)]"
              />
              <p className="brands-kicker">
                Best Next Addition
              </p>
            </div>
            <p className="display-serif mt-5 text-4xl">
              {brand.nextPurchase.name}
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {
                brand.nextPurchase
                  .reason
              }
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <CardMetric
                label="Confidence"
                value={
                  brand.nextPurchase
                    .confidence
                }
              />
              <CardMetric
                label="Overlap"
                value={
                  brand.nextPurchase
                    .overlap
                }
              />
              <CardMetric
                label="Role Gain"
                value={
                  brand.nextPurchase
                    .roleGain
                }
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link
                href={`/deal-lab?fragrance=${brand.nextPurchase.fragranceId}`}
                className="brand-primary-action"
              >
                Deal Lab
              </Link>
              <Link
                href={`/graph?fragrance=${brand.nextPurchase.fragranceId}`}
                className="brand-secondary-action"
              >
                <Network size={15} />
                Connections
              </Link>
              <Link
                href={`/lineage?brand=${encodeURIComponent(
                  brand.name,
                )}&fragrance=${brand.nextPurchase.fragranceId}`}
                className="brand-secondary-action"
              >
                <GitCompareArrows size={15} />
                Browse Lineage
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <TrendingUp
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="brands-kicker">
              Release Timeline
            </p>
          </div>
          {brand.timeline.length ? (
            <div className="mt-4 space-y-2">
              {brand.timeline.map(
                (entry) => (
                  <div
                    key={`${entry.year}-${entry.fragranceId}`}
                    className="brand-timeline-row"
                  >
                    <span className="display-serif text-2xl text-[var(--gold-bright)]">
                      {entry.year}
                    </span>
                    <span>
                      <strong>
                        {
                          entry.fragranceName
                        }
                      </strong>
                      <small>
                        {
                          entry.description
                        }
                      </small>
                    </span>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Release-year data is still calibrating for this brand.
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <PositionMetric
            icon={<Crown size={16} />}
            label="Luxury"
            value={
              brand.marketPosition
                .luxury
            }
          />
          <PositionMetric
            icon={<Sparkles size={16} />}
            label="Originality"
            value={
              brand.marketPosition
                .originality
            }
          />
          <PositionMetric
            icon={<BarChart3 size={16} />}
            label="Performance"
            value={
              brand.marketPosition
                .performance
            }
          />
          <PositionMetric
            icon={<Library size={16} />}
            label="Value"
            value={
              brand.marketPosition
                .value
            }
          />
        </div>
      </section>
    </div>
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
    <div className="brand-card-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function PositionMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="brand-position-metric">
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}
