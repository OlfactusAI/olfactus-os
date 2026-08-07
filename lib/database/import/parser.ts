import {
  createHeaderLookup,
  defaultImportColumnMap,
} from "@/lib/database/import/column-map";
import {
  parseCsvText,
} from "@/lib/database/import/csv-parser";
import {
  normalizeAvailability,
  normalizeCanonicalId,
  normalizeEntityLabel,
  normalizeInteger,
  normalizeList,
  normalizeScore,
} from "@/lib/database/import/normalization";
import type {
  ImportDiagnostic,
  ImportFormat,
  ImportParseResult,
  ImportParserOptions,
  NormalizedFragranceImport,
  RawImportRow,
} from "@/lib/database/import/types";

export function parseImportPayload({
  format,
  input,
  options = {},
}: {
  format: ImportFormat;
  input: string;
  options?: ImportParserOptions;
}): ImportParseResult {
  const diagnostics:
    ImportDiagnostic[] = [];

  let rows:
    RawImportRow[] = [];

  if (format === "csv") {
    const csv =
      parseCsvText(input);
    rows = csv.rows;
    diagnostics.push(
      ...csv.diagnostics,
    );
  } else {
    const json =
      parseJsonRows(input);
    rows = json.rows;
    diagnostics.push(
      ...json.diagnostics,
    );
  }

  const records:
    NormalizedFragranceImport[] = [];

  rows.forEach(
    (row, index) => {
      const sourceRow =
        index + 1;
      const result =
        normalizeFragranceRow({
          row,
          sourceRow,
          options,
        });

      diagnostics.push(
        ...result.diagnostics,
      );

      if (result.record) {
        records.push(
          result.record,
        );
      }
    },
  );

  const rejectedRows =
    new Set(
      diagnostics
        .filter(
          (diagnostic) =>
            diagnostic.severity ===
            "error",
        )
        .map(
          (diagnostic) =>
            diagnostic.row,
        ),
    );

  return {
    format,
    rowsReceived:
      rows.length,
    rowsParsed:
      records.length,
    rowsRejected:
      rejectedRows.size,
    records,
    diagnostics,
  };
}

