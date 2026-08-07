import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  DnaDimension,
  FragranceRecord,
  FragranceRole,
} from "@/lib/domain/fragrance";
import type {
  EvolutionSnapshot,
} from "@/lib/evolution/types";
import { analyzeCollectionEvolution } from "@/lib/intelligence/collection-evolution-engine";
import { analyzeCollectionValueDashboard } from "@/lib/intelligence/collection-value-dashboard";

export interface AnnualReviewChapter {
  id: string;
  title: string;
  periodLabel: string;
  description: string;
  snapshotIds: string[];
}

export interface AnnualReviewHighlight {
  label: string;
  value: string;
  explanation: string;
}

export interface AnnualReviewOutput {
  modelVersion: "EAR-1.0.0";
  year: number;
  generatedAt: string;
  startSnapshot: EvolutionSnapshot | null;
  endSnapshot: EvolutionSnapshot | null;
  collectionHealthChange: number;
  diversityChange: number;
  rotationChange: number;
  roleCoverageChange: number;
  collectionSizeChange: number;
  totalWearChange: number;
  marketValueChange: number;
  strongestRisingDna: {
    dimension: DnaDimension;
    change: number;
  } | null;
  strongestFallingDna: {
    dimension: DnaDimension;
    change: number;
  } | null;
  dominantRoleShift: {
    before?: FragranceRole;
    after?: FragranceRole;
  };
  dominantBrandShift: {
    before?: string;
    after?: string;
  };
  dominantFamilyShift: {
    before?: string;
    after?: string;
  };
  mostWorn: {
    fragranceId: string;
    name: string;
    brand: string;
    wears: number;
  } | null;
  bestPurchase: {
    fragranceId: string;
    name: string;
    brand: string;
    score: number;
  } | null;
  highestValueAddition: {
    fragranceId: string;
    name: string;
    brand: string;
    marketValue: number;
  } | null;
  chapters: AnnualReviewChapter[];
  highlights: AnnualReviewHighlight[];
  briefing: string;
}

