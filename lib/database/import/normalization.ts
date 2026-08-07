const diacriticExpression =
  /[\u0300-\u036f]/g;

export function normalizeWhitespace(
  value: string,
) {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEntityLabel(
  value: string,
) {
  return normalizeWhitespace(
    value
      .normalize("NFKD")
      .replace(
        diacriticExpression,
        "",
      ),
  );
}

export function normalizeCanonicalId(
  ...values: Array<
    string | number | undefined
  >
) {
  return values
    .filter(
      (
        value,
      ): value is string | number =>
        value !== undefined &&
        String(value).trim().length >
          0,
    )
    .map((value) =>
      normalizeEntityLabel(
        String(value),
      )
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(
          /['’]/g,
          "",
        )
        .replace(
          /[^a-z0-9]+/g,
          "-",
        )
        .replace(
          /^-+|-+$/g,
          "",
        ),
    )
    .filter(Boolean)
    .join("-");
}

export function normalizeList(
  value: unknown,
) {
  if (
    Array.isArray(value)
  ) {
    return unique(
      value
        .map((item) =>
          normalizeEntityLabel(
            String(item),
          ),
        )
        .filter(Boolean),
    );
  }

  if (
    value === null ||
    value === undefined
  ) {
    return [];
  }

  const text =
    normalizeWhitespace(
      String(value),
    );

  if (!text) return [];

  return unique(
    text
      .split(
        /\s*(?:\||;|,|\/)\s*/g,
      )
      .map(
        normalizeEntityLabel,
      )
      .filter(Boolean),
  );
}

export function normalizeInteger(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  const parsed =
    Number.parseInt(
      String(value).replace(
        /[^0-9-]/g,
        "",
      ),
      10,
    );

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export function normalizeScore(
  value: unknown,
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  const parsed =
    Number.parseFloat(
      String(value).replace(
        /[^0-9.-]/g,
        "",
      ),
    );

  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  if (
    parsed >= 0 &&
    parsed <= 10
  ) {
    return Math.round(
      parsed * 10,
    );
  }

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(parsed),
    ),
  );
}

export function normalizeAvailability(
  value: unknown,
) {
  const normalized =
    normalizeEntityLabel(
      String(value ?? ""),
    ).toLowerCase();

  if (
    [
      "available",
      "active",
      "in production",
      "widely available",
    ].includes(normalized)
  ) {
    return "widely-available" as const;
  }

  if (
    [
      "limited",
      "limited edition",
      "exclusive",
    ].includes(normalized)
  ) {
    return "limited" as const;
  }

  if (
    [
      "discontinued",
      "archived",
      "out of production",
    ].includes(normalized)
  ) {
    return "discontinued" as const;
  }

  return normalized
    ? ("unknown" as const)
    : undefined;
}

export function normalizeHeader(
  value: string,
) {
  return normalizeEntityLabel(
    value,
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "",
    );
}

function unique(
  values: string[],
) {
  const seen =
    new Set<string>();

  return values.filter(
    (value) => {
      const key =
        value.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    },
  );
}
