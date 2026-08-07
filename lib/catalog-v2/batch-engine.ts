import type {
  CatalogSourceAdapter,
} from "@/lib/catalog-v2/adapters/types";
import {
  previewCatalogImport,
} from "@/lib/catalog-v2/import-engine";
import {
  createCatalogStagingStore,
} from "@/lib/catalog-v2/staging/store";
import {
  evaluateCatalogActivation,
} from "@/lib/catalog-v2/activation/gateway";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

export async function runCatalogBatch({
  adapter,
  input,
  existing = [],
}: {
  adapter:
    CatalogSourceAdapter;
  input: string;
  existing?:
    CatalogV2Record[];
}) {
  const batch =
    await adapter.load(
      input,
    );

  const preview =
    previewCatalogImport({
      rows:
        batch.rows,
      provenance:
        batch.source,
      existing,
    });

  const staging =
    createCatalogStagingStore();

  const staged =
    preview.accepted.map(
      (record) =>
        staging.stage({
          record,
        }),
    );

  const activation =
    staged.map(
      (row) => ({
        stagingId:
          row.stagingId,
        decision:
          evaluateCatalogActivation(
            row,
          ),
      }),
    );

  return {
    batchId:
      `${batch.source.sourceId}:${batch.source.importedAt}`,
    source:
      batch.source,
    preview,
    staging,
    staged,
    activation,
    metrics: {
      incoming:
        batch.rows.length,
      accepted:
        preview.accepted.length,
      rejected:
        preview.rejected.length,
      duplicateCandidates:
        preview.duplicateCandidates.length,
      activationReady:
        activation.filter(
          (item) =>
            item.decision.allowed,
        ).length,
    },

    rollback() {
      for (
        const row
        of staging.list()
      ) {
        staging.remove(
          row.stagingId,
        );
      }

      return {
        rolledBack:
          staged.length,
      };
    },
  };
}
