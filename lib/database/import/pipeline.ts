import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  adaptImportedFragrance,
} from "@/lib/database/import/adapter";
import {
  analyzeImportMatches,
} from "@/lib/database/import/matcher";
import type {
  ImportCommitOperation,
  ImportCommitResult,
  ImportDecision,
  ImportMatchBatchResult,
  ImportSession,
  ImportPreviewSummary,
  NormalizedFragranceImport,
  StagedImportRecord,
} from "@/lib/database/import/types";
import {
  buildGlobalFragranceDatabase,
} from "@/lib/database/database-foundation";

export function createImportSession({
  incoming,
  catalog,
  sourceFormat,
  sourceLabel,
}: {
  incoming: NormalizedFragranceImport[];
  catalog: FragranceRecord[];
  sourceFormat: "json" | "csv";
  sourceLabel?: string;
}): ImportSession {
  const database =
    buildGlobalFragranceDatabase({
      catalog,
    });
  const analysis =
    analyzeImportMatches({
      incoming,
      existing:
        database.fragrances,
    });

  const records =
    analysis.matches.map(
      (match, index) =>
        createStagedRecord({
          incoming:
            incoming[index],
          match,
        }),
    );

  const now =
    new Date().toISOString();

  return {
    sessionId:
      createId("import-session"),
    modelVersion: "GDI-2.0.0",
    createdAt: now,
    updatedAt: now,
    status:
      records.some(
        (record) =>
          record.decision ===
          "review",
      )
        ? "draft"
        : "ready",
    sourceFormat,
    sourceLabel,
    records,
    summary:
      summarizeStagedRecords(
        records,
      ),
  };
}

export function updateImportDecision({
  session,
  stageId,
  decision,
  selectedExistingFragranceId,
  notes,
}: {
  session: ImportSession;
  stageId: string;
  decision: ImportDecision;
  selectedExistingFragranceId?: string;
  notes?: string;
}): ImportSession {
  const records =
    session.records.map(
      (record) =>
        record.stageId ===
        stageId
          ? {
              ...record,
              decision,
              selectedExistingFragranceId:
                selectedExistingFragranceId ??
                record.selectedExistingFragranceId,
              notes:
                notes ??
                record.notes,
            }
          : record,
    );

  return refreshSession({
    ...session,
    records,
  });
}

export function resolveImportConflict({
  session,
  stageId,
  field,
  resolution,
}: {
  session: ImportSession;
  stageId: string;
  field: string;
  resolution:
    | "existing"
    | "incoming"
    | "merge";
}): ImportSession {
  const records =
    session.records.map(
      (record) =>
        record.stageId ===
        stageId
          ? {
              ...record,
              resolvedConflicts: {
                ...record.resolvedConflicts,
                [field]:
                  resolution,
              },
            }
          : record,
    );

  return refreshSession({
    ...session,
    records,
  });
}

export function canCommitImportSession(
  session: ImportSession,
) {
  return (
    session.status !==
      "committed" &&
    session.status !==
      "cancelled" &&
    session.records.every(
      (record) =>
        record.decision !==
        "review",
    ) &&
    session.records.every(
      (record) => {
        const blocking =
          record.match.conflicts.filter(
            (conflict) =>
              conflict.status ===
              "conflict",
          );

        if (
          ![
            "merge",
            "update",
          ].includes(
            record.decision,
          )
        ) {
          return true;
        }

        return blocking.every(
          (conflict) =>
            Boolean(
              record
                .resolvedConflicts[
                conflict.field
              ],
            ),
        );
      },
    )
  );
}

export function commitImportSession({
  session,
  catalog,
}: {
  session: ImportSession;
  catalog: FragranceRecord[];
}): ImportCommitResult {
  if (
    !canCommitImportSession(
      session,
    )
  ) {
    throw new Error(
      "Import session is not ready to commit.",
    );
  }

  const working =
    [...catalog];
  const operations:
    ImportCommitOperation[] = [];

  for (const record of session.records) {
    try {
      applyRecord({
        working,
        record,
        operations,
      });
    } catch (error) {
      operations.push({
        stageId:
          record.stageId,
        decision:
          record.decision,
        incomingId:
          record.incoming.id,
        existingFragranceId:
          record.selectedExistingFragranceId,
        status: "failed",
        message:
          error instanceof Error
            ? error.message
            : "Unknown import failure.",
      });
    }
  }

  const report =
    buildCommitReport({
      session,
      operations,
      resultingCatalogSize:
        working.length,
    });

  return {
    catalog: working,
    report,
  };
}

