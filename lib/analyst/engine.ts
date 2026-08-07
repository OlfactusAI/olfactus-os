import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  EntityRegistry,
} from "@/lib/entities/types";
import type {
  AnalystActionPreview,
  AnalystCommand,
  AnalystResponse,
} from "@/lib/analyst/types";
import {
  resolveFragranceAlias,
} from "@/lib/analyst/commands";

interface CollectionAnalysisShape {
  score: number;
  dimensions: {
    rotation: number;
    diversity: number;
    seasonalBalance: number;
    redundancy: number;
    roleCoverage?: number;
  };
  strengths?: string[];
  weaknesses?: string[];
}

export function runAnalystCommand({
  command,
  collection,
  catalog,
  analysis,
  registry,
}: {
  command:
    AnalystCommand;
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  analysis:
    CollectionAnalysisShape;
  registry:
    EntityRegistry;
}): {
  response:
    AnalystResponse;
  preview?:
    AnalystActionPreview;
} {
  switch (
    command.intent
  ) {
    case "explain-health":
      return {
        response:
          explainCollectionHealth(
            analysis,
          ),
      };

    case "recommend-owned":
      return {
        response:
          recommendOwned({
            collection,
            catalog,
          }),
      };

    case "find-neglected":
      return {
        response:
          findNeglected({
            collection,
            catalog,
          }),
      };

    case "compare":
      return {
        response:
          compareEntities({
            queries:
              command.arguments,
            collection,
            catalog,
            registry,
          }),
      };

    case "record-wear":
      return previewWear({
        query:
          command.arguments[0] ??
          "",
        collection,
        catalog,
      });

    default:
      return {
        response: {
          type:
            "message",
          title:
            "How OLFACTUS Analyst can help",
          message:
            "Ask me to explain Collection Health, recommend an owned fragrance, find neglected bottles, compare fragrances, or preview a wear record.",
          evidence: [
            {
              kind:
                "verified",
              label:
                "Supported commands",
              detail:
                "/explain collection-health · /recommend tonight · /find neglected · /compare A vs B · /wear fragrance",
            },
          ],
        },
      };
  }
}

function explainCollectionHealth(
  analysis:
    CollectionAnalysisShape,
): AnalystResponse {
  const dimensions =
    analysis.dimensions;

  const ranked = [
    {
      label:
        "Rotation",
      value:
        dimensions.rotation,
    },
    {
      label:
        "Diversity",
      value:
        dimensions.diversity,
    },
    {
      label:
        "Seasonal balance",
      value:
        dimensions.seasonalBalance,
    },
    {
      label:
        "Redundancy control",
      value:
        dimensions.redundancy,
    },
    {
      label:
        "Role coverage",
      value:
        dimensions.roleCoverage ??
        0,
    },
  ].sort(
    (a, b) =>
      b.value -
      a.value,
  );

  const positives =
    ranked
      .filter(
        (item) =>
          item.value >=
          70,
      )
      .slice(
        0,
        4,
      )
      .map(
        (item) =>
          `${item.label} is contributing positively at ${item.value}/100.`,
      );

  const negatives =
    ranked
      .filter(
        (item) =>
          item.value <
          70,
      )
      .sort(
        (a, b) =>
          a.value -
          b.value,
      )
      .slice(
        0,
        4,
      )
      .map(
        (item) =>
          `${item.label} is limiting the score at ${item.value}/100.`,
      );

  return {
    type:
      "health-explanation",
    title:
      "Collection Health explained",
    score:
      analysis.score,
    confidence: 96,
    positives:
      positives.length
        ? positives
        : [
            "No dimension currently clears the strong-contribution threshold.",
          ],
    negatives:
      negatives.length
        ? negatives
        : [
            "No major Collection Health weakness is currently detected.",
          ],
    evidence: [
      {
        kind:
          "verified",
        label:
          "Active collection",
        detail:
          "The explanation uses the collection currently stored in OLFACTUS.",
      },
      {
        kind:
          "calculated",
        label:
          "Collection engine",
        detail:
          "Rotation, diversity, seasonal balance, redundancy, and role coverage were evaluated.",
      },
      {
        kind:
          "unavailable",
        label:
          "External context",
        detail:
          "Live weather and current market prices do not affect this Collection Health explanation.",
      },
    ],
  };
}

