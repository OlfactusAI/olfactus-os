import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  entityCanonicalId,
  entitySlug,
  normalizeEntityLookup,
} from "@/lib/entities/normalization";
import {
  calculateFragranceRelationships,
} from "@/lib/entities/relationship-intelligence";
import type {
  EntityRegistry,
  EntityRelationship,
  EntityType,
  RegisteredEntity,
} from "@/lib/entities/types";

export function buildEntityRegistry(
  catalog:
    FragranceRecord[],
): EntityRegistry {
  const entities:
    RegisteredEntity[] = [];
  const relationships:
    EntityRelationship[] = [];
  const entityMap =
    new Map<
      string,
      RegisteredEntity
    >();

  function register(
    entity:
      RegisteredEntity,
  ) {
    const existing =
      entityMap.get(
        entity.canonicalId,
      );

    if (existing) {
      existing.aliases = [
        ...new Set([
          ...existing.aliases,
          ...entity.aliases,
        ]),
      ];
      existing.relationships = [
        ...existing.relationships,
        ...entity.relationships,
      ];
      return existing;
    }

    entityMap.set(
      entity.canonicalId,
      entity,
    );
    entities.push(entity);
    return entity;
  }

  function relate({
    type,
    sourceId,
    targetId,
    explanation,
    strength = 100,
    confidence = 90,
  }: Omit<
    EntityRelationship,
    "id"
  >) {
    const relationship:
      EntityRelationship = {
        id:
          `${type}:${sourceId}:${targetId}`,
        type,
        sourceId,
        targetId,
        strength,
        confidence,
        explanation,
      };

    relationships.push(
      relationship,
    );
    entityMap
      .get(sourceId)
      ?.relationships.push(
        relationship,
      );
    entityMap
      .get(targetId)
      ?.relationships.push(
        relationship,
      );
  }

  for (const fragrance of catalog) {
    const fragranceCanonicalId =
      entityCanonicalId({
        type: "fragrance",
        id:
          fragrance.id,
      });
    const brandId =
      entitySlug(
        fragrance.brand,
      );
    const brandCanonicalId =
      entityCanonicalId({
        type: "brand",
        id: brandId,
      });
    const familyId =
      entitySlug(
        fragrance.family,
      );
    const familyCanonicalId =
      entityCanonicalId({
        type: "family",
        id: familyId,
      });

    register({
      id: fragrance.id,
      canonicalId:
        fragranceCanonicalId,
      type: "fragrance",
      slug:
        entitySlug(
          fragrance.brand,
          fragrance.name,
        ),
      label:
        fragrance.name,
      subtitle:
        fragrance.brand,
      aliases: [
        fragrance.id,
        fragrance.name,
        `${fragrance.brand} ${fragrance.name}`,
        entitySlug(
          fragrance.brand,
          fragrance.name,
        ),
      ],
      confidence:
        fragrance.intelligence
          ?.confidence ??
        (fragrance.intelligenceStatus ===
        "validated"
          ? 92
          : fragrance.intelligenceStatus ===
              "calibration"
            ? 74
            : 45),
      status:
        fragrance.intelligenceStatus,
      metadata: {
        brand:
          fragrance.brand,
        concentration:
          fragrance.concentration,
        releaseYear:
          fragrance.releaseYear,
        family:
          fragrance.family,
        accords:
          fragrance.accords ??
          [],
        notes:
          fragrance.notes ??
          {},
        roles:
          fragrance.roles ??
          [],
        seasons:
          fragrance.seasons,
        dna:
          fragrance.dna,
        moods:
          fragrance.moods ??
          [],
        performance:
          fragrance.performance,
        perfumers:
          fragrance.perfumers ??
          [],
        sourceRecord:
          fragrance,
      },
      relationships: [],
    });

    register({
      id: brandId,
      canonicalId:
        brandCanonicalId,
      type: "brand",
      slug: brandId,
      label:
        fragrance.brand,
      aliases: [
        fragrance.brand,
        brandId,
      ],
      confidence: 90,
      status:
        "validated",
      metadata: {},
      relationships: [],
    });

    register({
      id: familyId,
      canonicalId:
        familyCanonicalId,
      type: "family",
      slug: familyId,
      label:
        fragrance.family,
      aliases: [
        fragrance.family,
        familyId,
      ],
      confidence: 82,
      status:
        "calibration",
      metadata: {},
      relationships: [],
    });

    relate({
      type:
        "made-by",
      sourceId:
        fragranceCanonicalId,
      targetId:
        brandCanonicalId,
      strength: 100,
      confidence: 98,
      explanation:
        `${fragrance.name} is released by ${fragrance.brand}.`,
    });

    relate({
      type:
        "offers-fragrance",
      sourceId:
        brandCanonicalId,
      targetId:
        fragranceCanonicalId,
      strength: 100,
      confidence: 98,
      explanation:
        `${fragrance.brand} offers ${fragrance.name}.`,
    });

    relate({
      type:
        "belongs-to-family",
      sourceId:
        fragranceCanonicalId,
      targetId:
        familyCanonicalId,
      strength: 92,
      confidence: 86,
      explanation:
        `${fragrance.name} is classified in the ${fragrance.family} family.`,
    });

    for (
      const perfumer
      of fragrance.perfumers ??
        []
    ) {
      const perfumerId =
        entitySlug(
          perfumer,
        );
      const canonicalId =
        entityCanonicalId({
          type:
            "perfumer",
          id: perfumerId,
        });

      register({
        id: perfumerId,
        canonicalId,
        type:
          "perfumer",
        slug: perfumerId,
        label: perfumer,
        aliases: [
          perfumer,
          perfumerId,
        ],
        confidence: 88,
        status:
          "calibration",
        metadata: {},
        relationships: [],
      });

      relate({
        type:
          "created-by",
        sourceId:
          fragranceCanonicalId,
        targetId:
          canonicalId,
        strength: 100,
        confidence: 92,
        explanation:
          `${fragrance.name} is credited to ${perfumer}.`,
      });

      relate({
        type:
          "created-fragrance",
        sourceId:
          canonicalId,
        targetId:
          fragranceCanonicalId,
        strength: 100,
        confidence: 92,
        explanation:
          `${perfumer} is credited on ${fragrance.name}.`,
      });
    }

    for (
      const accord
      of fragrance.accords ??
        []
    ) {
      const accordId =
        entitySlug(
          accord,
        );
      const canonicalId =
        entityCanonicalId({
          type:
            "accord",
          id: accordId,
        });

      register({
        id: accordId,
        canonicalId,
        type:
          "accord",
        slug: accordId,
        label: accord,
        aliases: [
          accord,
          accordId,
        ],
        confidence: 78,
        status:
          "calibration",
        metadata: {},
        relationships: [],
      });

      relate({
        type:
          "has-accord",
        sourceId:
          fragranceCanonicalId,
        targetId:
          canonicalId,
        strength: 80,
        confidence: 78,
        explanation:
          `${accord} is listed among ${fragrance.name}'s accords.`,
      });

      relate({
        type:
          "appears-in",
        sourceId:
          canonicalId,
        targetId:
          fragranceCanonicalId,
        strength: 80,
        confidence: 78,
        explanation:
          `${accord} appears in ${fragrance.name}.`,
      });
    }

    const noteEntries =
      Object.values(
        fragrance.notes ??
        {},
      ).flatMap(
        (notes) =>
          Array.isArray(
            notes,
          )
            ? notes
            : [],
      );

    for (
      const note
      of noteEntries
    ) {
      const noteId =
        entitySlug(note);
      const canonicalId =
        entityCanonicalId({
          type: "note",
          id: noteId,
        });

      register({
        id: noteId,
        canonicalId,
        type: "note",
        slug: noteId,
        label: note,
        aliases: [
          note,
          noteId,
        ],
        confidence: 80,
        status:
          "calibration",
        metadata: {},
        relationships: [],
      });

      relate({
        type:
          "contains-note",
        sourceId:
          fragranceCanonicalId,
        targetId:
          canonicalId,
        strength: 78,
        confidence: 80,
        explanation:
          `${note} is listed in ${fragrance.name}.`,
      });

      relate({
        type:
          "appears-in",
        sourceId:
          canonicalId,
        targetId:
          fragranceCanonicalId,
        strength: 78,
        confidence: 80,
        explanation:
          `${note} appears in ${fragrance.name}.`,
      });
    }
  }


  for (const fragrance of catalog) {
    const sourceId = entityCanonicalId({
      type: "fragrance",
      id: fragrance.id,
    });

    for (const calculated of calculateFragranceRelationships(
      fragrance,
      catalog,
    )) {
      const targetId = entityCanonicalId({
        type: "fragrance",
        id: calculated.targetFragranceId,
      });

      const relationship: EntityRelationship = {
        id:
          `${calculated.relationship}:${sourceId}:${targetId}`,
        type:
          calculated.relationship as EntityRelationship["type"],
        sourceId,
        targetId,
        strength: calculated.strength,
        confidence: calculated.confidence,
        explanation:
          `${calculated.explanation} Evidence: ${calculated.evidence.join("; ")}.`,
      };

      relationships.push(relationship);
      entityMap.get(sourceId)?.relationships.push(relationship);
      entityMap.get(targetId)?.relationships.push(relationship);
    }
  }

  const byLookup =
    new Map<
      string,
      RegisteredEntity
    >();

  for (const entity of entities) {
    const lookupValues = [
      entity.id,
      entity.slug,
      entity.label,
      entity.canonicalId,
      ...entity.aliases,
    ];

    for (const value of lookupValues) {
      byLookup.set(
        `${entity.type}:${normalizeEntityLookup(
          value,
        )}`,
        entity,
      );
    }
  }

  return {
    entities,
    byCanonicalId:
      entityMap,
    byLookup,
    relationships,
  };
}

export function resolveEntity(
  registry:
    EntityRegistry,
  type:
    EntityType,
  identifier: string,
) {
  return (
    registry.byCanonicalId.get(
      `${type}:${identifier}`,
    ) ??
    registry.byLookup.get(
      `${type}:${normalizeEntityLookup(
        identifier,
      )}`,
    ) ??
    null
  );
}