export function cancelImportSession(
  session: ImportSession,
): ImportSession {
  return {
    ...session,
    status: "cancelled",
    updatedAt:
      new Date().toISOString(),
  };
}

export function summarizeStagedRecords(
  records: StagedImportRecord[],
): ImportPreviewSummary {
  const count = (
    decision: ImportDecision,
  ) =>
    records.filter(
      (record) =>
        record.decision ===
        decision,
    ).length;

  return {
    total: records.length,
    create: count("create"),
    skip: count("skip"),
    merge: count("merge"),
    update: count("update"),
    reject: count("reject"),
    review: count("review"),
    blockingReviewCount:
      records.filter(
        (record) =>
          record.decision ===
            "review" ||
          record.match.conflicts.some(
            (conflict) =>
              conflict.status ===
                "conflict" &&
              !record
                .resolvedConflicts[
                conflict.field
              ] &&
              [
                "merge",
                "update",
              ].includes(
                record.decision,
              ),
          ),
      ).length,
  };
}

function createStagedRecord({
  incoming,
  match,
}: {
  incoming: NormalizedFragranceImport;
  match: ImportMatchBatchResult["matches"][number];
}): StagedImportRecord {
  const decision =
    suggestedDecision(
      match.recommendedAction,
    );

  return {
    stageId:
      createId(
        `stage-${incoming.id}`,
      ),
    incoming,
    match,
    decision,
    selectedExistingFragranceId:
      match.matchedFragranceId,
    resolvedConflicts: {},
  };
}

function suggestedDecision(
  action:
    ImportMatchBatchResult["matches"][number]["recommendedAction"],
): ImportDecision {
  if (action === "create") {
    return "create";
  }
  if (action === "skip") {
    return "skip";
  }
  if (action === "merge") {
    return "merge";
  }
  if (action === "update") {
    return "update";
  }
  return "review";
}

function refreshSession(
  session: ImportSession,
): ImportSession {
  const summary =
    summarizeStagedRecords(
      session.records,
    );

  return {
    ...session,
    updatedAt:
      new Date().toISOString(),
    status:
      summary.blockingReviewCount >
      0
        ? "draft"
        : "ready",
    summary,
  };
}

function applyRecord({
  working,
  record,
  operations,
}: {
  working: FragranceRecord[];
  record: StagedImportRecord;
  operations: ImportCommitOperation[];
}) {
  if (
    record.decision ===
    "skip"
  ) {
    operations.push(
      operation({
        record,
        status: "skipped",
        message:
          "Existing record retained without changes.",
      }),
    );
    return;
  }

  if (
    record.decision ===
    "reject"
  ) {
    operations.push(
      operation({
        record,
        status: "rejected",
        message:
          "Incoming record rejected by reviewer.",
      }),
    );
    return;
  }

  if (
    record.decision ===
    "create"
  ) {
    if (
      working.some(
        (fragrance) =>
          fragrance.id ===
          record.incoming.id,
      )
    ) {
      throw new Error(
        `Cannot create duplicate ID: ${record.incoming.id}`,
      );
    }

    working.push(
      adaptImportedFragrance(
        record.incoming,
      ),
    );
    operations.push(
      operation({
        record,
        status: "created",
        message:
          "New fragrance created.",
      }),
    );
    return;
  }

  const existingId =
    record.selectedExistingFragranceId;

  if (!existingId) {
    throw new Error(
      "No existing fragrance was selected for update or merge.",
    );
  }

  const index =
    working.findIndex(
      (fragrance) =>
        fragrance.id ===
        existingId,
    );

  if (index < 0) {
    throw new Error(
      `Existing fragrance not found: ${existingId}`,
    );
  }

  const incoming =
    adaptImportedFragrance(
      record.incoming,
    );

  working[index] =
    record.decision ===
    "merge"
      ? mergeFragrance({
          existing:
            working[index],
          incoming,
          record,
        })
      : updateFragrance({
          existing:
            working[index],
          incoming,
          record,
        });

  operations.push(
    operation({
      record,
      status:
        record.decision ===
        "merge"
          ? "merged"
          : "updated",
      message:
        record.decision ===
        "merge"
          ? "Incoming and existing data merged."
          : "Existing fragrance updated.",
    }),
  );
}

