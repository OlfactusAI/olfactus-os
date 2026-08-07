import type {
  GlobalIntelligenceGraph,
  GlobalRelationshipType,
} from "@/lib/graph/global-types";

export function calculateRelationshipCoverage(
  graph:
    GlobalIntelligenceGraph,
) {
  const groups =
    new Map<
      GlobalRelationshipType,
      typeof graph.relationships
    >();

  for (
    const relationship
    of graph.relationships
  ) {
    groups.set(
      relationship.type,
      [
        ...(
          groups.get(
            relationship.type,
          ) ??
          []
        ),
        relationship,
      ],
    );
  }

  return [
    ...groups.entries(),
  ]
    .map(
      ([
        type,
        rows,
      ]) => ({
        type,
        count:
          rows.length,
        averageConfidence:
          Math.round(
            rows.reduce(
              (
                sum,
                row,
              ) =>
                sum +
                row.confidence,
              0,
            ) /
              rows.length,
          ),
        curatedCount:
          rows.filter(
            (row) =>
              row.source ===
              "curated",
          ).length,
        calculatedCount:
          rows.filter(
            (row) =>
              row.source ===
              "calculated",
          ).length,
      }),
    )
    .sort(
      (a, b) =>
        b.count -
        a.count,
    );
}