export function generateAnnualReview({
  year,
  snapshots,
  collection,
  catalog,
}: {
  year: number;
  snapshots: EvolutionSnapshot[];
  collection: CollectionItem[];
  catalog: FragranceRecord[];
}): AnnualReviewOutput {
  const yearSnapshots = [...snapshots]
    .filter(
      (snapshot) =>
        new Date(
          snapshot.createdAt,
        ).getFullYear() === year,
    )
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );

  const startSnapshot =
    yearSnapshots[0] ?? null;
  const endSnapshot =
    yearSnapshots.at(-1) ?? null;

  const evolution =
    analyzeCollectionEvolution({
      snapshots: yearSnapshots,
    });

  const portfolio =
    analyzeCollectionValueDashboard({
      collection,
      catalog,
    });

  const mostWornEntry = collection
    .map((item) => ({
      item,
      fragrance: catalog.find(
        (candidate) =>
          candidate.id ===
          item.fragranceId,
      ),
    }))
    .filter(
      (
        entry,
      ): entry is {
        item: CollectionItem;
        fragrance: FragranceRecord;
      } => Boolean(entry.fragrance),
    )
    .sort(
      (a, b) =>
        b.item.wearCount -
        a.item.wearCount,
    )[0];

  const mostWorn = mostWornEntry
    ? {
        fragranceId:
          mostWornEntry.fragrance.id,
        name:
          mostWornEntry.fragrance.name,
        brand:
          mostWornEntry.fragrance.brand,
        wears:
          mostWornEntry.item.wearCount,
      }
    : null;

  const bestPurchaseHolding =
    portfolio.bestPurchases[0] ?? null;
  const highestValueHolding =
    portfolio.topHoldings[0] ?? null;

  const dominantRoleShift = {
    before:
      startSnapshot
        ? dominantRole(
            startSnapshot.roles,
          )
        : undefined,
    after:
      endSnapshot
        ? dominantRole(
            endSnapshot.roles,
          )
        : undefined,
  };

  const collectionHealthChange =
    endSnapshot && startSnapshot
      ? endSnapshot.collectionHealth -
        startSnapshot.collectionHealth
      : 0;

  const diversityChange =
    endSnapshot && startSnapshot
      ? endSnapshot.diversity -
        startSnapshot.diversity
      : 0;

  const rotationChange =
    endSnapshot && startSnapshot
      ? endSnapshot.rotation -
        startSnapshot.rotation
      : 0;

  const roleCoverageChange =
    endSnapshot && startSnapshot
      ? endSnapshot.roleCoverage -
        startSnapshot.roleCoverage
      : 0;

  const collectionSizeChange =
    endSnapshot && startSnapshot
      ? endSnapshot.collectionSize -
        startSnapshot.collectionSize
      : 0;

  const totalWearChange =
    endSnapshot && startSnapshot
      ? endSnapshot.totalWears -
        startSnapshot.totalWears
      : 0;

  const startValue =
    startSnapshot
      ? estimateSnapshotMarketValue({
          snapshot: startSnapshot,
          catalog,
        })
      : 0;

  const endValue =
    endSnapshot
      ? estimateSnapshotMarketValue({
          snapshot: endSnapshot,
          catalog,
        })
      : portfolio.estimatedMarketValue;

  const marketValueChange =
    endValue - startValue;

  const chapters =
    buildChapters(yearSnapshots);

  const highlights: AnnualReviewHighlight[] =
    [
      {
        label: "Collection Health",
        value:
          signed(collectionHealthChange),
        explanation:
          "Net change from the first to the final snapshot of the year.",
      },
      {
        label: "Collection Size",
        value:
          signed(collectionSizeChange),
        explanation:
          "Change in tracked bottle count across the review period.",
      },
      {
        label: "Recorded Wears",
        value:
          signed(totalWearChange),
        explanation:
          "Difference in total recorded wears between the first and final snapshot.",
      },
      {
        label: "Market Value",
        value: `${marketValueChange >= 0 ? "+" : "-"}$${Math.abs(
          marketValueChange,
        ).toLocaleString()}`,
        explanation:
          "Estimated change using calibrated OLFACTUS market-reference values.",
      },
    ];

  return {
    modelVersion: "EAR-1.0.0",
    year,
    generatedAt:
      new Date().toISOString(),
    startSnapshot,
    endSnapshot,
    collectionHealthChange,
    diversityChange,
    rotationChange,
    roleCoverageChange,
    collectionSizeChange,
    totalWearChange,
    marketValueChange,
    strongestRisingDna:
      evolution.strongestRisingDna,
    strongestFallingDna:
      evolution.strongestFallingDna,
    dominantRoleShift,
    dominantBrandShift:
      evolution.dominantBrandShift,
    dominantFamilyShift:
      evolution.dominantFamilyShift,
    mostWorn,
    bestPurchase:
      bestPurchaseHolding
        ? {
            fragranceId:
              bestPurchaseHolding.fragranceId,
            name:
              bestPurchaseHolding.name,
            brand:
              bestPurchaseHolding.brand,
            score:
              bestPurchaseHolding.strategicValue,
          }
        : null,
    highestValueAddition:
      highestValueHolding
        ? {
            fragranceId:
              highestValueHolding.fragranceId,
            name:
              highestValueHolding.name,
            brand:
              highestValueHolding.brand,
            marketValue:
              highestValueHolding.marketValue,
          }
        : null,
    chapters,
    highlights,
    briefing: buildBriefing({
      year,
      collectionHealthChange,
      diversityChange,
      rotationChange,
      strongestRisingDna:
        evolution.strongestRisingDna,
      strongestFallingDna:
        evolution.strongestFallingDna,
      dominantRoleShift,
      mostWorn,
    }),
  };
}

