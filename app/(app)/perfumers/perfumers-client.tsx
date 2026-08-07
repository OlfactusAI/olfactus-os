"use client";

import Link from "next/link";
import {
  ArrowRight,
  Atom,
  Brush,
  Check,
  Dna,
  GitCompareArrows,
  Library,
  Network,
  Search,
  Sparkles,
  Star,
  UsersRound,
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
  analyzePerfumerIntelligence,
  comparePerfumers,
  searchAndSortPerfumers,
  type PerfumerIntelligenceProfile,
} from "@/lib/intelligence/perfumer-intelligence-engine";

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

export default function PerfumersClient() {
  const searchParams =
    useSearchParams();
  const { items } =
    useCollection();

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
      | "influence"
      | "artistic"
      | "performance"
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
      analyzePerfumerIntelligence({
        database,
        collection: items,
      }),
    [database, items],
  );

  const profiles = useMemo(
    () =>
      searchAndSortPerfumers({
        profiles:
          intelligence.profiles,
        query,
        sort,
      }),
    [
      intelligence.profiles,
      query,
      sort,
    ],
  );

  const selected =
    selectedId
      ? intelligence.profiles.find(
          (profile) =>
            profile.perfumerId ===
            selectedId,
        ) ?? null
      : null;

  const compared =
    compareIds
      .map((id) =>
        intelligence.profiles.find(
          (profile) =>
            profile.perfumerId === id,
        ),
      )
      .filter(
        (
          profile,
        ): profile is PerfumerIntelligenceProfile =>
          Boolean(profile),
      );

  const comparison =
    comparePerfumers(compared);

  useEffect(() => {
    const requested =
      searchParams.get(
        "perfumer",
      );

    if (!requested) return;

    const match =
      intelligence.profiles.find(
        (profile) =>
          profile.perfumerId ===
            requested ||
          profile.name
            .toLowerCase() ===
            requested.toLowerCase(),
      );

    if (match) {
      setSelectedId(
        match.perfumerId,
      );
      setQuery(
        match.name,
      );
    }
  }, [
    intelligence.profiles,
    searchParams,
  ]);

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (value) =>
            value !== id,
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
    <div className="perfumers-page pb-12">
      <section className="perfumers-hero relative overflow-hidden rounded-[38px] border border-[rgba(232,200,127,.24)] p-6 sm:p-10 xl:p-14">
        <div className="perfumers-grid pointer-events-none absolute inset-0" />
        <div className="perfumers-aura pointer-events-none absolute -right-48 -top-48 h-[760px] w-[760px] rounded-full" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="perfumers-mark">
              <Brush size={18} />
            </span>
            <div>
              <p className="perfumers-kicker">
                OLFACTUS Perfumer Intelligence
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Creative portfolios, signature DNA, and collection fit · PIO-1.0.0
              </p>
            </div>
          </div>
          <span className="perfumers-status-chip">
            {profiles.length} curated creator
            {profiles.length === 1
              ? ""
              : "s"}
          </span>
        </div>

        <div className="relative mt-10 grid gap-10 xl:grid-cols-[1.1fr_.9fr] xl:items-end">
          <div>
            <p className="perfumers-kicker">
              CREATOR-OS 1.0
            </p>
            <h1 className="display-serif mt-5 max-w-5xl text-[clamp(4.1rem,8vw,8.4rem)] leading-[.84] tracking-[-.065em]">
              Follow the creator.
              <span className="block text-[var(--gold-bright)]">
                Discover the signature.
              </span>
            </h1>
            <p className="mt-7 max-w-3xl text-base leading-8 text-[var(--muted)] sm:text-lg">
              Explore each perfumer through the catalog,
              brands, families, DNA patterns, performance, and
              collection opportunities connected to their work.
            </p>
          </div>

          <div className="perfumers-search-shell">
            <Search size={20} />
            <input
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value,
                )
              }
              placeholder="Search perfumers, brands, families…"
              aria-label="Search perfumers"
            />
            {query ? (
              <button
                type="button"
                onClick={() =>
                  setQuery("")
                }
                aria-label="Clear perfumer search"
              >
                <X size={16} />
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-8 perfumers-toolbar">
        <div>
          <p className="perfumers-kicker">
            Perfumer Directory
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Curated attributions only. Undisclosed credits remain unassigned.
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
          className="perfumers-sort"
        >
          <option value="name">
            Alphabetical
          </option>
          <option value="influence">
            Influence
          </option>
          <option value="artistic">
            Artistic Score
          </option>
          <option value="performance">
            Performance
          </option>
          <option value="coverage">
            Collection Coverage
          </option>
        </select>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {profiles.map((profile) => (
          <article
            key={profile.perfumerId}
            className="perfumer-card"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[.12em] text-[var(--gold)]">
                  Perfumer Intelligence
                </p>
                <h2 className="display-serif mt-3 text-4xl">
                  {profile.name}
                </h2>
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {profile.fragranceCount} curated credit
                  {profile.fragranceCount === 1
                    ? ""
                    : "s"}{" "}
                  · {profile.brandCount} brand
                  {profile.brandCount === 1
                    ? ""
                    : "s"}
                </p>
              </div>

              <button
                type="button"
                className={`perfumer-compare-toggle ${
                  compareIds.includes(
                    profile.perfumerId,
                  )
                    ? "is-active"
                    : ""
                }`}
                onClick={() =>
                  toggleCompare(
                    profile.perfumerId,
                  )
                }
                aria-label="Toggle perfumer comparison"
              >
                <GitCompareArrows
                  size={15}
                />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <PerfumerMetric
                label="Influence"
                value={
                  profile.influenceScore
                }
              />
              <PerfumerMetric
                label="Artistic"
                value={
                  profile.averageArtistic
                }
              />
              <PerfumerMetric
                label="Versatility"
                value={
                  profile.versatilityScore
                }
              />
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between gap-4">
                <p className="perfumers-kicker">
                  Collection Coverage
                </p>
                <p className="text-sm text-[var(--gold-bright)]">
                  {profile.collectionOwnedCount} owned ·{" "}
                  {profile.collectionCoverage}%
                </p>
              </div>
              <div className="perfumer-coverage-bar mt-3">
                <span
                  style={{
                    width: `${profile.collectionCoverage}%`,
                  }}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {profile.identity
                .slice(0, 4)
                .map((trait) => (
                  <span
                    key={trait}
                    className="perfumer-identity-chip"
                  >
                    {trait}
                  </span>
                ))}
            </div>

            <div className="mt-6">
              <p className="perfumers-kicker">
                Brands
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {profile.brands.join(
                  " · ",
                )}
              </p>
            </div>

            <button
              type="button"
              className="perfumer-primary-action mt-7 w-full"
              onClick={() =>
                setSelectedId(
                  profile.perfumerId,
                )
              }
            >
              Open Creator Dossier
              <ArrowRight size={15} />
            </button>
          </article>
        ))}
      </section>

      {intelligence.undisclosedFragranceIds
        .length ? (
        <section className="mt-8 perfumers-disclosure">
          <Atom size={18} />
          <div>
            <p className="perfumers-kicker">
              Attribution Integrity
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              {intelligence.undisclosedFragranceIds.length} catalog record
              {intelligence.undisclosedFragranceIds.length === 1
                ? ""
                : "s"}{" "}
              remain intentionally unassigned rather than receiving speculative credits.
            </p>
          </div>
        </section>
      ) : null}

      {compared.length > 1 ? (
        <section className="mt-8 perfumers-panel p-7 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="perfumers-kicker">
                Perfumer Comparison
              </p>
              <h2 className="display-serif mt-3 text-4xl">
                Compare creative signatures.
              </h2>
            </div>
            <button
              type="button"
              className="perfumer-secondary-action"
              onClick={() =>
                setCompareIds([])
              }
            >
              Clear Comparison
            </button>
          </div>

          <div className="mt-7 overflow-x-auto">
            <table className="perfumer-compare-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {compared.map(
                    (profile) => (
                      <th
                        key={
                          profile.perfumerId
                        }
                      >
                        {profile.name}
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
                        (profile) => (
                          <td
                            key={
                              profile.perfumerId
                            }
                          >
                            {
                              row.values[
                                profile.perfumerId
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
        <PerfumerDossier
          profile={selected}
          onClose={() =>
            setSelectedId(null)
          }
        />
      ) : null}
    </div>
  );
}

function PerfumerDossier({
  profile,
  onClose,
}: {
  profile: PerfumerIntelligenceProfile;
  onClose: () => void;
}) {
  return (
    <div className="perfumer-dossier-backdrop">
      <section className="perfumer-dossier">
        <button
          type="button"
          className="perfumer-dossier-close"
          onClick={onClose}
          aria-label="Close perfumer dossier"
        >
          <X size={18} />
        </button>

        <p className="perfumers-kicker">
          Perfumer Dossier
        </p>
        <h2 className="display-serif mt-4 text-6xl">
          {profile.name}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
          {profile.fragranceCount} curated fragrance credit
          {profile.fragranceCount === 1
            ? ""
            : "s"}{" "}
          across {profile.brandCount} brand
          {profile.brandCount === 1
            ? ""
            : "s"}.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <PerfumerMetric
            label="Influence"
            value={
              profile.influenceScore
            }
          />
          <PerfumerMetric
            label="Innovation"
            value={
              profile.innovationScore
            }
          />
          <PerfumerMetric
            label="Longevity"
            value={
              profile.averageLongevity
            }
          />
          <PerfumerMetric
            label="Projection"
            value={
              profile.averageProjection
            }
          />
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <Dna
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="perfumers-kicker">
              Signature DNA
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
                        profile.dna[
                          dimension
                        ]
                      }
                    </p>
                  </div>
                  <div className="perfumer-dna-bar mt-2">
                    <span
                      style={{
                        width: `${profile.dna[dimension]}%`,
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
            <p className="perfumers-kicker">
              Portfolio Credits
            </p>
          </div>
          <div className="mt-4 space-y-2">
            {profile.credits.map(
              ({ fragrance, attributionConfidence }) => (
                <div
                  key={fragrance.id}
                  className="perfumer-credit-row"
                >
                  <span>
                    <strong>
                      {fragrance.name}
                    </strong>
                    <small>
                      {fragrance.brand} ·{" "}
                      {fragrance.family} · Attribution {attributionConfidence}
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

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <HighlightCard
            label="Most Artistic"
            fragrance={
              profile.mostArtistic
            }
          />
          <HighlightCard
            label="Most Versatile"
            fragrance={
              profile.mostVersatile
            }
          />
          <HighlightCard
            label="Most Influential"
            fragrance={
              profile.mostInfluential
            }
          />
        </div>

        <div className="mt-8">
          <div className="flex items-center gap-3">
            <UsersRound
              size={17}
              className="text-[var(--gold)]"
            />
            <p className="perfumers-kicker">
              Creative Network
            </p>
          </div>
          <div className="mt-4 perfumer-network">
            <div className="perfumer-network-center">
              <Brush size={17} />
              <span>{profile.name}</span>
            </div>
            <div className="perfumer-network-links">
              {profile.brands.map(
                (brand) => (
                  <span key={brand}>
                    {brand}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <p className="perfumers-kicker">
            Recurring Creative Themes
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {profile.recurringThemes.map(
              ({ theme, count }) => (
                <span
                  key={theme}
                  className="perfumer-identity-chip"
                >
                  {theme} · {count}
                </span>
              ),
            )}
          </div>
          {!profile.recurringNotes.length &&
          !profile.recurringAccords.length ? (
            <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
              Structured note and accord recurrence will expand as verified material metadata is added to the global database.
            </p>
          ) : null}
        </div>

        {profile.recommendation ? (
          <div className="mt-8 perfumer-recommendation">
            <div className="flex items-center gap-3">
              <Sparkles
                size={17}
                className="text-[var(--gold)]"
              />
              <p className="perfumers-kicker">
                Best Next Work
              </p>
            </div>
            <p className="display-serif mt-5 text-4xl">
              {
                profile.recommendation
                  .name
              }
            </p>
            <p className="mt-2 text-sm text-[var(--gold)]">
              {
                profile.recommendation
                  .brand
              }
            </p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              {
                profile.recommendation
                  .reason
              }
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <PerfumerMetric
                label="Confidence"
                value={
                  profile.recommendation
                    .confidence
                }
              />
              <PerfumerMetric
                label="Overlap"
                value={
                  profile.recommendation
                    .overlap
                }
              />
              <PerfumerMetric
                label="Role Gain"
                value={
                  profile.recommendation
                    .roleGain
                }
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link
                href={`/deal-lab?fragrance=${profile.recommendation.fragranceId}`}
                className="perfumer-primary-action"
              >
                Deal Lab
              </Link>
              <Link
                href={`/graph?fragrance=${profile.recommendation.fragranceId}`}
                className="perfumer-secondary-action"
              >
                <Network size={15} />
                Connections
              </Link>
              <Link
                href={`/lineage?perfumer=${encodeURIComponent(
                  profile.name,
                )}&fragrance=${profile.recommendation.fragranceId}`}
                className="perfumer-secondary-action"
              >
                <GitCompareArrows size={15} />
                Browse Lineage
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 perfumer-complete-card">
            <Check size={18} />
            <div>
              <p className="perfumers-kicker">
                Portfolio Complete
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
                Every currently curated work by this perfumer is already represented in your collection.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function PerfumerMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="perfumer-metric">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function HighlightCard({
  label,
  fragrance,
}: {
  label: string;
  fragrance:
    | PerfumerIntelligenceProfile["mostArtistic"]
    | null;
}) {
  return (
    <article className="perfumer-highlight">
      <p className="perfumers-kicker">
        {label}
      </p>
      <p className="display-serif mt-3 text-2xl">
        {fragrance?.name ??
          "Calibrating"}
      </p>
      <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
        {fragrance
          ? `${fragrance.brand} · ${fragrance.family}`
          : "More portfolio data is needed."}
      </p>
    </article>
  );
}
