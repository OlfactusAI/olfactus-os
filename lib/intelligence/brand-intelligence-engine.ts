import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  DnaDimension,
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
} from "@/lib/database/schema";

export type BrandCategory =
  | "Luxury"
  | "Designer"
  | "Niche"
  | "Independent"
  | "Heritage"
  | "Middle Eastern"
  | "Unclassified";

export interface BrandTimelineEntry {
  year: number;
  fragranceId: string;
  fragranceName: string;
  description: string;
}

export interface BrandRecommendation {
  fragranceId: string;
  name: string;
  confidence: number;
  overlap: number;
  roleGain: number;
  reason: string;
}

export interface BrandIntelligenceProfile {
  brandId: string;
  name: string;
  category: BrandCategory;
  countryCode?: string;
  fragranceCount: number;
  perfumerCount: number;
  averageLongevity: number;
  averageProjection: number;
  averageArtistic: number;
  averageFormal: number;
  averageFresh: number;
  averageDataQuality: number;
  versatilityScore: number;
  collectionOwnedCount: number;
  collectionCoverage: number;
  dna: Record<DnaDimension, number>;
  strongestFamilies: Array<{
    family: string;
    count: number;
  }>;
  signatureFragrances: GlobalFragranceRecord[];
  timeline: BrandTimelineEntry[];
  nextPurchase: BrandRecommendation | null;
  identity: string[];
  marketPosition: {
    luxury: number;
    originality: number;
    performance: number;
    versatility: number;
    value: number;
  };
}

export interface BrandComparisonRow {
  metric: string;
  values: Record<string, number>;
}

