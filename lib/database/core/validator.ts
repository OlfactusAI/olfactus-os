import type {
  GlobalDatabaseSnapshot,
  GlobalRelationship,
} from "@/lib/database/core/types";

export interface DatabaseValidationIssue {
  code:
    | "duplicate-id"
    | "missing-reference"
    | "invalid-score"
    | "invalid-line-member"
    | "invalid-relationship"
    | "metadata-mismatch";
  severity:
    | "error"
    | "warning";
  entityType: string;
  entityId?: string;
  message: string;
}

export interface DatabaseValidationResult {
  valid: boolean;
  issues: DatabaseValidationIssue[];
  errorCount: number;
  warningCount: number;
}

export function validateGlobalDatabase(
  snapshot: GlobalDatabaseSnapshot,
): DatabaseValidationResult {
  const issues:
    DatabaseValidationIssue[] = [];

  checkDuplicates(
    "fragrance",
    snapshot.fragrances.map(
      (item) => item.id,
    ),
    issues,
  );
  checkDuplicates(
    "brand",
    snapshot.brands.map(
      (item) => item.id,
    ),
    issues,
  );
  checkDuplicates(
    "perfumer",
    snapshot.perfumers.map(
      (item) => item.id,
    ),
    issues,
  );
  checkDuplicates(
    "note",
    snapshot.notes.map(
      (item) => item.id,
    ),
    issues,
  );
  checkDuplicates(
    "accord",
    snapshot.accords.map(
      (item) => item.id,
    ),
    issues,
  );
  checkDuplicates(
    "ingredient",
    snapshot.ingredients.map(
      (item) => item.id,
    ),
    issues,
  );
  checkDuplicates(
    "line",
    snapshot.lines.map(
      (item) => item.id,
    ),
    issues,
  );
  checkDuplicates(
    "relationship",
    snapshot.relationships.map(
      (item) => item.id,
    ),
    issues,
  );

  const ids = buildIdSets(snapshot);

  for (const fragrance of snapshot.fragrances) {
    if (
      !ids.brand.has(
        fragrance.brandId,
      )
    ) {
      issues.push({
        code: "missing-reference",
        severity: "error",
        entityType: "fragrance",
        entityId: fragrance.id,
        message:
          `Unknown brand reference: ${fragrance.brandId}`,
      });
    }

    for (const perfumerId of fragrance.perfumerIds) {
      if (!ids.perfumer.has(perfumerId)) {
        issues.push({
          code: "missing-reference",
          severity: "error",
          entityType: "fragrance",
          entityId: fragrance.id,
          message:
            `Unknown perfumer reference: ${perfumerId}`,
        });
      }
    }

    for (const noteId of [
      ...fragrance.noteIds.top,
      ...fragrance.noteIds.heart,
      ...fragrance.noteIds.base,
    ]) {
      if (!ids.note.has(noteId)) {
        issues.push({
          code: "missing-reference",
          severity: "warning",
          entityType: "fragrance",
          entityId: fragrance.id,
          message:
            `Unknown note reference: ${noteId}`,
        });
      }
    }

    for (const accordId of fragrance.accordIds) {
      if (!ids.accord.has(accordId)) {
        issues.push({
          code: "missing-reference",
          severity: "warning",
          entityType: "fragrance",
          entityId: fragrance.id,
          message:
            `Unknown accord reference: ${accordId}`,
        });
      }
    }

    checkScore(
      fragrance.dataQualityScore,
      "fragrance",
      fragrance.id,
      "dataQualityScore",
      issues,
    );
  }

  for (const line of snapshot.lines) {
    for (const memberId of line.memberFragranceIds) {
      if (!ids.fragrance.has(memberId)) {
        issues.push({
          code: "invalid-line-member",
          severity: "error",
          entityType: "line",
          entityId: line.id,
          message:
            `Unknown line member: ${memberId}`,
        });
      }
    }

    if (
      line.originalFragranceId &&
      !ids.fragrance.has(
        line.originalFragranceId,
      )
    ) {
      issues.push({
        code: "invalid-line-member",
        severity: "error",
        entityType: "line",
        entityId: line.id,
        message:
          `Unknown original fragrance: ${line.originalFragranceId}`,
      });
    }
  }

  for (const relationship of snapshot.relationships) {
    validateRelationship(
      relationship,
      ids,
      issues,
    );
  }

  const expected = {
    fragranceCount:
      snapshot.fragrances.length,
    brandCount:
      snapshot.brands.length,
    perfumerCount:
      snapshot.perfumers.length,
    noteCount:
      snapshot.notes.length,
    accordCount:
      snapshot.accords.length,
    ingredientCount:
      snapshot.ingredients.length,
    lineCount:
      snapshot.lines.length,
    relationshipCount:
      snapshot.relationships.length,
  };

  for (const [
    key,
    value,
  ] of Object.entries(expected)) {
    if (
      snapshot.metadata[
        key as keyof typeof expected
      ] !== value
    ) {
      issues.push({
        code: "metadata-mismatch",
        severity: "error",
        entityType: "snapshot",
        message:
          `${key} does not match entity array length.`,
      });
    }
  }

  const errorCount =
    issues.filter(
      (issue) =>
        issue.severity === "error",
    ).length;

  return {
    valid: errorCount === 0,
    issues,
    errorCount,
    warningCount:
      issues.length - errorCount,
  };
}

