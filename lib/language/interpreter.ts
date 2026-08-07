import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  CollectorPreferenceEmbedding,
  PreferenceDimension,
  WeightedPreferenceDimension,
} from "@/lib/embedding/types";
import {
  compositeLanguage,
  fragranceLanguageLexicon,
} from "@/lib/language/lexicon";
import type {
  InterpretedFragranceRequest,
  SemanticConstraint,
} from "@/lib/language/types";

export function interpretFragranceRequest({
  text,
  catalog,
  collectorEmbedding,
}: {
  text: string;
  catalog:
    FragranceRecord[];
  collectorEmbedding:
    CollectorPreferenceEmbedding;
}): InterpretedFragranceRequest {
  const normalized =
    normalize(text);

  const references =
    findFragranceReferences(
      normalized,
      catalog,
    );

  const constraints:
    SemanticConstraint[] = [];
  const weighted:
    WeightedPreferenceDimension[] = [];

  for (
    const [
      phrase,
      dimension,
    ]
    of Object.entries(
      fragranceLanguageLexicon,
    )
  ) {
    const compactPhrase =
      phrase.replaceAll(
        " ",
        "",
      );

    if (
      !normalized
        .replaceAll(
          " ",
          "",
        )
        .includes(
          compactPhrase,
        )
    ) {
      continue;
    }

    const phraseIndex =
      normalized.indexOf(
        phrase,
      );
    const local =
      normalized.slice(
        Math.max(
          0,
          phraseIndex -
            28,
        ),
        phraseIndex +
          phrase.length +
          28,
      );

    const operator =
      inferOperator(
        local,
      );
    const strength =
      inferStrength(
        local,
      );

    const reference =
      references.find(
        (item) =>
          local.includes(
            item.matchText,
          ),
      );

    constraints.push({
      id:
        `${dimension}:${constraints.length}`,
      phrase,
      dimension,
      operator,
      strength,
      referenceFragranceId:
        reference
          ?.fragranceId,
    });

    weighted.push({
      dimension,
      target:
        targetForConstraint({
          base:
            collectorEmbedding
              .dimensions[
              dimension
            ],
          operator,
          strength,
        }),
      weight:
        0.55 +
        strength *
          0.45,
      direction:
        operator ===
        "less"
          ? "maximum"
          : operator ===
              "more"
            ? "minimum"
            : operator ===
                "at-most"
              ? "maximum"
              : "minimum",
      source:
        phrase,
    });
  }

  for (
    const [
      phrase,
      definitions,
    ]
    of Object.entries(
      compositeLanguage,
    )
  ) {
    if (
      !normalized.includes(
        phrase,
      )
    ) {
      continue;
    }

    for (
      const definition
      of definitions
    ) {
      constraints.push({
        id:
          `${phrase}:${definition.dimension}`,
        phrase,
        dimension:
          definition.dimension,
        operator:
          definition.direction,
        strength:
          definition.strength,
      });

      weighted.push({
        dimension:
          definition.dimension,
        target:
          targetForConstraint({
            base:
              collectorEmbedding
                .dimensions[
                definition.dimension
              ],
            operator:
              definition.direction,
            strength:
              definition.strength,
          }),
        weight:
          0.45 +
          definition.strength *
            0.4,
        direction:
          definition.direction ===
          "less"
            ? "maximum"
            : "minimum",
        source:
          phrase,
      });
    }
  }

  const dedupedWeighted =
    mergeWeightedDimensions(
      weighted,
    );

  const explanation =
    dedupedWeighted.map(
      (item) =>
        `${item.source} → ${item.dimension} ${item.direction} ${Math.round(item.target)}`,
    );

  const confidence =
    Math.max(
      30,
      Math.min(
        96,
        42 +
          constraints.length *
            9 +
          references.length *
            7,
      ),
    );

  return {
    modelVersion:
      "PFL-1.0.0",
    originalText:
      text,
    normalizedText:
      normalized,
    constraints,
    weightedDimensions:
      dedupedWeighted,
    referenceFragranceIds:
      references.map(
        (item) =>
          item.fragranceId,
      ),
    excludedFragranceIds: [],
    confidence,
    explanation,
  };
}

function findFragranceReferences(
  text: string,
  catalog:
    FragranceRecord[],
) {
  return catalog
    .map(
      (fragrance) => {
        const name =
          normalize(
            fragrance.name,
          );
        const full =
          normalize(
            `${fragrance.brand} ${fragrance.name}`,
          );

        const matchText =
          text.includes(
            full,
          )
            ? full
            : text.includes(
                name,
              )
              ? name
              : undefined;

        return matchText
          ? {
              fragranceId:
                fragrance.id,
              matchText,
            }
          : null;
      },
    )
    .filter(
      (
        item,
      ): item is {
        fragranceId: string;
        matchText: string;
      } =>
        Boolean(item),
    );
}

function inferOperator(
  local: string,
) {
  if (
    /\b(less|not as|lower|reduced|without too much)\b/.test(
      local,
    )
  ) {
    return "less" as const;
  }

  if (
    /\b(no more than|at most|max)\b/.test(
      local,
    )
  ) {
    return "at-most" as const;
  }

  if (
    /\b(at least|min|minimum)\b/.test(
      local,
    )
  ) {
    return "at-least" as const;
  }

  return "more" as const;
}

function inferStrength(
  local: string,
) {
  if (
    /\b(much|significantly|very|far|way)\b/.test(
      local,
    )
  ) {
    return 0.9;
  }

  if (
    /\b(slightly|a little|somewhat)\b/.test(
      local,
    )
  ) {
    return 0.35;
  }

  return 0.65;
}

function targetForConstraint({
  base,
  operator,
  strength,
}: {
  base: number;
  operator:
    "more" |
    "less" |
    "at-least" |
    "at-most";
  strength: number;
}) {
  const movement =
    12 +
    strength *
      22;

  if (
    operator ===
      "less" ||
    operator ===
      "at-most"
  ) {
    return Math.max(
      0,
      base -
        movement,
    );
  }

  return Math.min(
    100,
    base +
      movement,
  );
}

function mergeWeightedDimensions(
  items:
    WeightedPreferenceDimension[],
) {
  const byDimension =
    new Map<
      PreferenceDimension,
      WeightedPreferenceDimension[]
    >();

  for (
    const item
    of items
  ) {
    byDimension.set(
      item.dimension,
      [
        ...(
          byDimension.get(
            item.dimension,
          ) ??
          []
        ),
        item,
      ],
    );
  }

  return [
    ...byDimension.entries(),
  ].map(
    ([
      dimension,
      values,
    ]) => ({
      dimension,
      target:
        values.reduce(
          (sum, item) =>
            sum +
            item.target *
              item.weight,
          0,
        ) /
        Math.max(
          0.001,
          values.reduce(
            (sum, item) =>
              sum +
              item.weight,
            0,
          ),
        ),
      weight:
        Math.min(
          1,
          values.reduce(
            (sum, item) =>
              sum +
              item.weight,
            0,
          ) /
            values.length,
        ),
      direction:
        values.at(-1)
          ?.direction ??
        "toward",
      source:
        values
          .map(
            (item) =>
              item.source,
          )
          .join(", "),
    }),
  );
}

function normalize(
  value: string,
) {
  return value
    .toLowerCase()
    .replace(
      /[’']/g,
      "",
    )
    .replace(
      /[^a-z0-9à-ÿ\s-]/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}
