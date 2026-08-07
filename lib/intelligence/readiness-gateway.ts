import type { FragranceRecord } from "@/lib/domain/fragrance";
import { assessImportedFragranceReadiness } from "@/lib/database/imported-readiness";

export type IntelligenceEngine =
  | "recommendation"
  | "deal-lab"
  | "blind-buy-risk"
  | "duplication"
  | "collection-health"
  | "upgrade"
  | "knowledge-graph"
  | "lineage"
  | "search"
  | "explorer";

export interface IntelligenceEligibility {
  readiness: "ready" | "partial" | "search-only" | "blocked";
  confidence: number;
  allowedEngines: IntelligenceEngine[];
  restrictedEngines: IntelligenceEngine[];
  warnings: string[];
  missingFields: string[];
}

const advancedEngines: IntelligenceEngine[] = [
  "recommendation",
  "deal-lab",
  "blind-buy-risk",
  "duplication",
  "collection-health",
  "upgrade",
  "knowledge-graph",
  "lineage",
];

const discoveryEngines: IntelligenceEngine[] = [
  "search",
  "explorer",
];

export function evaluateIntelligenceEligibility(
  fragrance: FragranceRecord,
): IntelligenceEligibility {
  if (fragrance.intelligenceStatus === "validated") {
    return {
      readiness: "ready",
      confidence: fragrance.intelligence?.confidence ?? 96,
      allowedEngines: [...advancedEngines, ...discoveryEngines],
      restrictedEngines: [],
      warnings: [],
      missingFields: [],
    };
  }

  const assessment = assessImportedFragranceReadiness(fragrance);

  if (assessment.level === "ready") {
    return {
      readiness: "ready",
      confidence: Math.max(82, assessment.score),
      allowedEngines: [...advancedEngines, ...discoveryEngines],
      restrictedEngines: [],
      warnings: [],
      missingFields: assessment.missingFields,
    };
  }

  if (assessment.level === "partial") {
    return {
      readiness: "partial",
      confidence: Math.max(58, Math.min(81, assessment.score)),
      allowedEngines: [...advancedEngines, ...discoveryEngines],
      restrictedEngines: [],
      warnings: [
        `Limited confidence: missing ${assessment.missingFields.join(", ") || "supporting metadata"}.`,
        "Scores must be presented as calibrated rather than authoritative.",
      ],
      missingFields: assessment.missingFields,
    };
  }

  if (assessment.level === "search-only") {
    return {
      readiness: "search-only",
      confidence: Math.min(57, assessment.score),
      allowedEngines: [...discoveryEngines],
      restrictedEngines: [...advancedEngines],
      warnings: [
        `This record is searchable but excluded from advanced scoring because it is missing ${assessment.missingFields.join(", ") || "required metadata"}.`,
      ],
      missingFields: assessment.missingFields,
    };
  }

  return {
    readiness: "blocked",
    confidence: 0,
    allowedEngines: [],
    restrictedEngines: [...advancedEngines, ...discoveryEngines],
    warnings: ["This record is structurally incomplete and cannot enter intelligence workflows."],
    missingFields: assessment.missingFields,
  };
}

export function isEligibleForEngine(
  fragrance: FragranceRecord,
  engine: IntelligenceEngine,
) {
  return evaluateIntelligenceEligibility(fragrance).allowedEngines.includes(engine);
}

export function filterCatalogForEngine(
  catalog: FragranceRecord[],
  engine: IntelligenceEngine,
) {
  return catalog.filter((fragrance) => isEligibleForEngine(fragrance, engine));
}

export function assertEligibleForEngine(
  fragrance: FragranceRecord,
  engine: IntelligenceEngine,
) {
  const eligibility = evaluateIntelligenceEligibility(fragrance);

  if (!eligibility.allowedEngines.includes(engine)) {
    throw new Error(
      `${fragrance.brand} ${fragrance.name} is ${eligibility.readiness} and is not eligible for ${engine}. ${eligibility.warnings.join(" ")}`,
    );
  }

  return eligibility;
}
