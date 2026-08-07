import type {
  ImportDiagnostic,
  RawImportRow,
} from "@/lib/database/import/types";

export function parseCsvText(
  input: string,
) {
  const diagnostics:
    ImportDiagnostic[] = [];
  const rows =
    parseCsvRows(input);

  if (!rows.length) {
    return {
      rows: [] as RawImportRow[],
      diagnostics,
    };
  }

  const headers =
    rows[0].map(
      (value, index) =>
        value.trim() ||
        `column_${index + 1}`,
    );

  const records:
    RawImportRow[] = [];

  rows.slice(1).forEach(
    (values, rowIndex) => {
      const sourceRow =
        rowIndex + 2;

      if (
        values.every(
          (value) =>
            !value.trim(),
        )
      ) {
        return;
      }

      if (
        values.length >
        headers.length
      ) {
        diagnostics.push({
          row: sourceRow,
          code: "parse-error",
          severity: "warning",
          message:
            "Row contains more values than the header.",
        });
      }

      const record:
        RawImportRow = {};

      headers.forEach(
        (header, index) => {
          record[header] =
            values[index] ?? "";
        },
      );

      records.push(record);
    },
  );

  return {
    rows: records,
    diagnostics,
  };
}

function parseCsvRows(
  input: string,
) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (
    let index = 0;
    index < input.length;
    index += 1
  ) {
    const character =
      input[index];
    const next =
      input[index + 1];

    if (
      character === '"'
    ) {
      if (
        quoted &&
        next === '"'
      ) {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (
      character === "," &&
      !quoted
    ) {
      row.push(field);
      field = "";
      continue;
    }

    if (
      (character === "\n" ||
        character === "\r") &&
      !quoted
    ) {
      if (
        character === "\r" &&
        next === "\n"
      ) {
        index += 1;
      }

      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (
    field.length ||
    row.length
  ) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}