export interface BrandIntelligenceOutput {
  modelVersion: "BIO-1.0.0";
  generatedAt: string;
  brands: BrandIntelligenceProfile[];
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

export function analyzeBrandIntelligence({
  database,
  collection,
}: {
  database: GlobalFragranceDatabase;
  collection: CollectionItem[];
}): BrandIntelligenceOutput {
  const ownedIds = new Set(
    collection.map(
      (item) => item.fragranceId,
    ),
  );

  const brands = database.brands
    .map((brand) => {
      const portfolio =
        database.fragrances.filter(
          (fragrance) =>
            fragrance.brandId === brand.id,
        );

      return buildBrandProfile({
        brandId: brand.id,
        name: brand.canonicalName,
        countryCode: brand.countryCode,
        portfolio,
        ownedIds,
      });
    })
    .filter(
      (brand) =>
        brand.fragranceCount > 0,
    )
    .sort(
      (a, b) =>
        b.fragranceCount -
          a.fragranceCount ||
        b.averageDataQuality -
          a.averageDataQuality ||
        a.name.localeCompare(b.name),
    );

  return {
    modelVersion: "BIO-1.0.0",
    generatedAt:
      new Date().toISOString(),
    brands,
  };
}

export function compareBrands(
  brands: BrandIntelligenceProfile[],
): BrandComparisonRow[] {
  const metrics: Array<{
    label: string;
    read: (
      brand: BrandIntelligenceProfile,
    ) => number;
  }> = [
    {
      label: "Longevity",
      read: (brand) =>
        brand.averageLongevity,
    },
    {
      label: "Projection",
      read: (brand) =>
        brand.averageProjection,
    },
    {
      label: "Artistic",
      read: (brand) =>
        brand.averageArtistic,
    },
    {
      label: "Versatility",
      read: (brand) =>
        brand.versatilityScore,
    },
    {
      label: "Data Quality",
      read: (brand) =>
        brand.averageDataQuality,
    },
    {
      label: "Luxury",
      read: (brand) =>
        brand.marketPosition.luxury,
    },
    {
      label: "Originality",
      read: (brand) =>
        brand.marketPosition
          .originality,
    },
    {
      label: "Value",
      read: (brand) =>
        brand.marketPosition.value,
    },
  ];

  return metrics.map(
    (metric) => ({
      metric: metric.label,
      values: Object.fromEntries(
        brands.map((brand) => [
          brand.brandId,
          metric.read(brand),
        ]),
      ),
    }),
  );
}

export function searchAndSortBrands({
  brands,
  query,
  sort,
}: {
  brands: BrandIntelligenceProfile[];
  query: string;
  sort:
    | "name"
    | "quality"
    | "performance"
    | "artistic"
    | "coverage";
}) {
  const normalized =
    query.trim().toLowerCase();

  const filtered = brands.filter(
    (brand) =>
      !normalized ||
      brand.name
        .toLowerCase()
        .includes(normalized) ||
      brand.category
        .toLowerCase()
        .includes(normalized) ||
      brand.identity.some(
        (trait) =>
          trait
            .toLowerCase()
            .includes(normalized),
      ),
  );

  return [...filtered].sort(
    (a, b) => {
      if (sort === "quality") {
        return (
          b.averageDataQuality -
          a.averageDataQuality
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
      if (sort === "artistic") {
        return (
          b.averageArtistic -
          a.averageArtistic
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

function buildBrandProfile({
  brandId,
  name,
  countryCode,
  portfolio,
  ownedIds,
}: {
  brandId: string;
  name: string;
  countryCode?: string;
  portfolio: GlobalFragranceRecord[];
  ownedIds: Set<string>;
}): BrandIntelligenceProfile {
  const owned =
    portfolio.filter(
      (fragrance) =>
        ownedIds.has(fragrance.id),
    );

  const dna = Object.fromEntries(
    dnaDimensions.map(
      (dimension) => [
        dimension,
        average(
          portfolio.map(
            (fragrance) =>
              fragrance.dna[
                dimension
              ],
          ),
        ),
      ],
    ),
  ) as Record<DnaDimension, number>;

  const familyCounts =
    portfolio.reduce<
      Record<string, number>
    >((result, fragrance) => {
      result[fragrance.family] =
        (result[
          fragrance.family
        ] ?? 0) + 1;
      return result;
    }, {});

  const averageLongevity =
    average(
      portfolio.map(
        (fragrance) =>
          fragrance.performance
            .longevity,
      ),
    );
  const averageProjection =
    average(
      portfolio.map(
        (fragrance) =>
          fragrance.performance
            .projection,
      ),
    );
  const averageArtistic =
    average(
      portfolio.map(
        (fragrance) =>
          fragrance.dna.artistic,
      ),
    );
  const averageFormal =
    average(
      portfolio.map(
        (fragrance) =>
          fragrance.dna.formal,
      ),
    );
  const averageFresh =
    average(
      portfolio.map(
        (fragrance) =>
          fragrance.dna.fresh,
      ),
    );
  const averageDataQuality =
    average(
      portfolio.map(
        (fragrance) =>
          fragrance.dataQualityScore,
      ),
    );

  const versatilityScore =
    Math.round(
      average(
        portfolio.map(
          (fragrance) =>
            average([
              ...Object.values(
                fragrance.seasons,
              ),
              fragrance.roles.length *
                10,
            ]),
        ),
      ),
    );

  const signatureFragrances =
    [...portfolio]
      .sort(
        (a, b) =>
          signatureScore(b) -
          signatureScore(a),
      )
      .slice(0, 6);

  const nextPurchase =
    chooseNextPurchase({
      portfolio,
      ownedIds,
    });

  const identity =
    buildIdentity({
      dna,
      averageLongevity,
      averageProjection,
      category:
        classifyBrand(
          name,
          countryCode,
        ),
    });

  return {
    brandId,
    name,
    category:
      classifyBrand(
        name,
        countryCode,
      ),
    countryCode,
    fragranceCount:
      portfolio.length,
    perfumerCount:
      new Set(
        portfolio.flatMap(
          (fragrance) =>
            fragrance.perfumerIds,
        ),
      ).size,
    averageLongevity,
    averageProjection,
    averageArtistic,
    averageFormal,
    averageFresh,
    averageDataQuality,
    versatilityScore,
    collectionOwnedCount:
      owned.length,
    collectionCoverage:
      portfolio.length
        ? Math.round(
            (owned.length /
              portfolio.length) *
              100,
          )
        : 0,
    dna,
    strongestFamilies:
      Object.entries(
        familyCounts,
      )
        .map(
          ([family, count]) => ({
            family,
            count,
          }),
        )
        .sort(
          (a, b) =>
            b.count - a.count ||
            a.family.localeCompare(
              b.family,
            ),
        )
        .slice(0, 5),
    signatureFragrances,
    timeline:
      portfolio
        .filter(
          (fragrance) =>
            Boolean(
              fragrance.releaseYear,
            ),
        )
        .map((fragrance) => ({
          year:
            fragrance.releaseYear!,
          fragranceId:
            fragrance.id,
          fragranceName:
            fragrance.name,
          description: `${fragrance.concentration} · ${fragrance.family}`,
        }))
        .sort(
          (a, b) =>
            a.year - b.year,
        ),
    nextPurchase,
    identity,
    marketPosition: {
      luxury: Math.round(
        average([
          averageFormal,
          averageDataQuality,
          averageArtistic,
        ]),
      ),
      originality:
        averageArtistic,
      performance:
        Math.round(
          average([
            averageLongevity,
            averageProjection,
          ]),
        ),
      versatility:
        versatilityScore,
      value: Math.round(
        average(
          portfolio.map(
            (fragrance) =>
              fragrance.market
                ?.valueScore ??
              Math.max(
                35,
                100 -
                  ((fragrance.market
                    ?.typicalMarketPrice ??
                    150) /
                    4),
              ),
          ),
        ),
      ),
    },
  };
}

function chooseNextPurchase({
  portfolio,
  ownedIds,
}: {
  portfolio: GlobalFragranceRecord[];
  ownedIds: Set<string>;
}): BrandRecommendation | null {
  const owned = portfolio.filter(
    (fragrance) =>
      ownedIds.has(fragrance.id),
  );
  const candidates =
    portfolio.filter(
      (fragrance) =>
        !ownedIds.has(fragrance.id),
    );

  const ranked = candidates
    .map((candidate) => {
      const overlap =
        owned.length
          ? Math.round(
              average(
                owned.map(
                  (item) =>
                    dnaSimilarity(
                      candidate,
                      item,
                    ),
                ),
              ),
            )
          : 0;

      const ownedRoles = new Set(
        owned.flatMap(
          (item) => item.roles,
        ),
      );
      const roleGain =
        candidate.roles.filter(
          (role) =>
            !ownedRoles.has(role),
        ).length;

      const score = Math.round(
        candidate.dna.artistic *
          0.24 +
          candidate.performance
            .longevity *
            0.2 +
          candidate.performance
            .projection *
            0.12 +
          candidate.dataQualityScore *
            0.14 +
          roleGain * 8 +
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
        ? `Adds ${best.roleGain} new role${best.roleGain === 1 ? "" : "s"} with ${best.overlap}% estimated DNA overlap.`
        : `Offers ${100 - best.overlap}% DNA separation and strong brand-level performance.`,
  };
}

function signatureScore(
  fragrance: GlobalFragranceRecord,
) {
  return (
    fragrance.dataQualityScore *
      0.18 +
    fragrance.dna.artistic *
      0.22 +
    fragrance.dna.formal *
      0.12 +
    fragrance.performance
      .longevity *
      0.2 +
    fragrance.performance
      .projection *
      0.12 +
    fragrance.roles.length * 4
  );
}

function dnaSimilarity(
  first: GlobalFragranceRecord,
  second: GlobalFragranceRecord,
) {
  const difference =
    dnaDimensions.reduce(
      (sum, dimension) =>
        sum +
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

function buildIdentity({
  dna,
  averageLongevity,
  averageProjection,
  category,
}: {
  dna: Record<DnaDimension, number>;
  averageLongevity: number;
  averageProjection: number;
  category: BrandCategory;
}) {
  const traits = [
    ...Object.entries(dna)
      .sort(
        (a, b) =>
          b[1] - a[1],
      )
      .slice(0, 4)
      .map(
        ([dimension]) =>
          capitalize(dimension),
      ),
    category,
  ];

  if (averageLongevity >= 82) {
    traits.push("Long-lasting");
  }
  if (averageProjection >= 82) {
    traits.push("Powerful");
  }

  return [...new Set(traits)].slice(
    0,
    7,
  );
}

function classifyBrand(
  name: string,
  countryCode?: string,
): BrandCategory {
  const middleEastern =
    new Set(["AE", "OM", "SA"]);

  if (
    countryCode &&
    middleEastern.has(countryCode)
  ) {
    return "Middle Eastern";
  }

  const designerNames =
    new Set([
      "Prada",
      "Hermès",
      "Dior",
      "Chanel",
      "Giorgio Armani",
      "Yves Saint Laurent",
      "Versace",
      "Valentino",
      "Rabanne",
    ]);

  if (designerNames.has(name)) {
    return "Designer";
  }

  if (
    /creed|guerlain|penhaligon|amouage/i.test(
      name,
    )
  ) {
    return "Heritage";
  }

  if (
    /xerjoff|roja|maison francis kurkdjian|parfums de marly|initio|louis vuitton/i.test(
      name,
    )
  ) {
    return "Luxury";
  }

  if (
    /marc-antoine barrois|maison crivelli|l'artisan|mancera|montale/i.test(
      name,
    )
  ) {
    return "Niche";
  }

  return "Unclassified";
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