function updateFragrance({
  existing,
  incoming,
  record,
}: {
  existing: FragranceRecord;
  incoming: FragranceRecord;
  record: StagedImportRecord;
}) {
  const choose = <
    Key extends keyof FragranceRecord,
  >(
    key: Key,
  ): FragranceRecord[Key] => {
    const resolution =
      record.resolvedConflicts[
        String(key)
      ];

    if (
      resolution ===
      "existing"
    ) {
      return existing[key];
    }

    return incoming[key] ??
      existing[key];
  };

  return {
    ...existing,
    name: choose("name"),
    brand: choose("brand"),
    concentration:
      choose(
        "concentration",
      ),
    releaseYear:
      choose("releaseYear"),
    family:
      choose("family"),
    perfumers:
      choose("perfumers"),
    notes:
      choose("notes"),
    accords:
      choose("accords"),
    roles:
      choose("roles"),
    moods:
      choose("moods"),
    performance:
      choose("performance"),
  };
}

function mergeFragrance({
  existing,
  incoming,
  record,
}: {
  existing: FragranceRecord;
  incoming: FragranceRecord;
  record: StagedImportRecord;
}) {
  const useIncoming = (
    field: string,
  ) =>
    record.resolvedConflicts[
      field
    ] === "incoming";

  return {
    ...existing,
    name:
      useIncoming("name")
        ? incoming.name
        : existing.name,
    brand:
      useIncoming("brand")
        ? incoming.brand
        : existing.brand,
    concentration:
      useIncoming(
        "concentration",
      )
        ? incoming.concentration
        : existing.concentration,
    releaseYear:
      useIncoming("releaseYear")
        ? incoming.releaseYear
        : existing.releaseYear ??
          incoming.releaseYear,
    family:
      useIncoming("family")
        ? incoming.family
        : existing.family ||
          incoming.family,
    perfumers:
      mergeList(
        existing.perfumers,
        incoming.perfumers,
      ),
    notes: {
      top: mergeList(
        existing.notes?.top,
        incoming.notes?.top,
      ),
      heart: mergeList(
        existing.notes?.heart,
        incoming.notes?.heart,
      ),
      base: mergeList(
        existing.notes?.base,
        incoming.notes?.base,
      ),
    },
    accords:
      mergeList(
        existing.accords,
        incoming.accords,
      ),
    roles:
      mergeList(
        existing.roles,
        incoming.roles,
      ),
    moods:
      mergeList(
        existing.moods,
        incoming.moods,
      ),
    performance: {
      longevity:
        Math.max(
          existing.performance
            .longevity,
          incoming.performance
            .longevity,
        ),
      projection:
        Math.max(
          existing.performance
            .projection,
          incoming.performance
            .projection,
        ),
      sillage:
        Math.max(
          existing.performance
            .sillage ?? 0,
          incoming.performance
            .sillage ?? 0,
        ) || undefined,
    },
  };
}

function mergeList<
  Value extends string,
>(
  first:
    | readonly Value[]
    | undefined,
  second:
    | readonly Value[]
    | undefined,
) {
  return [
    ...new Set([
      ...(first ?? []),
      ...(second ?? []),
    ]),
  ] as Value[];
}

function operation({
  record,
  status,
  message,
}: {
  record: StagedImportRecord;
  status:
    ImportCommitOperation["status"];
  message: string;
}): ImportCommitOperation {
  return {
    stageId:
      record.stageId,
    decision:
      record.decision,
    incomingId:
      record.incoming.id,
    existingFragranceId:
      record.selectedExistingFragranceId,
    status,
    message,
  };
}

function buildCommitReport({
  session,
  operations,
  resultingCatalogSize,
}: {
  session: ImportSession;
  operations:
    ImportCommitOperation[];
  resultingCatalogSize: number;
}) {
  const count = (
    status:
      ImportCommitOperation["status"],
  ) =>
    operations.filter(
      (operation) =>
        operation.status ===
        status,
    ).length;

  const failedCount =
    count("failed");

  return {
    commitId:
      createId("import-commit"),
    sessionId:
      session.sessionId,
    modelVersion:
      "GDI-2.0.0" as const,
    committedAt:
      new Date().toISOString(),
    success:
      failedCount === 0,
    createdCount:
      count("created"),
    updatedCount:
      count("updated"),
    mergedCount:
      count("merged"),
    skippedCount:
      count("skipped"),
    rejectedCount:
      count("rejected"),
    failedCount,
    operations,
    resultingCatalogSize,
  };
}

function createId(
  prefix: string,
) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}
