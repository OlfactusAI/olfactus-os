import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  DnaDimension,
} from "@/lib/domain/fragrance";
import type {
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
} from "@/lib/database/schema";
import {
  curatedPerfumerAttributions,
} from "@/lib/data/perfumer-attributions";
import {
  createEntityId,
} from "@/lib/database/normalization";

export interface PerfumerPortfolioCredit {
  fragrance: GlobalFragranceRecord;
  attributionConfidence: number;
}

export interface PerfumerRecommendation {
  fragranceId: string;
  name: string;
  brand: string;
  confidence: number;
  overlap: number;
  roleGain: number;
  reason: string;
}

export interface PerfumerCollaborator {
  name: string;
  sharedCreditCount: number;
}

export interface PerfumerIntelligenceProfile {
  perfumerId: string;
  name: string;
  fragranceCount: number;
  brandCount: number;
  brands: string[];
  families: Array<{
    family: string;
    count: number;
  }>;
  recurringThemes: Array<{
    theme: string;
    count: number;
  }>;
  recurringNotes: Array<{
    note: string;
    count: number;
  }>;
  recurringAccords: Array<{
    accord: string;
    count: number;
  }>;
  averageLongevity: number;
  averageProjection: number;
  averageArtistic: number;
  averageDataQuality: number;
  versatilityScore: number;
  innovationScore: number;
  influenceScore: number;
  collectionOwnedCount: number;
  collectionCoverage: number;
  dna: Record<DnaDimension, number>;
  identity: string[];
  credits: PerfumerPortfolioCredit[];
  mostArtistic: GlobalFragranceRecord | null;
  mostVersatile: GlobalFragranceRecord | null;
  mostInfluential: GlobalFragranceRecord | null;
  recommendation: PerfumerRecommendation | null;
  collaborators: PerfumerCollaborator[];
}

export interface PerfumerComparisonRow {
  metric: string;
  values: Record<string, number>;
}

export interface PerfumerIntelligenceOutput {
  modelVersion: "PIO-1.0.0";
  generatedAt: string;
  profiles: PerfumerIntelligenceProfile[];
  undisclosedFragranceIds: string[];
}

const dnaDimensions: DnaDimension[] = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
];

export function analyzePerfumerIntelligence({
  database,
  collection,
}: {
  database: GlobalFragranceDatabase;
  collection: CollectionItem[];
}): PerfumerIntelligenceOutput {
  const ownedIds = new Set(
    collection.map(
      (item) => item.fragranceId,
    ),
  );

  const attributionByFragrance =
    new Map(
      curatedPerfumerAttributions.map(
        (item) => [
          item.fragranceId,
          item,
        ],
      ),
    );

  const names = [
    ...new Set(
      curatedPerfumerAttributions.flatMap(
        (item) => item.perfumers,
      ),
    ),
  ];

  const profiles = names
    .map((name) => {
      const perfumerId =
        createEntityId(
          "perfumer",
          name,
        );

      const credits =
        database.fragrances
          .filter((fragrance) =>
            attributionByFragrance
              .get(fragrance.id)
              ?.perfumers.includes(name),
          )
          .map((fragrance) => ({
            fragrance,
            attributionConfidence:
              attributionByFragrance.get(
                fragrance.id,
              )?.confidence ?? 0,
          }));

      return buildProfile({
        perfumerId,
        name,
        credits,
        database,
        ownedIds,
      });
    })
    .sort(
      (a, b) =>
        b.fragranceCount -
          a.fragranceCount ||
        b.influenceScore -
          a.influenceScore ||
        a.name.localeCompare(b.name),
    );

  return {
    modelVersion: "PIO-1.0.0",
    generatedAt:
      new Date().toISOString(),
    profiles,
    undisclosedFragranceIds:
      curatedPerfumerAttributions
        .filter(
          (item) =>
            item.status ===
            "undisclosed",
        )
        .map(
          (item) =>
            item.fragranceId,
        ),
  };
}

