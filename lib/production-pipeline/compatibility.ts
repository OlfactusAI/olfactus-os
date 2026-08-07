import type {
  ProductionCompatibilityResult,
} from "@/lib/production-pipeline/types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";

export function scanReferenceProductionCompatibility(
  record:
    ReferenceRegistryRecord,
): ProductionCompatibilityResult[] {
  return [
    check(
      "gold-standard-certificate",
      Boolean(
        record.certificate
          .certificateId &&
        record.certificate
          .locked,
      ),
      "Gold Standard certificate must exist and be locked.",
    ),
    check(
      "version-locked",
      record.certificate
        .locked ===
        true,
      "Certified version must be locked.",
    ),
    check(
      "dna-profile",
      record.coverage
        .globalIntelligence >=
        100,
      "Normalized DNA intelligence must be available.",
    ),
    check(
      "season-profile",
      record.coverage
        .weather >=
        100,
      "Season/weather compatibility profile must be available.",
    ),
    check(
      "weather-profile",
      record.coverage
        .weather >=
        100,
      "Weather profile must be complete.",
    ),
    check(
      "role-profile",
      record.coverage
        .recommendation >=
        100,
      "Recommendation role fingerprint must be complete.",
    ),
    check(
      "performance-profile",
      record.coverage
        .globalIntelligence >=
        100,
      "Performance intelligence must be normalized for production.",
    ),
    check(
      "similarity-fingerprint",
      record.coverage
        .similarity >=
        100,
      "Similarity fingerprint must be complete.",
    ),
    check(
      "recommendation-fingerprint",
      record.coverage
        .recommendation >=
        100,
      "Recommendation fingerprint must be complete.",
    ),
    check(
      "collection-twin-fingerprint",
      record.coverage
        .collectionTwin >=
        100,
      "Collection Twin fingerprint must be complete.",
    ),
  ];
}

export function compatibilityBlockers(
  results:
    ProductionCompatibilityResult[],
) {
  return results
    .filter(
      (result) =>
        !result.passed,
    )
    .map(
      (result) =>
        result.detail,
    );
}

function check(
  checkName:
    ProductionCompatibilityResult["check"],
  passed: boolean,
  detail: string,
): ProductionCompatibilityResult {
  return {
    check:
      checkName,
    passed,
    detail,
  };
}
