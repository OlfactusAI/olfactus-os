import type {
  GlobalFragranceDatabase,
  GlobalFragranceRecord,
} from "@/lib/database/schema";

export interface DatabaseValidationIssue {
  severity:
    | "error"
    | "warning"
    | "info";
  entityType:
    | "database"
    | "fragrance"
    | "brand"
    | "perfumer"
    | "note"
    | "accord";
  entityId: string;
  field?: string;
  message: string;
}

export interface DatabaseValidationResult {
  valid: boolean;
  score: number;
  issues: DatabaseValidationIssue[];
  counts: {
    errors: number;
    warnings: number;
    info: number;
  };
}

export function validateGlobalFragranceDatabase(
  database: GlobalFragranceDatabase,
): DatabaseValidationResult {
  const issues: DatabaseValidationIssue[] =
    [];

  const fragranceIds = new Set<string>();
  const slugs = new Set<string>();

  for (const fragrance of database.fragrances) {
    if (fragranceIds.has(fragrance.id)) {
      issues.push(
        issue(
          "error",
          "fragrance",
          fragrance.id,
          "id",
          "Duplicate fragrance ID.",
        ),
      );
    }
    fragranceIds.add(fragrance.id);

    if (
      slugs.has(
        fragrance.canonicalSlug,
      )
    ) {
      issues.push(
        issue(
          "warning",
          "fragrance",
          fragrance.id,
          "canonicalSlug",
          "Duplicate canonical slug.",
        ),
      );
    }
    slugs.add(fragrance.canonicalSlug);

    issues.push(
      ...validateFragrance(
        fragrance,
      ),
    );
  }

  validateUniqueIds({
    values: database.brands,
    entityType: "brand",
    issues,
  });
  validateUniqueIds({
    values: database.perfumers,
    entityType: "perfumer",
    issues,
  });
  validateUniqueIds({
    values: database.notes,
    entityType: "note",
    issues,
  });
  validateUniqueIds({
    values: database.accords,
    entityType: "accord",
    issues,
  });

  const counts = {
    errors:
      issues.filter(
        (item) =>
          item.severity === "error",
      ).length,
    warnings:
      issues.filter(
        (item) =>
          item.severity ===
          "warning",
      ).length,
    info:
      issues.filter(
        (item) =>
          item.severity === "info",
      ).length,
  };

  const score = Math.max(
    0,
    Math.round(
      100 -
        counts.errors * 12 -
        counts.warnings * 2 -
        counts.info * 0.25,
    ),
  );

  return {
    valid: counts.errors === 0,
    score,
    issues,
    counts,
  };
}

function validateFragrance(
  fragrance: GlobalFragranceRecord,
) {
  const issues: DatabaseValidationIssue[] =
    [];

  if (!fragrance.brandId) {
    issues.push(
      issue(
        "error",
        "fragrance",
        fragrance.id,
        "brandId",
        "Missing normalized brand reference.",
      ),
    );
  }

  if (!fragrance.concentrationId) {
    issues.push(
      issue(
        "error",
        "fragrance",
        fragrance.id,
        "concentrationId",
        "Missing normalized concentration.",
      ),
    );
  }

  if (
    fragrance.dataQualityScore < 50
  ) {
    issues.push(
      issue(
        "warning",
        "fragrance",
        fragrance.id,
        "dataQualityScore",
        "Data quality is below 50.",
      ),
    );
  }

  if (
    fragrance.releaseYear &&
    (fragrance.releaseYear < 1700 ||
      fragrance.releaseYear >
        new Date().getFullYear() + 1)
  ) {
    issues.push(
      issue(
        "warning",
        "fragrance",
        fragrance.id,
        "releaseYear",
        "Release year is outside the expected range.",
      ),
    );
  }

  for (const rating of fragrance.ratings) {
    if (
      rating.score < 0 ||
      rating.score >
        rating.scaleMaximum
    ) {
      issues.push(
        issue(
          "error",
          "fragrance",
          fragrance.id,
          "ratings",
          "Rating score exceeds its declared scale.",
        ),
      );
    }
  }

  return issues;
}

function validateUniqueIds({
  values,
  entityType,
  issues,
}: {
  values: Array<{ id: string }>;
  entityType:
    | "brand"
    | "perfumer"
    | "note"
    | "accord";
  issues: DatabaseValidationIssue[];
}) {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value.id)) {
      issues.push(
        issue(
          "error",
          entityType,
          value.id,
          "id",
          `Duplicate ${entityType} ID.`,
        ),
      );
    }
    seen.add(value.id);
  }
}

function issue(
  severity:
    | "error"
    | "warning"
    | "info",
  entityType:
    DatabaseValidationIssue["entityType"],
  entityId: string,
  field: string,
  message: string,
): DatabaseValidationIssue {
  return {
    severity,
    entityType,
    entityId,
    field,
    message,
  };
}
