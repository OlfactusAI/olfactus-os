import {
  parseCatalogCsv,
} from "@/lib/catalog-v2/parser";
import type {
  CatalogSourceAdapter,
} from "@/lib/catalog-v2/adapters/types";
import type {
  CatalogSourceProvenance,
} from "@/lib/catalog-v2/types";

export function createCsvCatalogAdapter({
  id,
  name,
  provenance,
}: {
  id: string;
  name: string;
  provenance:
    Omit<
      CatalogSourceProvenance,
      "sourceId" |
      "sourceName" |
      "importedAt"
    >;
}): CatalogSourceAdapter {
  return {
    id,
    name,

    load(
      input: string,
    ) {
      return {
        source: {
          ...provenance,
          sourceId:
            id,
          sourceName:
            name,
          importedAt:
            new Date()
              .toISOString(),
        },
        rows:
          parseCatalogCsv(
            input,
          ),
      };
    },
  };
}
