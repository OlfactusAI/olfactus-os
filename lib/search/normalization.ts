const combiningMarks =
  /[\u0300-\u036f]/g;

export function normalizeSearchText(
  value: string,
) {
  return value
    .normalize("NFKD")
    .replace(
      combiningMarks,
      "",
    )
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeSearchText(
  value: string,
) {
  return normalizeSearchText(
    value,
  )
    .split(" ")
    .filter(Boolean);
}

export function uniqueSearchValues(
  values: string[],
) {
  const seen =
    new Set<string>();

  return values.filter(
    (value) => {
      const normalized =
        normalizeSearchText(
          value,
        );

      if (
        !normalized ||
        seen.has(normalized)
      ) {
        return false;
      }

      seen.add(normalized);
      return true;
    },
  );
}
