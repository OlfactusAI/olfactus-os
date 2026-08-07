import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import type {
  CatalogIntelligenceDraft,
  IntelligenceEvidenceClaim,
} from "@/lib/catalog-v2/enrichment/intelligence-types";

export function createCatalogIntelligenceDraft({
  record,
  roles,
  seasons,
  dna,
  moods,
  performance,
  timestamp =
    new Date().toISOString(),
}: {
  record:
    CatalogV2Record;

  roles:
    CatalogIntelligenceDraft["roles"];

  seasons:
    CatalogIntelligenceDraft["seasons"];

  dna:
    CatalogIntelligenceDraft["dna"];

  moods:
    CatalogIntelligenceDraft["moods"];

  performance:
    CatalogIntelligenceDraft["performance"];

  timestamp?: string;
}): CatalogIntelligenceDraft {
  return {
    canonicalId:
      record.canonicalId,
    brand:
      record.brand,
    name:
      record.name,
    status:
      "draft",
    roles,
    seasons,
    dna,
    moods,
    performance,
    sourceRecord:
      record,
    createdAt:
      timestamp,
    updatedAt:
      timestamp,
  };
}

export function evidenceClaim<T>({
  value,
  confidence,
  method,
  evidence,
  provenance,
}: Omit<
  IntelligenceEvidenceClaim<T>,
  never
>): IntelligenceEvidenceClaim<T> {
  return {
    value,
    confidence:
      clampConfidence(
        confidence,
      ),
    method,
    evidence,
    provenance,
  };
}

function clampConfidence(
  confidence: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        confidence,
      ),
    ),
  );
}
