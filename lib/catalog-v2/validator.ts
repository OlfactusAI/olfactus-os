import type {
  CatalogImportRow,
  CatalogValidationIssue,
} from "@/lib/catalog-v2/types";

export function validateCatalogImportRow(
  row:
    CatalogImportRow,
) {
  const issues:
    CatalogValidationIssue[] =
      [];

  if (
    !row.brand?.trim()
  ) {
    issues.push({
      severity:
        "error",
      field:
        "brand",
      message:
        "Brand is required.",
    });
  }

  if (
    !row.name?.trim()
  ) {
    issues.push({
      severity:
        "error",
      field:
        "name",
      message:
        "Fragrance name is required.",
    });
  }

  const year =
    parseYear(
      row.releaseYear,
    );

  if (
    year !==
      undefined &&
    (
      year <
        1800 ||
      year >
        new Date().getFullYear() +
          1
    )
  ) {
    issues.push({
      severity:
        "warning",
      field:
        "releaseYear",
      message:
        "Release year is outside the expected perfume-era range.",
    });
  }

  if (
    !row.perfumers
  ) {
    issues.push({
      severity:
        "info",
      field:
        "perfumers",
      message:
        "Perfumer data is missing.",
    });
  }

  if (
    !row.notes
  ) {
    issues.push({
      severity:
        "info",
      field:
        "notes",
      message:
        "Note data is missing.",
    });
  }

  return {
    valid:
      !issues.some(
        (issue) =>
          issue.severity ===
          "error",
      ),
    issues,
  };
}

export function parseYear(
  value:
    | string
    | number
    | undefined,
) {
  if (
    value ===
    undefined ||
    value ===
    ""
  ) {
    return undefined;
  }

  const number =
    typeof value ===
    "number"
      ? value
      : Number.parseInt(
          value,
          10,
        );

  return Number.isFinite(
    number,
  )
    ? number
    : undefined;
}