export function searchAndSortPerfumers({
  profiles,
  query,
  sort,
}: {
  profiles: PerfumerIntelligenceProfile[];
  query: string;
  sort:
    | "name"
    | "influence"
    | "artistic"
    | "performance"
    | "coverage";
}) {
  const normalized =
    query.trim().toLowerCase();

  const filtered = profiles.filter(
    (profile) =>
      !normalized ||
      profile.name
        .toLowerCase()
        .includes(normalized) ||
      profile.brands.some(
        (brand) =>
          brand
            .toLowerCase()
            .includes(normalized),
      ) ||
      profile.families.some(
        ({ family }) =>
          family
            .toLowerCase()
            .includes(normalized),
      ) ||
      profile.identity.some(
        (trait) =>
          trait
            .toLowerCase()
            .includes(normalized),
      ),
  );

  return [...filtered].sort(
    (a, b) => {
      if (sort === "influence") {
        return (
          b.influenceScore -
          a.influenceScore
        );
      }
      if (sort === "artistic") {
        return (
          b.averageArtistic -
          a.averageArtistic
        );
      }
      if (sort === "performance") {
        return (
          b.averageLongevity +
            b.averageProjection -
          (a.averageLongevity +
            a.averageProjection)
        );
      }
      if (sort === "coverage") {
        return (
          b.collectionCoverage -
          a.collectionCoverage
        );
      }
      return a.name.localeCompare(
        b.name,
      );
    },
  );
}

export function comparePerfumers(
  profiles: PerfumerIntelligenceProfile[],
): PerfumerComparisonRow[] {
  const metrics = [
    {
      label: "Artistic",
      read: (
        item: PerfumerIntelligenceProfile,
      ) =>
        item.averageArtistic,
    },
    {
      label: "Versatility",
      read: (
        item: PerfumerIntelligenceProfile,
      ) =>
        item.versatilityScore,
    },
    {
      label: "Longevity",
      read: (
        item: PerfumerIntelligenceProfile,
      ) =>
        item.averageLongevity,
    },
    {
      label: "Projection",
      read: (
        item: PerfumerIntelligenceProfile,
      ) =>
        item.averageProjection,
    },
    {
      label: "Innovation",
      read: (
        item: PerfumerIntelligenceProfile,
      ) =>
        item.innovationScore,
    },
    {
      label: "Influence",
      read: (
        item: PerfumerIntelligenceProfile,
      ) =>
        item.influenceScore,
    },
    {
      label: "Data Quality",
      read: (
        item: PerfumerIntelligenceProfile,
      ) =>
        item.averageDataQuality,
    },
    {
      label: "Collection Coverage",
      read: (
        item: PerfumerIntelligenceProfile,
      ) =>
        item.collectionCoverage,
    },
  ];

  return metrics.map(
    (metric) => ({
      metric: metric.label,
      values: Object.fromEntries(
        profiles.map((profile) => [
          profile.perfumerId,
          metric.read(profile),
        ]),
      ),
    }),
  );
}

