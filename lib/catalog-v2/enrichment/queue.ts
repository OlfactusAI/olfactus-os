import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import type {
  CatalogEnrichmentPriority,
  CatalogEnrichmentTask,
} from "@/lib/catalog-v2/enrichment/types";

const enrichmentFields = [
  "releaseYear",
  "concentration",
  "family",
  "perfumers",
  "notes",
  "accords",
  "collections",
  "country",
] as const;

export function buildCatalogEnrichmentQueue(
  records:
    CatalogV2Record[],
): CatalogEnrichmentTask[] {
  return records
    .map(
      (record) =>
        buildTask(record),
    )
    .sort(
      (a, b) =>
        priorityRank(
          a.priority,
        ) -
          priorityRank(
            b.priority,
          ) ||
        a.completeness -
          b.completeness ||
        a.brand.localeCompare(
          b.brand,
        ) ||
        a.name.localeCompare(
          b.name,
        ),
    );
}

export function summarizeCatalogEnrichmentQueue(
  tasks:
    CatalogEnrichmentTask[],
) {
  const byPriority =
    tasks.reduce(
      (
        output,
        task,
      ) => {
        output[
          task.priority
        ] =
          (
            output[
              task.priority
            ] ??
            0
          ) +
          1;
        return output;
      },
      {} as Record<
        CatalogEnrichmentPriority,
        number
      >,
    );

  return {
    total:
      tasks.length,
    averageCompleteness:
      tasks.length
        ? Math.round(
            tasks.reduce(
              (
                sum,
                task,
              ) =>
                sum +
                task.completeness,
              0,
            ) /
              tasks.length,
          )
        : 0,
    byPriority,
    missingFieldCounts:
      enrichmentFields.reduce(
        (
          output,
          field,
        ) => {
          output[
            field
          ] =
            tasks.filter(
              (task) =>
                task.missingFields.includes(
                  field,
                ),
            ).length;
          return output;
        },
        {} as Record<
          string,
          number
        >,
      ),
  };
}

function buildTask(
  record:
    CatalogV2Record,
): CatalogEnrichmentTask {
  const present =
    enrichmentFields.filter(
      (field) =>
        hasValue(
          record[
            field
          ],
        ),
    );

  const missingFields =
    enrichmentFields.filter(
      (field) =>
        !present.includes(
          field,
        ),
    );

  const completeness =
    Math.round(
      (
        present.length /
        enrichmentFields.length
      ) *
        100,
    );

  const currentTier =
    record.family &&
    (
      record.notes.length >
        0 ||
      record.perfumers.length >
        0 ||
      record.accords.length >
        0
    )
      ? "discovery"
      : "identity";

  return {
    canonicalId:
      record.canonicalId,
    brand:
      record.brand,
    name:
      record.name,
    completeness,
    priority:
      priorityFor(
        completeness,
        currentTier,
      ),
    missingFields,
    sourceCount:
      record.provenance.length,
    currentTier,
    record,
  };
}

function priorityFor(
  completeness: number,
  tier:
    CatalogEnrichmentTask["currentTier"],
): CatalogEnrichmentPriority {
  if (
    tier ===
      "identity" &&
    completeness <
      40
  ) {
    return "critical";
  }

  if (
    tier ===
      "identity"
  ) {
    return "high";
  }

  if (
    completeness <
    70
  ) {
    return "medium";
  }

  return "low";
}

function hasValue(
  value: unknown,
) {
  if (
    Array.isArray(
      value,
    )
  ) {
    return value.length >
      0;
  }

  return (
    value !==
      undefined &&
    value !==
      null &&
    value !==
      ""
  );
}

function priorityRank(
  priority:
    CatalogEnrichmentPriority,
) {
  return {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }[
    priority
  ];
}
