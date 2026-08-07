export function createReferenceLabId(
  prefix: string,
  parts: Array<
    string |
    number
  >,
) {
  const normalized =
    parts
      .map(
        (part) =>
          String(part)
            .trim()
            .toLowerCase()
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
      .join(":");

  return `${prefix}:${normalized}`;
}
