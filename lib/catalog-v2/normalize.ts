export function normalizeCatalogText(
  value: string,
) {
  return value
    .normalize("NFKD")
    .replace(
      /[\u0300-\u036f]/g,
      "",
    )
    .toLowerCase()
    .replace(
      /&/g,
      " and ",
    )
    .replace(
      /[^a-z0-9]+/g,
      " ",
    )
    .trim()
    .replace(
      /\s+/g,
      " ",
    );
}

export function catalogSlug(
  value: string,
) {
  return normalizeCatalogText(
    value,
  )
    .replace(
      /\s+/g,
      "-",
    );
}

export function buildCatalogCanonicalId({
  brand,
  name,
}: {
  brand: string;
  name: string;
}) {
  return `${catalogSlug(
    brand,
  )}:${catalogSlug(
    name,
  )}`;
}

export function listValue(
  value:
    | string
    | string[]
    | undefined,
) {
  if (!value) {
    return [];
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return [
      ...new Set(
        value
          .map(
            (item) =>
              item.trim(),
          )
          .filter(
            Boolean,
          ),
      ),
    ];
  }

  return [
    ...new Set(
      value
        .split(
          /[|;,]/g,
        )
        .map(
          (item) =>
            item.trim(),
        )
        .filter(
          Boolean,
        ),
    ),
  ];
}
