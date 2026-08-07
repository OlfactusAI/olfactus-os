import type {
  StagedCatalogRecord,
} from "@/lib/catalog-v2/staging/types";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

export function createCatalogStagingStore(
  initial:
    StagedCatalogRecord[] =
      [],
) {
  let rows = [
    ...initial,
  ];

  return {
    list() {
      return [
        ...rows,
      ];
    },

    stage({
      record,
      issues = [],
      conflicts = [],
    }: {
      record:
        CatalogV2Record;
      issues?: StagedCatalogRecord["issues"];
      conflicts?: StagedCatalogRecord["conflicts"];
    }) {
      const staged:
        StagedCatalogRecord = {
          stagingId:
            `${record.canonicalId}:${Date.now()}`,
          record,
          stagedAt:
            new Date()
              .toISOString(),
          status:
            conflicts.length ||
            issues.some(
              (issue) =>
                issue.severity ===
                "warning",
            )
              ? "review"
              : "pending",
          issues,
          conflicts,
        };

      rows.push(
        staged,
      );

      return staged;
    },

    setStatus(
      stagingId: string,
      status:
        StagedCatalogRecord["status"],
    ) {
      rows =
        rows.map(
          (row) =>
            row.stagingId ===
            stagingId
              ? {
                  ...row,
                  status,
                }
              : row,
        );
    },

    remove(
      stagingId: string,
    ) {
      rows =
        rows.filter(
          (row) =>
            row.stagingId !==
            stagingId,
        );
    },

    clearRejected() {
      rows =
        rows.filter(
          (row) =>
            row.status !==
            "rejected",
        );
    },
  };
}

export type CatalogStagingStore =
  ReturnType<
    typeof createCatalogStagingStore
  >;
