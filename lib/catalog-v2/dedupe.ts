import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import {
  normalizeCatalogText,
} from "@/lib/catalog-v2/normalize";

export function findCatalogDuplicateCandidates({
  incoming,
  existing,
}: {
  incoming:
    CatalogV2Record[];
  existing:
    CatalogV2Record[];
}) {
  const candidates:
    Array<{
      incomingId: string;
      existingId: string;
      score: number;
      reason: string;
    }> = [];

  for (
    const item
    of incoming
  ) {
    for (
      const current
      of existing
    ) {
      const score =
        duplicateScore(
          item,
          current,
        );

      if (
        score >=
        70
      ) {
        candidates.push({
          incomingId:
            item.canonicalId,
          existingId:
            current.canonicalId,
          score,
          reason:
            duplicateReason(
              item,
              current,
            ),
        });
      }
    }
  }

  return candidates.sort(
    (a, b) =>
      b.score -
      a.score,
  );
}

function duplicateScore(
  left:
    CatalogV2Record,
  right:
    CatalogV2Record,
) {
  const brandEqual =
    normalizeCatalogText(
      left.brand,
    ) ===
    normalizeCatalogText(
      right.brand,
    );

  const nameEqual =
    normalizeCatalogText(
      left.name,
    ) ===
    normalizeCatalogText(
      right.name,
    );

  if (
    brandEqual &&
    nameEqual
  ) {
    return 100;
  }

  const leftNames =
    new Set([
      normalizeCatalogText(
        left.name,
      ),
      ...left.aliases.map(
        normalizeCatalogText,
      ),
    ]);

  const rightNames =
    new Set([
      normalizeCatalogText(
        right.name,
      ),
      ...right.aliases.map(
        normalizeCatalogText,
      ),
    ]);

  const aliasMatch =
    [
      ...leftNames,
    ].some(
      (value) =>
        rightNames.has(
          value,
        ),
    );

  if (
    brandEqual &&
    aliasMatch
  ) {
    return 94;
  }

  const sameYear =
    left.releaseYear !==
      undefined &&
    left.releaseYear ===
      right.releaseYear;

  return (
    (
      brandEqual
        ? 45
        : 0
    ) +
    (
      aliasMatch
        ? 40
        : 0
    ) +
    (
      sameYear
        ? 10
        : 0
    )
  );
}

function duplicateReason(
  left:
    CatalogV2Record,
  right:
    CatalogV2Record,
) {
  if (
    left.canonicalId ===
    right.canonicalId
  ) {
    return "Canonical brand/name identity matches.";
  }

  return "Brand, aliases, or release-year signals indicate a possible duplicate.";
}