function buildProfile({
  perfumerId,
  name,
  credits,
  database,
  ownedIds,
}: {
  perfumerId: string;
  name: string;
  credits: PerfumerPortfolioCredit[];
  database: GlobalFragranceDatabase;
  ownedIds: Set<string>;
}): PerfumerIntelligenceProfile {
  const fragrances =
    credits.map(
      ({ fragrance }) =>
        fragrance,
    );

  const brands = [
    ...new Set(
      fragrances.map(
        (fragrance) =>
          fragrance.brand,
      ),
    ),
  ].sort();

  const families =
    countValues(
      fragrances.map(
        (fragrance) =>
          fragrance.family,
      ),
    ).map(
      ([family, count]) => ({
        family,
        count,
      }),
    );

  const recurringThemes =
    countValues(
      fragrances.flatMap(
        (fragrance) => [
          fragrance.family,
          ...fragrance.moods,
          ...fragrance.roles,
        ],
      ),
    )
      .map(([theme, count]) => ({
        theme,
        count,
      }))
      .slice(0, 8);

  const noteNames =
    new Map(
      database.notes.map(
        (note) => [
          note.id,
          note.canonicalName,
        ],
      ),
    );
  const accordNames =
    new Map(
      database.accords.map(
        (accord) => [
          accord.id,
          accord.canonicalName,
        ],
      ),
    );

  const recurringNotes =
    countValues(
      fragrances.flatMap(
        (fragrance) => [
          ...fragrance.noteIds.top,
          ...fragrance.noteIds.heart,
          ...fragrance.noteIds.base,
        ].map(
          (id) =>
            noteNames.get(id) ?? id,
        ),
      ),
    )
      .map(([note, count]) => ({
        note,
        count,
      }))
      .slice(0, 8);

  const recurringAccords =
    countValues(
      fragrances.flatMap(
        (fragrance) =>
          fragrance.accordIds.map(
            (id) =>
              accordNames.get(id) ??
              id,
          ),
      ),
    )
      .map(([accord, count]) => ({
        accord,
        count,
      }))
      .slice(0, 8);

  const dna = Object.fromEntries(
    dnaDimensions.map(
      (dimension) => [
        dimension,
        average(
          fragrances.map(
            (fragrance) =>
              fragrance.dna[
                dimension
              ],
          ),
        ),
      ],
    ),
  ) as Record<DnaDimension, number>;

  const averageLongevity =
    average(
      fragrances.map(
        (fragrance) =>
          fragrance.performance
            .longevity,
      ),
    );
  const averageProjection =
    average(
      fragrances.map(
        (fragrance) =>
          fragrance.performance
            .projection,
      ),
    );
  const averageArtistic =
    average(
      fragrances.map(
        (fragrance) =>
          fragrance.dna.artistic,
      ),
    );
  const averageDataQuality =
    average(
      fragrances.map(
        (fragrance) =>
          fragrance.dataQualityScore,
      ),
    );

  const versatilityScore =
    average(
      fragrances.map(
        (fragrance) =>
          average([
            ...Object.values(
              fragrance.seasons,
            ),
            fragrance.roles.length *
              12,
          ]),
      ),
    );

  const innovationScore =
    Math.round(
      average([
        averageArtistic,
        average(
          fragrances.map(
            (fragrance) =>
              dnaSpread(
                fragrance.dna,
              ),
          ),
        ),
      ]),
    );

  const influenceScore =
    Math.min(
      100,
      Math.round(
        average([
          averageArtistic,
          averageDataQuality,
          versatilityScore,
          Math.min(
            100,
            fragrances.length * 16,
          ),
          Math.min(
            100,
            brands.length * 18,
          ),
        ]),
      ),
    );

  const ownedCount =
    fragrances.filter(
      (fragrance) =>
        ownedIds.has(fragrance.id),
    ).length;

  const mostArtistic =
    rankOne(
      fragrances,
      (item) =>
        item.dna.artistic,
    );

  const mostVersatile =
    rankOne(
      fragrances,
      (item) =>
        average([
          ...Object.values(
            item.seasons,
          ),
          item.roles.length * 12,
        ]),
    );

  const mostInfluential =
    rankOne(
      fragrances,
      (item) =>
        item.dna.artistic *
          0.3 +
        item.performance
          .longevity *
          0.22 +
        item.performance
          .projection *
          0.14 +
        item.dataQualityScore *
          0.2 +
        item.roles.length * 4,
    );

  return {
    perfumerId,
    name,
    fragranceCount:
      fragrances.length,
    brandCount: brands.length,
    brands,
    families,
    recurringThemes,
    recurringNotes,
    recurringAccords,
    averageLongevity,
    averageProjection,
    averageArtistic,
    averageDataQuality,
    versatilityScore,
    innovationScore,
    influenceScore,
    collectionOwnedCount:
      ownedCount,
    collectionCoverage:
      fragrances.length
        ? Math.round(
            (ownedCount /
              fragrances.length) *
              100,
          )
        : 0,
    dna,
    identity:
      buildIdentity({
        dna,
        averageLongevity,
        averageProjection,
        versatilityScore,
      }),
    credits,
    mostArtistic,
    mostVersatile,
    mostInfluential,
    recommendation:
      chooseRecommendation({
        fragrances,
        ownedIds,
      }),
    collaborators: [],
  };
}

