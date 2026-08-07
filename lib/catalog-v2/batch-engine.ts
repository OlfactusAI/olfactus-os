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
import type {
  OlfactusEventBus,
} from "@/lib/platform/event-bus";

export async function runCatalogBatch({
  adapter,
  input,
  existing = [],
  eventBus,
}: {
  adapter:
    CatalogSourceAdapter;
  input: string;
  existing?:
    CatalogV2Record[];
  eventBus?:
    OlfactusEventBus;
}) {
  const batch =
    await adapter.load(
      input,
    );

  const batchId =
    `${batch.source.sourceId}:${batch.source.importedAt}`;

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
      (record) => {
        const row =
          staging.stage({
            record,
          });

        eventBus?.publish(
          "catalog.record.staged",
          {
            stagingId:
              row.stagingId,
            canonicalId:
              record.canonicalId,
            sourceId:
              batch.source.sourceId,
          },
          {
            source:
              "catalog-v2",
            correlationId:
              batchId,
          },
        );

        return row;
      },
    );

  const activation =
    staged.map(
      (row) => {
        const decision =
          evaluateCatalogActivation(
            row,
          );

        eventBus?.publish(
          "catalog.record.activation-evaluated",
          {
            stagingId:
              row.stagingId,
            canonicalId:
              row.record.canonicalId,
            allowed:
              decision.allowed,
            confidence:
              decision.confidence,
            reasons: [
              ...decision.reasons,
            ],
          },
          {
            source:
              "catalog-v2",
            correlationId:
              batchId,
          },
        );

        return {
          stagingId:
            row.stagingId,
          decision,
        };
      },
    );

  const metrics = {
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
  };

  eventBus?.publish(
    "catalog.batch.completed",
    {
      batchId,
      sourceId:
        batch.source.sourceId,
      ...metrics,
    },
    {
      source:
        "catalog-v2",
      correlationId:
        batchId,
    },
  );

  return {
    batchId,
    source:
      batch.source,
    preview,
    staging,
    staged,
    activation,
    metrics,

    rollback() {
      for (
        const row
        of staging.list()
      ) {
        staging.remove(
          row.stagingId,
        );
      }

      const rolledBack =
        staged.length;

      eventBus?.publish(
        "catalog.batch.rolled-back",
        {
          batchId,
          rolledBack,
        },
        {
          source:
            "catalog-v2",
          correlationId:
            batchId,
        },
      );

      return {
        rolledBack,
      };
    },
  };
}
