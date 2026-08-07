import {
  buildCatalogV2Record,
} from "@/lib/catalog-v2/record-builder";
import {
  findCatalogDuplicateCandidates,
} from "@/lib/catalog-v2/dedupe";
import type {
  CatalogImportPreview,
  CatalogImportRow,
  CatalogSourceProvenance,
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

export function previewCatalogImport({
  rows,
  provenance,
  existing = [],
}: {
  rows:
    CatalogImportRow[];
  provenance:
    CatalogSourceProvenance;
  existing?:
    CatalogV2Record[];
}): CatalogImportPreview {
  const accepted:
    CatalogV2Record[] =
      [];
  const rejected:
    CatalogImportPreview["rejected"] =
      [];

  for (
    const row
    of rows
  ) {
    const result =
      buildCatalogV2Record({
        row,
        provenance,
      });

    if (
      result.record
    ) {
      accepted.push(
        result.record,
      );
    } else {
      rejected.push({
        row,
        issues:
          result.issues,
      });
    }
  }

  return {
    accepted,
    rejected,
    duplicateCandidates:
      findCatalogDuplicateCandidates({
        incoming:
          accepted,
        existing,
      }),
  };
}
