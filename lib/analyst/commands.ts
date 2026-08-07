import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  AnalystCommand,
} from "@/lib/analyst/types";
import {
  normalizeEntityLookup,
} from "@/lib/entities/normalization";

export function parseAnalystCommand(
  input: string,
): AnalystCommand {
  const raw =
    input.trim();
  const normalized =
    raw.toLowerCase();

  if (
    normalized.startsWith(
      "/wear ",
    )
  ) {
    return {
      intent:
        "record-wear",
      raw,
      arguments: [
        raw.slice(6).trim(),
      ],
    };
  }

  if (
    normalized.startsWith(
      "/compare ",
    )
  ) {
    return {
      intent:
        "compare",
      raw,
      arguments:
        splitComparison(
          raw.slice(9),
        ),
    };
  }

  if (
    normalized.startsWith(
      "/explain",
    ) ||
    normalized.includes(
      "why is my collection health",
    ) ||
    normalized.includes(
      "explain collection health",
    )
  ) {
    return {
      intent:
        "explain-health",
      raw,
      arguments: [],
    };
  }

  if (
    normalized.startsWith(
      "/find neglected",
    ) ||
    normalized.includes(
      "neglect",
    ) ||
    normalized.includes(
      "not worn",
    )
  ) {
    return {
      intent:
        "find-neglected",
      raw,
      arguments: [],
    };
  }

  if (
    normalized.startsWith(
      "/recommend",
    ) ||
    normalized.includes(
      "what should i wear",
    ) ||
    normalized.includes(
      "recommend",
    )
  ) {
    return {
      intent:
        "recommend-owned",
      raw,
      arguments: [],
    };
  }

  if (
    normalized.includes(
      "compare",
    )
  ) {
    return {
      intent:
        "compare",
      raw,
      arguments:
        splitComparison(
          raw.replace(
            /^.*?compare\s+/i,
            "",
          ),
        ),
    };
  }

  if (
    normalized.includes(
      "record",
    ) &&
    normalized.includes(
      "wore",
    )
  ) {
    return {
      intent:
        "record-wear",
      raw,
      arguments: [
        raw
          .replace(
            /^.*?wore\s+/i,
            "",
          )
          .replace(
            /\s+today.*$/i,
            "",
          )
          .trim(),
      ],
    };
  }

  return {
    intent:
      "help",
    raw,
    arguments: [],
  };
}

export function resolveFragranceAlias({
  query,
  catalog,
}: {
  query: string;
  catalog:
    FragranceRecord[];
}) {
  const normalized =
    normalizeEntityLookup(
      query,
    );

  if (!normalized) {
    return undefined;
  }

  const scored =
    catalog.map(
      (fragrance) => {
        const name =
          normalizeEntityLookup(
            fragrance.name,
          );
        const full =
          normalizeEntityLookup(
            `${fragrance.brand} ${fragrance.name}`,
          );
        const id =
          normalizeEntityLookup(
            fragrance.id,
          );

        let score = 0;

        if (
          normalized ===
            name ||
          normalized ===
            full ||
          normalized ===
            id
        ) {
          score = 100;
        } else if (
          full.includes(
            normalized,
          ) ||
          normalized.includes(
            name,
          )
        ) {
          score = 82;
        } else {
          const queryTokens =
            new Set(
              normalized.split(
                "-",
              ),
            );
          const candidateTokens =
            new Set(
              full.split(
                "-",
              ),
            );
          const overlap = [
            ...queryTokens,
          ].filter(
            (token) =>
              candidateTokens.has(
                token,
              ),
          ).length;

          score =
            overlap *
            18;
        }

        return {
          fragrance,
          score,
        };
      },
    )
    .sort(
      (a, b) =>
        b.score -
        a.score,
    );

  return scored[0]?.score >=
    36
    ? scored[0]
        .fragrance
    : undefined;
}

function splitComparison(
  input: string,
) {
  const explicit =
    input
      .split(
        /\s+(?:and|vs\.?|versus)\s+|,/i,
      )
      .map(
        (item) =>
          item.trim(),
      )
      .filter(Boolean);

  if (
    explicit.length >=
    2
  ) {
    return explicit.slice(
      0,
      3,
    );
  }

  return [
    input.trim(),
  ].filter(Boolean);
}