export function normalizeFragranceRow({
  row,
  sourceRow,
  options = {},
}: {
  row: RawImportRow;
  sourceRow: number;
  options?: ImportParserOptions;
}) {
  const diagnostics:
    ImportDiagnostic[] = [];

  const headers =
    Object.keys(row);
  const lookup =
    createHeaderLookup(
      headers,
      defaultImportColumnMap,
    );

  const read = (
    key: keyof typeof lookup,
  ) => {
    const header =
      lookup[key];
    return header
      ? row[header]
      : undefined;
  };

  const name =
    normalizeEntityLabel(
      String(
        read("name") ?? "",
      ),
    );
  const brand =
    normalizeEntityLabel(
      String(
        read("brand") ?? "",
      ),
    );

  if (!name) {
    diagnostics.push({
      row: sourceRow,
      field: "name",
      code:
        "missing-required-field",
      severity: "error",
      message:
        "Fragrance name is required.",
    });
  }

  if (!brand) {
    diagnostics.push({
      row: sourceRow,
      field: "brand",
      code:
        "missing-required-field",
      severity: "error",
      message:
        "Brand is required.",
    });
  }

  const concentration =
    normalizeEntityLabel(
      String(
        read("concentration") ??
          options.defaultConcentration ??
          "Unknown",
      ),
    );

  const family =
    normalizeEntityLabel(
      String(
        read("family") ??
          options.defaultFamily ??
          "Unknown",
      ),
    );

  const releaseYear =
    normalizeInteger(
      read("releaseYear"),
    );

  if (
    read("releaseYear") !==
      undefined &&
    releaseYear === undefined
  ) {
    diagnostics.push({
      row: sourceRow,
      field: "releaseYear",
      code: "invalid-number",
      severity:
        options.strict
          ? "error"
          : "warning",
      message:
        "Release year could not be parsed.",
      value:
        read("releaseYear"),
    });
  }

  const longevity =
    normalizeScore(
      read("longevity"),
    );
  const projection =
    normalizeScore(
      read("projection"),
    );
  const sillage =
    normalizeScore(
      read("sillage"),
    );

  for (const [
    field,
    value,
    normalized,
  ] of [
    [
      "longevity",
      read("longevity"),
      longevity,
    ],
    [
      "projection",
      read("projection"),
      projection,
    ],
    [
      "sillage",
      read("sillage"),
      sillage,
    ],
  ] as const) {
    if (
      value !== undefined &&
      value !== "" &&
      normalized === undefined
    ) {
      diagnostics.push({
        row: sourceRow,
        field,
        code: "invalid-number",
        severity:
          options.strict
            ? "error"
            : "warning",
        message:
          `${field} could not be parsed.`,
        value,
      });
    }
  }

  if (
    diagnostics.some(
      (diagnostic) =>
        diagnostic.severity ===
        "error",
    )
  ) {
    return {
      record: null,
      diagnostics,
    };
  }

  const sourceUrl =
    normalizeEntityLabel(
      String(
        read("sourceUrl") ??
          options.sourceUrl ??
          "",
      ),
    );

  const explicitId =
    normalizeEntityLabel(
      String(
        read("id") ?? "",
      ),
    );

  const id =
    explicitId
      ? normalizeCanonicalId(
          explicitId,
        )
      : normalizeCanonicalId(
          brand,
          name,
          concentration,
        );

  const record:
    NormalizedFragranceImport = {
      entityKind:
        "fragrance",
      sourceRow,
      id,
      name,
      brand,
      concentration,
      releaseYear,
      family,
      perfumers:
        normalizeList(
          read("perfumers"),
        ),
      topNotes:
        normalizeList(
          read("topNotes"),
        ),
      heartNotes:
        normalizeList(
          read("heartNotes"),
        ),
      baseNotes:
        normalizeList(
          read("baseNotes"),
        ),
      accords:
        normalizeList(
          read("accords"),
        ),
      roles:
        normalizeList(
          read("roles"),
        ),
      moods:
        normalizeList(
          read("moods"),
        ),
      longevity,
      projection,
      sillage,
      availability:
        normalizeAvailability(
          read(
            "availability",
          ),
        ),
      aliases:
        normalizeList(
          read("aliases"),
        ),
      sourceReferences:
        options.sourceId ||
        options.sourceLabel ||
        sourceUrl
          ? [
              {
                id:
                  options.sourceId ??
                  normalizeCanonicalId(
                    options.sourceLabel ??
                      sourceUrl ??
                      "import",
                  ),
                sourceName:
                  options.sourceLabel ??
                  "Imported dataset",
                sourceUrl:
                  sourceUrl ||
                  undefined,
                retrievedAt:
                  new Date().toISOString(),
                confidence: 70,
              },
            ]
          : [],
      original: row,
    };

  if (!explicitId) {
    diagnostics.push({
      row: sourceRow,
      field: "id",
      code:
        "normalization-applied",
      severity: "info",
      message:
        `Generated canonical ID: ${id}`,
    });
  }

  return {
    record,
    diagnostics,
  };
}

function parseJsonRows(
  input: string,
) {
  const diagnostics:
    ImportDiagnostic[] = [];

  try {
    const parsed:
      unknown =
        JSON.parse(input);

    if (
      Array.isArray(parsed)
    ) {
      return {
        rows:
          parsed.filter(
            (
              item,
            ): item is RawImportRow =>
              Boolean(
                item &&
                  typeof item ===
                    "object" &&
                  !Array.isArray(
                    item,
                  ),
              ),
          ),
        diagnostics,
      };
    }

    if (
      parsed &&
      typeof parsed ===
        "object" &&
      "records" in parsed &&
      Array.isArray(
        (
          parsed as {
            records?: unknown;
          }
        ).records,
      )
    ) {
      return {
        rows: (
          parsed as {
            records:
              RawImportRow[];
          }
        ).records,
        diagnostics,
      };
    }

    diagnostics.push({
      row: 0,
      code:
        "unsupported-record",
      severity: "error",
      message:
        "JSON input must be an array or an object with a records array.",
    });
  } catch (error) {
    diagnostics.push({
      row: 0,
      code: "parse-error",
      severity: "error",
      message:
        error instanceof Error
          ? error.message
          : "JSON parsing failed.",
    });
  }

  return {
    rows: [] as RawImportRow[],
    diagnostics,
  };
}
