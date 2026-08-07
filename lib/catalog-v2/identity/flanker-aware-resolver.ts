import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";
import {
  normalizeCatalogText,
} from "@/lib/catalog-v2/normalize";

export type IdentityResolution =
  | {
      outcome:
        "same";
      score: number;
      reason: string;
    }
  | {
      outcome:
        "distinct";
      score: number;
      reason: string;
    }
  | {
      outcome:
        "review";
      score: number;
      reason: string;
    };

const concentrationTokens =
  new Set([
    "edt",
    "edp",
    "parfum",
    "elixir",
    "extrait",
    "cologne",
    "intense",
    "absolu",
    "absolue",
    "le parfum",
  ]);

export function resolveCatalogIdentity(
  left:
    CatalogV2Record,
  right:
    CatalogV2Record,
): IdentityResolution {
  if (
    normalizeCatalogText(
      left.brand,
    ) !==
    normalizeCatalogText(
      right.brand,
    )
  ) {
    return {
      outcome:
        "distinct",
      score: 0,
      reason:
        "Brand identity differs.",
    };
  }

  const leftName =
    normalizeCatalogText(
      left.name,
    );
  const rightName =
    normalizeCatalogText(
      right.name,
    );

  if (
    leftName ===
    rightName
  ) {
    if (
      materiallyDifferentConcentration(
        left,
        right,
      )
    ) {
      return {
        outcome:
          "distinct",
        score: 100,
        reason:
          "Canonical names match but concentrations/flanker identity differ.",
      };
    }

    return {
      outcome:
        "same",
      score: 100,
      reason:
        "Normalized brand and fragrance name match.",
    };
  }

  const aliases =
    new Set([
      ...left.aliases.map(
        normalizeCatalogText,
      ),
      leftName,
    ]);

  const aliasMatch =
    [
      rightName,
      ...right.aliases.map(
        normalizeCatalogText,
      ),
    ].some(
      (value) =>
        aliases.has(
          value,
        ),
    );

  if (
    aliasMatch &&
    !materiallyDifferentConcentration(
      left,
      right,
    )
  ) {
    return {
      outcome:
        "same",
      score: 94,
      reason:
        "Alias identity matches without a flanker conflict.",
    };
  }

  if (
    shareBaseName(
      leftName,
      rightName,
    )
  ) {
    return {
      outcome:
        "review",
      score: 72,
      reason:
        "Names share a likely fragrance-family base but may represent distinct flankers.",
    };
  }

  return {
    outcome:
      "distinct",
    score: 20,
    reason:
      "No strong identity match was found.",
  };
}

function materiallyDifferentConcentration(
  left:
    CatalogV2Record,
  right:
    CatalogV2Record,
) {
  const a =
    normalizeCatalogText(
      left.concentration ??
        "",
    );
  const b =
    normalizeCatalogText(
      right.concentration ??
        "",
    );

  if (
    !a ||
    !b
  ) {
    return false;
  }

  return a !==
    b;
}

function shareBaseName(
  left: string,
  right: string,
) {
  const strip =
    (value: string) =>
      value
        .split(
          " ",
        )
        .filter(
          (token) =>
            !concentrationTokens.has(
              token,
            ),
        )
        .join(
          " ",
        );

  const a =
    strip(left);
  const b =
    strip(right);

  return (
    a.length >=
      4 &&
    b.length >=
      4 &&
    (
      a ===
        b ||
      a.includes(
        b,
      ) ||
      b.includes(
        a,
      )
    )
  );
}
