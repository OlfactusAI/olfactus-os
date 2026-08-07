import type {
  CatalogValidationIssue,
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import type {
  CatalogFieldConflict,
} from "@/lib/catalog-v2/conflicts/types";

export interface StagedCatalogRecord {
  stagingId: string;
  record:
    CatalogV2Record;
  stagedAt: string;
  status:
    | "pending"
    | "review"
    | "approved"
    | "rejected"
    | "activated";
  issues:
    CatalogValidationIssue[];
  conflicts:
    CatalogFieldConflict[];
}
