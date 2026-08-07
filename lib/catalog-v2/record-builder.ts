import {
  buildCatalogCanonicalId,
  listValue,
} from "@/lib/catalog-v2/normalize";
import {
  parseYear,
  validateCatalogImportRow,
} from "@/lib/catalog-v2/validator";
import type {
  CatalogImportRow,
  CatalogSourceProvenance,
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

export function buildCatalogV2Record({
  row,
  provenance,
}: {
  row:
    CatalogImportRow;
  provenance:
    CatalogSourceProvenance;
}): {
  record?:
    CatalogV2Record;
  issues:
    ReturnType<
      typeof validateCatalogImportRow
    >["issues"];
} {
  const validation =
    validateCatalogImportRow(
      row,
    );

  if (
    !validation.valid
  ) {
    return {
      issues:
        validation.issues,
    };
  }

  const brand =
    row.brand!.trim();
  const name =
    row.name!.trim();

  const record:
    CatalogV2Record = {
      canonicalId:
        buildCatalogCanonicalId({
          brand,
          name,
        }),
      brand,
      name,
      aliases:
        listValue(
          row.aliases,
        ),
      releaseYear:
        parseYear(
          row.releaseYear,
        ),
      concentration:
        clean(
          row.concentration,
        ),
      genderPositioning:
        clean(
          row.genderPositioning,
        ),
      family:
        clean(
          row.family,
        ),
      perfumers:
        listValue(
          row.perfumers,
        ),
      notes:
        listValue(
          row.notes,
        ),
      accords:
        listValue(
          row.accords,
        ),
      collections:
        listValue(
          row.collections,
        ),
      parentCompany:
        clean(
          row.parentCompany,
        ),
      country:
        clean(
          row.country,
        ),
      validationStatus:
        validation.issues.some(
          (issue) =>
            issue.severity ===
            "warning",
        )
          ? "review"
          : "draft",
      provenance: [
        provenance,
      ],
      fieldConfidence:
        buildFieldConfidence(
          row,
          provenance.confidence,
        ),
    };

  return {
    record,
    issues:
      validation.issues,
  };
}

function clean(
  value:
    | string
    | undefined,
) {
  const output =
    value?.trim();

  return output ||
    undefined;
}

function buildFieldConfidence(
  row:
    CatalogImportRow,
  sourceConfidence:
    number,
) {
  const output:
    Record<
      string,
      number
    > = {};

  for (
    const [
      key,
      value,
    ]
    of Object.entries(
      row,
    )
  ) {
    if (
      value !==
        undefined &&
      value !==
        ""
    ) {
      output[key] =
        Math.max(
          0,
          Math.min(
            100,
            sourceConfidence,
          ),
        );
    }
  }

  return output;
}