function recommendOwned({
  collection,
  catalog,
}: {
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
}): AnalystResponse {
  const owned =
    collection
      .map(
        (item) => {
          const fragrance =
            catalog.find(
              (candidate) =>
                candidate.id ===
                item.fragranceId,
            );

          if (!fragrance) {
            return null;
          }

          const performance =
            average(
              Object.values(
                fragrance.performance ??
                  {},
              ).map(Number),
            );
          const rotation =
            Math.min(
              35,
              item.daysSinceLastWear *
                0.7,
            );
          const favorite =
            item.favorite
              ? 8
              : 0;
          const score =
            clamp(
              50 +
                rotation +
                performance /
                  8 +
                favorite,
            );

          return {
            item,
            fragrance,
            score,
          };
        },
      )
      .filter(
        (
          item,
        ): item is
          NonNullable<
            typeof item
          > =>
          Boolean(item),
      )
      .sort(
        (a, b) =>
          b.score -
          a.score,
      );

  const best =
    owned[0];

  if (!best) {
    return {
      type:
        "recommendation",
      title:
        "No owned fragrance available",
      confidence: 100,
      summary:
        "Add or activate a fragrance in your collection before requesting an owned recommendation.",
      evidence: [
        {
          kind:
            "verified",
          label:
            "Collection",
          detail:
            "No active owned fragrance could be resolved against the catalog.",
        },
      ],
    };
  }

  return {
    type:
      "recommendation",
    title:
      "Owned fragrance recommendation",
    fragranceId:
      best.fragrance.id,
    fragranceName:
      best.fragrance.name,
    brand:
      best.fragrance.brand,
    score:
      best.score,
    confidence:
      best.fragrance
        .intelligence
        ?.confidence ??
      76,
    summary:
      `${best.fragrance.name} is the strongest current rotation opportunity, with ${best.item.daysSinceLastWear} days since its last wear.`,
    evidence: [
      {
        kind:
          "verified",
        label:
          "Ownership",
        detail:
          "This fragrance is in the active collection.",
      },
      {
        kind:
          "verified",
        label:
          "Rotation history",
        detail:
          `${best.item.daysSinceLastWear} days since last wear and ${best.item.wearCount} recorded wears.`,
      },
      {
        kind:
          "calculated",
        label:
          "Wear score",
        detail:
          `${best.score}/100 from rotation recency, available performance data, and favorite status.`,
      },
      {
        kind:
          "unavailable",
        label:
          "Weather",
        detail:
          "No live weather signal was used.",
      },
    ],
  };
}

function findNeglected({
  collection,
  catalog,
}: {
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
}): AnalystResponse {
  const items =
    collection
      .map(
        (item) => {
          const fragrance =
            catalog.find(
              (candidate) =>
                candidate.id ===
                item.fragranceId,
            );

          return fragrance
            ? {
                fragranceId:
                  fragrance.id,
                fragranceName:
                  fragrance.name,
                brand:
                  fragrance.brand,
                days:
                  item.daysSinceLastWear,
              }
            : null;
        },
      )
      .filter(
        (
          item,
        ): item is
          NonNullable<
            typeof item
          > =>
          Boolean(item),
      )
      .sort(
        (a, b) =>
          b.days -
          a.days,
      )
      .slice(
        0,
        3,
      );

  return {
    type:
      "neglected",
    title:
      "Most neglected bottles",
    items,
    evidence: [
      {
        kind:
          "verified",
        label:
          "Wear history",
        detail:
          "Ranked by the stored days-since-last-wear value.",
      },
      {
        kind:
          "calculated",
        label:
          "Priority",
        detail:
          "Higher inactivity receives higher rotation attention.",
      },
    ],
  };
}

