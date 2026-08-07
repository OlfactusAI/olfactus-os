import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  OlfactusEventBus,
} from "@/lib/platform/event-bus";
import {
  assessCatalogActivationLevel,
} from "@/lib/catalog-v2/activation/levels";
import type {
  ActivatedCatalogV2Entity,
  CatalogV2IntelligenceProfile,
} from "@/lib/catalog-v2/activation/types";
import type {
  StagedCatalogRecord,
} from "@/lib/catalog-v2/staging/types";

export function activateCatalogV2Record({
  staged,
  intelligenceProfile,
  eventBus,
}: {
  staged: StagedCatalogRecord;
  intelligenceProfile?: CatalogV2IntelligenceProfile;
  eventBus?: OlfactusEventBus;
}): ActivatedCatalogV2Entity {
  const assessment =
    assessCatalogActivationLevel({
      staged,
      intelligenceProfile,
    });

  if (!assessment.decision.allowed) {
    throw new Error(
      `Catalog activation blocked for ${staged.record.canonicalId}: ${assessment.decision.reasons.join(" ")}`,
    );
  }

  const activatedAt =
    new Date().toISOString();
  const activationId =
    `activation:${staged.record.canonicalId}`;

  const fragrance =
    assessment.intelligenceEligible &&
    intelligenceProfile
      ? buildFragranceRecord({
          staged,
          intelligenceProfile,
          confidence:
            assessment.decision.confidence,
        })
      : undefined;

  const entity:
    ActivatedCatalogV2Entity = {
      canonicalId:
        staged.record.canonicalId,
      activationId,
      activatedAt,
      level:
        assessment.level,
      sourceRecord:
        staged.record,
      fragrance,
      confidence:
        assessment.decision.confidence,
    };

  eventBus?.publish(
    "catalog.record.activated",
    {
      canonicalId:
        entity.canonicalId,
      activationLevel:
        entity.level,
    },
    {
      source:
        "catalog-activation-bridge",
    },
  );

  return entity;
}

export function activateCatalogV2Batch({
  records,
  intelligenceProfiles = {},
  eventBus,
}: {
  records: StagedCatalogRecord[];
  intelligenceProfiles?: Record<
    string,
    CatalogV2IntelligenceProfile
  >;
  eventBus?: OlfactusEventBus;
}) {
  const activated:
    ActivatedCatalogV2Entity[] = [];
  const blocked: Array<{
    stagingId: string;
    canonicalId: string;
    reason: string;
  }> = [];

  for (const staged of records) {
    try {
      activated.push(
        activateCatalogV2Record({
          staged,
          intelligenceProfile:
            intelligenceProfiles[
              staged.record.canonicalId
            ],
          eventBus,
        }),
      );
    } catch (error) {
      blocked.push({
        stagingId:
          staged.stagingId,
        canonicalId:
          staged.record.canonicalId,
        reason:
          error instanceof Error
            ? error.message
            : "Catalog activation failed.",
      });
    }
  }

  return {
    activated,
    blocked,
    intelligenceRecords:
      activated
        .map(
          (entity) =>
            entity.fragrance,
        )
        .filter(
          (
            fragrance,
          ): fragrance is FragranceRecord =>
            Boolean(fragrance),
        ),
  };
}

function buildFragranceRecord({
  staged,
  intelligenceProfile,
  confidence,
}: {
  staged: StagedCatalogRecord;
  intelligenceProfile: CatalogV2IntelligenceProfile;
  confidence: number;
}): FragranceRecord {
  const record =
    staged.record;

  return {
    id:
      `catalog-v2:${record.canonicalId}`,
    brand:
      record.brand,
    name:
      record.name,
    concentration:
      record.concentration!,
    releaseYear:
      record.releaseYear,
    perfumers:
      record.perfumers,
    countryOfOrigin:
      record.country,
    family:
      record.family!,
    accords:
      record.accords,
    notes:
      intelligenceProfile.notes,
    roles:
      intelligenceProfile.roles,
    seasons:
      intelligenceProfile.seasons,
    dna:
      intelligenceProfile.dna,
    moods:
      intelligenceProfile.moods,
    performance:
      intelligenceProfile.performance,
    market:
      intelligenceProfile.market,
    intelligenceStatus:
      intelligenceProfile.intelligenceStatus ??
      "calibration",
    intelligence: {
      confidence,
      version:
        "CATALOG-V2-ACTIVATION-1.0.0",
      lastReviewed:
        staged.stagedAt,
      reviewedBy: [
        "Catalog Activation Bridge",
      ],
    },
  };
}
