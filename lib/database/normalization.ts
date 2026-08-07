export function normalizeEntityName(
  value: string,
) {
  return value
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(/[’‘`]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

export function createCanonicalSlug(
  ...parts: Array<
    string | undefined
  >
) {
  return normalizeEntityName(
    parts
      .filter(Boolean)
      .join(" "),
  )
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createEntityId(
  prefix: string,
  value: string,
) {
  const slug =
    createCanonicalSlug(value);

  return `${prefix}-${slug || "unknown"}`;
}

export function normalizeAliasSet(
  values: string[],
) {
  return [
    ...new Set(
      values
        .map(normalizeEntityName)
        .filter(Boolean),
    ),
  ].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function normalizeConcentration(
  value: string,
) {
  const normalized =
    normalizeEntityName(value)
      .toLowerCase()
      .replace(/\./g, "");

  const map: Record<
    string,
    string
  > = {
    edt: "eau-de-toilette",
    "eau de toilette":
      "eau-de-toilette",
    edp: "eau-de-parfum",
    "eau de parfum":
      "eau-de-parfum",
    parfum: "parfum",
    extrait: "extrait-de-parfum",
    "extrait de parfum":
      "extrait-de-parfum",
    cologne: "eau-de-cologne",
    "eau de cologne":
      "eau-de-cologne",
  };

  return (
    map[normalized] ??
    createCanonicalSlug(value)
  );
}
