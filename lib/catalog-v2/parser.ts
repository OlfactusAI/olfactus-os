import type {
  CatalogImportRow,
} from "@/lib/catalog-v2/types";

export function parseCatalogJson(
  input: string,
): CatalogImportRow[] {
  const parsed =
    JSON.parse(
      input,
    ) as unknown;

  if (
    !Array.isArray(
      parsed,
    )
  ) {
    throw new Error(
      "Catalog JSON must contain an array of fragrance records.",
    );
  }

  return parsed as
    CatalogImportRow[];
}

export function parseCatalogCsv(
  input: string,
): CatalogImportRow[] {
  const lines =
    input
      .split(
        /\r?\n/g,
      )
      .filter(
        (line) =>
          line.trim(),
      );

  if (
    lines.length <
    2
  ) {
    return [];
  }

  const headers =
    splitCsvLine(
      lines[0],
    );

  return lines
    .slice(
      1,
    )
    .map(
      (line) => {
        const values =
          splitCsvLine(
            line,
          );

        const row:
          Record<
            string,
            string
          > = {};

        headers.forEach(
          (
            header,
            index,
          ) => {
            row[
              header
            ] =
              values[
                index
              ] ??
              "";
          },
        );

        return row as
          CatalogImportRow;
      },
    );
}

function splitCsvLine(
  line: string,
) {
  const values:
    string[] = [];
  let current = "";
  let quoted =
    false;

  for (
    let index = 0;
    index <
    line.length;
    index += 1
  ) {
    const char =
      line[index];

    if (
      char ===
      '"'
    ) {
      if (
        quoted &&
        line[
          index +
            1
        ] ===
          '"'
      ) {
        current +=
          '"';
        index +=
          1;
      } else {
        quoted =
          !quoted;
      }

      continue;
    }

    if (
      char ===
        "," &&
      !quoted
    ) {
      values.push(
        current.trim(),
      );
      current = "";
      continue;
    }

    current +=
      char;
  }

  values.push(
    current.trim(),
  );

  return values;
}
