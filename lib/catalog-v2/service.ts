import type {
  CatalogImportRow,
  CatalogSourceProvenance,
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import {
  previewCatalogImport,
} from "@/lib/catalog-v2/import-engine";
import {
  calculateCatalogCoverage,
} from "@/lib/catalog-v2/coverage";

export function createCatalogExpansionService(
  initial:
    CatalogV2Record[] =
      [],
) {
  let records = [
    ...initial,
  ];

  return {
    list() {
      return [
        ...records,
      ];
    },

    previewImport({
      rows,
      provenance,
    }: {
      rows:
        CatalogImportRow[];
      provenance:
        CatalogSourceProvenance;
    }) {
      return previewCatalogImport({
        rows,
        provenance,
        existing:
          records,
      });
    },

    commitValidated(
      incoming:
        CatalogV2Record[],
    ) {
      const byId =
        new Map(
          records.map(
            (record) => [
              record.canonicalId,
              record,
            ],
          ),
        );

      for (
        const record
        of incoming
      ) {
        byId.set(
          record.canonicalId,
          mergeRecords(
            byId.get(
              record.canonicalId,
            ),
            record,
          ),
        );
      }

      records = [
        ...byId.values(),
      ];

      return [
        ...records,
      ];
    },

    coverage() {
      return calculateCatalogCoverage(
        records,
      );
    },
  };
}

function mergeRecords(
  current:
    CatalogV2Record |
    undefined,
  incoming:
    CatalogV2Record,
) {
  if (!current) {
    return incoming;
  }

  return {
    ...current,
    ...incoming,
    aliases: [
      ...new Set([
        ...current.aliases,
        ...incoming.aliases,
      ]),
    ],
    perfumers: [
      ...new Set([
        ...current.perfumers,
        ...incoming.perfumers,
      ]),
    ],
    notes: [
      ...new Set([
        ...current.notes,
        ...incoming.notes,
      ]),
    ],
    accords: [
      ...new Set([
        ...current.accords,
        ...incoming.accords,
      ]),
    ],
    collections: [
      ...new Set([
        ...current.collections,
        ...incoming.collections,
      ]),
    ],
    provenance: [
      ...current.provenance,
      ...incoming.provenance.filter(
        (source) =>
          !current.provenance.some(
            (existing) =>
              existing.sourceId ===
                source.sourceId &&
              existing.sourceRecordId ===
                source.sourceRecordId,
          ),
      ),
    ],
    fieldConfidence: {
      ...current.fieldConfidence,
      ...incoming.fieldConfidence,
    },
  };
}

export type CatalogExpansionService =
  ReturnType<
    typeof createCatalogExpansionService
  >;