function validateRelationship(
  relationship: GlobalRelationship,
  ids: ReturnType<
    typeof buildIdSets
  >,
  issues: DatabaseValidationIssue[],
) {
  const sourceIds =
    getIds(
      relationship.sourceType,
      ids,
    );
  const targetIds =
    getIds(
      relationship.targetType,
      ids,
    );

  if (
    !sourceIds ||
    !sourceIds.has(
      relationship.sourceId,
    )
  ) {
    issues.push({
      code: "invalid-relationship",
      severity: "error",
      entityType: "relationship",
      entityId: relationship.id,
      message:
        `Unknown source: ${relationship.sourceType}:${relationship.sourceId}`,
    });
  }

  if (
    !targetIds ||
    !targetIds.has(
      relationship.targetId,
    )
  ) {
    issues.push({
      code: "invalid-relationship",
      severity: "error",
      entityType: "relationship",
      entityId: relationship.id,
      message:
        `Unknown target: ${relationship.targetType}:${relationship.targetId}`,
    });
  }

  checkScore(
    relationship.strength,
    "relationship",
    relationship.id,
    "strength",
    issues,
  );
  checkScore(
    relationship.confidence,
    "relationship",
    relationship.id,
    "confidence",
    issues,
  );
}

function buildIdSets(
  snapshot: GlobalDatabaseSnapshot,
) {
  return {
    fragrance:
      new Set(
        snapshot.fragrances.map(
          (item) => item.id,
        ),
      ),
    brand:
      new Set(
        snapshot.brands.map(
          (item) => item.id,
        ),
      ),
    perfumer:
      new Set(
        snapshot.perfumers.map(
          (item) => item.id,
        ),
      ),
    note:
      new Set(
        snapshot.notes.map(
          (item) => item.id,
        ),
      ),
    accord:
      new Set(
        snapshot.accords.map(
          (item) => item.id,
        ),
      ),
    concentration:
      new Set(
        snapshot.concentrations.map(
          (item) => item.id,
        ),
      ),
    country:
      new Set(
        snapshot.countries.map(
          (item) => item.code,
        ),
      ),
    ingredient:
      new Set(
        snapshot.ingredients.map(
          (item) => item.id,
        ),
      ),
    line:
      new Set(
        snapshot.lines.map(
          (item) => item.id,
        ),
      ),
  };
}

function getIds(
  type: string,
  ids: ReturnType<
    typeof buildIdSets
  >,
) {
  return ids[
    type as keyof typeof ids
  ];
}

function checkDuplicates(
  entityType: string,
  ids: string[],
  issues: DatabaseValidationIssue[],
) {
  const seen =
    new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      issues.push({
        code: "duplicate-id",
        severity: "error",
        entityType,
        entityId: id,
        message:
          `Duplicate ${entityType} ID: ${id}`,
      });
    }
    seen.add(id);
  }
}

function checkScore(
  value: number,
  entityType: string,
  entityId: string,
  field: string,
  issues: DatabaseValidationIssue[],
) {
  if (
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100
  ) {
    issues.push({
      code: "invalid-score",
      severity: "error",
      entityType,
      entityId,
      message:
        `${field} must be between 0 and 100.`,
    });
  }
}