function buildChapters(
  snapshots: EvolutionSnapshot[],
): AnnualReviewChapter[] {
  if (!snapshots.length) return [];

  const chunkSize = Math.max(
    1,
    Math.ceil(
      snapshots.length / 4,
    ),
  );

  const labels = [
    {
      id: "early",
      title: "Early Collection",
      description:
        "The collection established its first clear identity and structural priorities.",
    },
    {
      id: "expansion",
      title: "Expansion Phase",
      description:
        "New bottles widened role coverage, brand breadth, and DNA range.",
    },
    {
      id: "identity",
      title: "Identity Formation",
      description:
        "Wear behavior began separating true preferences from simple ownership.",
    },
    {
      id: "current",
      title: "Current Era",
      description:
        "The collection reached its latest balance of health, diversity, and personal identity.",
    },
  ];

  return labels
    .map((label, index) => {
      const slice = snapshots.slice(
        index * chunkSize,
        (index + 1) * chunkSize,
      );

      if (!slice.length) return null;

      return {
        ...label,
        periodLabel: `${new Date(
          slice[0].createdAt,
        ).toLocaleDateString(
          undefined,
          {
            month: "short",
          },
        )}–${new Date(
          slice.at(-1)!.createdAt,
        ).toLocaleDateString(
          undefined,
          {
            month: "short",
          },
        )}`,
        snapshotIds: slice.map(
          (snapshot) => snapshot.id,
        ),
      };
    })
    .filter(
      (
        chapter,
      ): chapter is AnnualReviewChapter =>
        Boolean(chapter),
    );
}

function buildBriefing({
  year,
  collectionHealthChange,
  diversityChange,
  rotationChange,
  strongestRisingDna,
  strongestFallingDna,
  dominantRoleShift,
  mostWorn,
}: {
  year: number;
  collectionHealthChange: number;
  diversityChange: number;
  rotationChange: number;
  strongestRisingDna: {
    dimension: DnaDimension;
    change: number;
  } | null;
  strongestFallingDna: {
    dimension: DnaDimension;
    change: number;
  } | null;
  dominantRoleShift: {
    before?: FragranceRole;
    after?: FragranceRole;
  };
  mostWorn:
    | {
        name: string;
        brand: string;
        wears: number;
      }
    | null;
}) {
  return `In ${year}, Collection Health changed by ${signed(
    collectionHealthChange,
  )}, Diversity changed by ${signed(
    diversityChange,
  )}, and Rotation changed by ${signed(
    rotationChange,
  )}. ${
    strongestRisingDna
      ? `${capitalize(
          strongestRisingDna.dimension,
        )} was the strongest rising DNA dimension at ${signed(
          strongestRisingDna.change,
        )}.`
      : "Taste DNA remained structurally stable."
  } ${
    strongestFallingDna
      ? `${capitalize(
          strongestFallingDna.dimension,
        )} declined by ${signed(
          strongestFallingDna.change,
        )}.`
      : ""
  } The dominant collection role shifted from ${
    dominantRoleShift.before ??
    "none"
  } to ${
    dominantRoleShift.after ??
    "none"
  }. ${
    mostWorn
      ? `${mostWorn.brand} ${mostWorn.name} led recorded wear activity with ${mostWorn.wears} wears.`
      : ""
  }`;
}

function estimateSnapshotMarketValue({
  snapshot,
  catalog,
}: {
  snapshot: EvolutionSnapshot;
  catalog: FragranceRecord[];
}) {
  return snapshot.ownedFragranceIds.reduce(
    (total, fragranceId) => {
      const fragrance = catalog.find(
        (candidate) =>
          candidate.id ===
          fragranceId,
      );

      return (
        total +
        (fragrance?.market
          ?.typicalMarketPrice ??
          fragrance?.market
            ?.retailPrice ??
          150)
      );
    },
    0,
  );
}

function dominantRole(
  values: Record<
    FragranceRole,
    number
  >,
) {
  return Object.entries(values).sort(
    (a, b) =>
      b[1] - a[1] ||
      a[0].localeCompare(b[0]),
  )[0]?.[0] as
    | FragranceRole
    | undefined;
}

function signed(value: number) {
  return `${value >= 0 ? "+" : ""}${value}`;
}

function capitalize(value: string) {
  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}
