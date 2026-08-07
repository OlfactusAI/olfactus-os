import type {
  CatalogImportRow,
  CatalogSourceProvenance,
} from "@/lib/catalog-v2/types";

export interface CatalogSourceBatch {
  source:
    CatalogSourceProvenance;
  rows:
    CatalogImportRow[];
}

export interface CatalogSourceAdapter {
  id: string;
  name: string;

  load(
    input: string,
  ):
    | CatalogSourceBatch
    | Promise<
        CatalogSourceBatch
      >;
}
