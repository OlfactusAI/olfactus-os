import {
  evaluateCatalogActivation,
} from "@/lib/catalog-v2/activation/gateway";
import type {
  CatalogV2IntelligenceProfile,
  CatalogActivationAssessment,
} from "@/lib/catalog-v2/activation/types";
import type {
  StagedCatalogRecord,
} from "@/lib/catalog-v2/staging/types";

export function assessCatalogActivationLevel({
  staged,
  intelligenceProfile,
}: {
  staged: StagedCatalogRecord;
  intelligenceProfile?: CatalogV2IntelligenceProfile;
}): CatalogActivationAssessment {
  const decision =
    evaluateCatalogActivation(
      staged,
    );

  const record =
    staged.record;

  const hasIdentity =
    Boolean(
      record.brand &&
        record.name &&
        record.concentration,
    );

  const hasDiscovery =
    hasIdentity &&
    Boolean(
      record.family &&
        (
          record.notes.length > 0 ||
          record.accords.length > 0 ||
          record.perfumers.length > 0
        ),
    );

  const hasIntelligence =
    hasDiscovery &&
    Boolean(
      intelligenceProfile &&
        intelligenceProfile.roles.length > 0 &&
        intelligenceProfile.moods.length > 0,
    );

  const hasFull =
    hasIntelligence &&
    record.validationStatus ===
      "validated" &&
    decision.confidence >= 85 &&
    record.provenance.length >= 2;

  const level =
    hasFull
      ? "full"
      : hasIntelligence
        ? "intelligence"
        : hasDiscovery
          ? "discovery"
          : "identity";

  const reasons = [
    ...decision.reasons,
  ];

  if (!hasIdentity) {
    reasons.push(
      "Identity activation requires brand, name, and concentration.",
    );
  }

  if (
    hasDiscovery &&
    !intelligenceProfile
  ) {
    reasons.push(
      "No intelligence profile is available, so the record cannot enter recommendation or prediction engines.",
    );
  }

  return {
    level,
    decision,
    reasons,
    intelligenceEligible:
      decision.allowed &&
      (
        level === "intelligence" ||
        level === "full"
      ),
  };
}