function compareEntities({
  queries,
  collection,
  catalog,
  registry,
}: {
  queries: string[];
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  registry:
    EntityRegistry;
}): AnalystResponse {
  const ownedIds =
    new Set(
      collection.map(
        (item) =>
          item.fragranceId,
      ),
    );

  const resolved = queries
    .map(
      (query) =>
        resolveFragranceAlias({
          query,
          catalog,
        }),
    )
    .filter(
      (
        item,
      ): item is
        FragranceRecord =>
        Boolean(item),
    )
    .slice(
      0,
      3,
    );

  if (
    resolved.length <
    2
  ) {
    return {
      type:
        "message",
      title:
        "Comparison needs two recognized fragrances",
      message:
        "Use a command such as /compare Ganymede vs Reflection Man. OLFACTUS will not invent unresolved entities.",
      evidence: [
        {
          kind:
            "unavailable",
          label:
            "Entity resolution",
          detail:
            `${resolved.length} of ${Math.max(
              2,
              queries.length,
            )} requested fragrances resolved.`,
        },
      ],
    };
  }

  return {
    type:
      "comparison",
    title:
      "Active entity comparison",
    entities:
      resolved.map(
        (fragrance) => {
          const entity =
            registry.byCanonicalId.get(
              `fragrance:${fragrance.id}`,
            );

          return {
            id:
              fragrance.id,
            name:
              fragrance.name,
            subtitle:
              fragrance.brand,
            confidence:
              entity?.confidence ??
              fragrance.intelligence
                ?.confidence ??
              70,
            connections:
              entity
                ?.relationships
                .length ??
              0,
            collectionStatus:
              ownedIds.has(
                fragrance.id,
              )
                ? "owned"
                : "not-owned",
          };
        },
      ),
    evidence: [
      {
        kind:
          "verified",
        label:
          "Entity registry",
        detail:
          "Names and ownership were resolved from the active catalog and collection.",
      },
      {
        kind:
          "calculated",
        label:
          "Connection count",
        detail:
          "Each entity's registered relationship count is shown.",
      },
    ],
  };
}

function previewWear({
  query,
  collection,
  catalog,
}: {
  query: string;
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
}): {
  response:
    AnalystResponse;
  preview?:
    AnalystActionPreview;
} {
  const fragrance =
    resolveFragranceAlias({
      query,
      catalog,
    });

  if (!fragrance) {
    return {
      response: {
        type:
          "message",
        title:
          "Fragrance not resolved",
        message:
          "The requested fragrance was not found in the active catalog. No action was created.",
        evidence: [
          {
            kind:
              "unavailable",
            label:
              "Entity resolution",
            detail:
              query ||
              "No fragrance name was provided.",
          },
        ],
      },
    };
  }

  const owned =
    collection.some(
      (item) =>
        item.fragranceId ===
        fragrance.id,
    );

  if (!owned) {
    return {
      response: {
        type:
          "message",
        title:
          "Wear cannot be recorded",
        message:
          `${fragrance.name} is not in the active collection.`,
        evidence: [
          {
            kind:
              "verified",
            label:
              "Ownership check",
            detail:
              "Only owned fragrances can receive wear records.",
          },
        ],
      },
    };
  }

  const preview:
    AnalystActionPreview = {
      id:
        `wear:${fragrance.id}:${Date.now()}`,
      action:
        "record-wear",
      title:
        "Record wear",
      summary:
        `Record that ${fragrance.brand} ${fragrance.name} was worn today.`,
      fragranceId:
        fragrance.id,
      fragranceName:
        fragrance.name,
      createdAt:
        new Date().toISOString(),
      expectedEffects: [
        "Wear count increases",
        "Days since last wear resets",
        "Timeline event is added",
        "Rotation and recommendations recalculate",
      ],
    };

  return {
    response: {
      type:
        "message",
      title:
        "Wear action ready for review",
      message:
        "Review the proposed action below. The collection has not been changed.",
      evidence: [
        {
          kind:
            "verified",
          label:
            "Ownership",
          detail:
            `${fragrance.name} is in the active collection.`,
        },
        {
          kind:
            "verified",
          label:
            "Mutation safety",
          detail:
            "No change occurs until Confirm is selected.",
        },
      ],
    },
    preview,
  };
}

function average(
  values: number[],
) {
  if (!values.length) {
    return 50;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum +
        (Number.isFinite(
          value,
        )
          ? value
          : 0),
      0,
    ) /
    values.length
  );
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
