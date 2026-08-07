import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import type {
  CatalogFieldClaim,
  CatalogFieldConflict,
  CatalogMergeResult,
} from "@/lib/catalog-v2/conflicts/types";

const conflictFields =
  [
    "releaseYear",
    "concentration",
    "family",
    "parentCompany",
    "country",
  ] as const;

export function mergeCatalogRecordsWithConflicts(
  left:
    CatalogV2Record,
  right:
    CatalogV2Record,
): CatalogMergeResult {
  const conflicts:
    CatalogFieldConflict[] =
      [];

  for (
    const field
    of conflictFields
  ) {
    const a =
      left[field];
    const b =
      right[field];

    if (
      a ===
        undefined ||
      b ===
        undefined ||
      equalValue(
        a,
        b,
      )
    ) {
      continue;
    }

    conflicts.push({
      canonicalId:
        left.canonicalId,
      field,
      claims: [
        claim(
          left,
          field,
          a,
        ),
        claim(
          right,
          field,
          b,
        ),
      ],
      status:
        "open",
    });
  }

  const merged:
    CatalogV2Record = {
      ...left,
      aliases:
        union(
          left.aliases,
          right.aliases,
        ),
      perfumers:
        union(
          left.perfumers,
          right.perfumers,
        ),
      notes:
        union(
          left.notes,
          right.notes,
        ),
      accords:
        union(
          left.accords,
          right.accords,
        ),
      collections:
        union(
          left.collections,
          right.collections,
        ),
      provenance: [
        ...left.provenance,
        ...right.provenance.filter(
          (incoming) =>
            !left.provenance.some(
              (current) =>
                current.sourceId ===
                  incoming.sourceId &&
                current.sourceRecordId ===
                  incoming.sourceRecordId,
            ),
        ),
      ],
      fieldConfidence: {
        ...left.fieldConfidence,
        ...right.fieldConfidence,
      },
    };

  for (
    const field
    of conflictFields
  ) {
    if (
      merged[field] ===
        undefined &&
      right[field] !==
        undefined
    ) {
      (
        merged as unknown as
          Record<
            string,
            unknown
          >
      )[field] =
        right[field];
    }
  }

  return {
    merged,
    conflicts,
  };
}

function claim(
  record:
    CatalogV2Record,
  field: string,
  value:
    CatalogFieldClaim["value"],
): CatalogFieldClaim {
  const source =
    record.provenance[
      record.provenance.length -
        1
    ];

  if (!source) {
    throw new Error(
      `Cannot build provenance claim for ${record.canonicalId}:${field}.`,
    );
  }

  return {
    field,
    value,
    confidence:
      record.fieldConfidence[
        field
      ] ??
      source.confidence,
    source,
  };
}

function equalValue(
  left: unknown,
  right: unknown,
) {
  return JSON.stringify(
    left,
  ) ===
    JSON.stringify(
      right,
    );
}

function union(
  left: string[],
  right: string[],
) {
  return [
    ...new Set([
      ...left,
      ...right,
    ]),
  ];
}