function chooseRecommendation({
  fragrances,
  ownedIds,
}: {
  fragrances: GlobalFragranceRecord[];
  ownedIds: Set<string>;
}): PerfumerRecommendation | null {
  const owned =
    fragrances.filter(
      (item) =>
        ownedIds.has(item.id),
    );
  const candidates =
    fragrances.filter(
      (item) =>
        !ownedIds.has(item.id),
    );

  const ownedRoles = new Set(
    owned.flatMap(
      (item) =>
        item.roles,
    ),
  );

  const ranked = candidates
    .map((candidate) => {
      const overlap =
        owned.length
          ? average(
              owned.map(
                (item) =>
                  dnaSimilarity(
                    candidate,
                    item,
                  ),
              ),
            )
          : 0;

      const roleGain =
        candidate.roles.filter(
          (role) =>
            !ownedRoles.has(role),
        ).length;

      const score = Math.round(
        candidate.dna.artistic *
          0.25 +
        candidate.performance
          .longevity *
          0.2 +
        candidate.dataQualityScore *
          0.15 +
        roleGain * 9 +
        (100 - overlap) * 0.22,
      );

      return {
        candidate,
        overlap,
        roleGain,
        score,
      };
    })
    .sort(
      (a, b) =>
        b.score - a.score,
    );

  const best = ranked[0];

  if (!best) return null;

  return {
    fragranceId:
      best.candidate.id,
    name:
      best.candidate.name,
    brand:
      best.candidate.brand,
    confidence: Math.min(
      99,
      best.score,
    ),
    overlap:
      best.overlap,
    roleGain:
      best.roleGain,
    reason:
      best.roleGain > 0
        ? `Adds ${best.roleGain} uncovered role${best.roleGain === 1 ? "" : "s"} with ${best.overlap}% estimated overlap.`
        : `Preserves this perfumer's signature while offering ${100 - best.overlap}% estimated DNA separation.`,
  };
}

function buildIdentity({
  dna,
  averageLongevity,
  averageProjection,
  versatilityScore,
}: {
  dna: Record<DnaDimension, number>;
  averageLongevity: number;
  averageProjection: number;
  versatilityScore: number;
}) {
  const traits =
    Object.entries(dna)
      .sort(
        (a, b) =>
          b[1] - a[1],
      )
      .slice(0, 4)
      .map(
        ([dimension]) =>
          capitalize(dimension),
      );

  if (averageLongevity >= 82) {
    traits.push("Long-lasting");
  }
  if (averageProjection >= 82) {
    traits.push("Expressive");
  }
  if (versatilityScore >= 78) {
    traits.push("Versatile");
  }

  return [
    ...new Set(traits),
  ].slice(0, 7);
}

function countValues(
  values: string[],
) {
  const counts =
    values.reduce<
      Record<string, number>
    >((result, value) => {
      if (!value) return result;
      result[value] =
        (result[value] ?? 0) + 1;
      return result;
    }, {});

  return Object.entries(counts).sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0]),
  );
}

function rankOne(
  values: GlobalFragranceRecord[],
  score: (
    item: GlobalFragranceRecord,
  ) => number,
) {
  return (
    [...values].sort(
      (a, b) =>
        score(b) - score(a),
    )[0] ?? null
  );
}

function dnaSimilarity(
  first: GlobalFragranceRecord,
  second: GlobalFragranceRecord,
) {
  const difference =
    dnaDimensions.reduce(
      (total, dimension) =>
        total +
        Math.abs(
          first.dna[dimension] -
            second.dna[dimension],
        ),
      0,
    );

  return Math.max(
    0,
    Math.round(
      100 -
        difference /
          dnaDimensions.length,
    ),
  );
}

function dnaSpread(
  dna: Record<DnaDimension, number>,
) {
  const values =
    Object.values(dna);
  return (
    Math.max(...values) -
    Math.min(...values)
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(
    values.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) / values.length,
  );
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
