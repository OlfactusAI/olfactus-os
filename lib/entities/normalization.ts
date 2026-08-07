export function normalizeEntityLookup(
  value: string,
) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .replace(
      /[^a-z0-9]+/g,
      "-",
    )
    .replace(
      /^-+|-+$/g,
      "",
    );
}

export function entitySlug(
  ...parts:
    Array<
      string | undefined
    >
) {
  return normalizeEntityLookup(
    parts
      .filter(Boolean)
      .join(" "),
  );
}

export function entityCanonicalId({
  type,
  id,
}: {
  type: string;
  id: string;
}) {
  return `${type}:${id}`;
}
