import type {
  UniversalSearchEntityType,
  UniversalSearchGroup,
  UniversalSearchHit,
  UniversalSearchIndex,
  UniversalSearchOptions,
  UniversalSearchResult,
} from "@/lib/search/types";
import {
  normalizeSearchText,
  tokenizeSearchText,
} from "@/lib/search/normalization";

const entityWeights:
  Record<
    UniversalSearchEntityType,
    number
  > = {
    fragrance: 18,
    brand: 12,
    perfumer: 10,
    note: 7,
    accord: 6,
    ingredient: 5,
    line: 9,
  };

const groupLabels:
  Record<
    UniversalSearchEntityType,
    string
  > = {
    fragrance: "Fragrances",
    brand: "Brands",
    perfumer: "Perfumers",
    note: "Notes",
    accord: "Accords",
    ingredient: "Ingredients",
    line: "Fragrance Lines",
  };

export function searchUniversalIndex({
  index,
  query,
  options = {},
}: {
  index: UniversalSearchIndex;
  query: string;
  options?: UniversalSearchOptions;
}): UniversalSearchResult {
  const normalizedQuery =
    normalizeSearchText(
      query,
    );
  const limit =
    options.limit ?? 30;
  const limitPerGroup =
    options.limitPerGroup ?? 8;
  const typoTolerance =
    options.typoTolerance ?? 2;
  const allowedTypes =
    options.entityTypes
      ? new Set(
          options.entityTypes,
        )
      : null;

  if (!normalizedQuery) {
    return {
      query,
      normalizedQuery,
      total: 0,
      groups: [],
      hits: [],
      generatedAt:
        new Date().toISOString(),
    };
  }

  const candidateIds =
    gatherCandidates({
      index,
      normalizedQuery,
      typoTolerance,
    });

  const hits =
    [...candidateIds]
      .map((id) => {
        const document =
          index.documentsById.get(
            id,
          );
        if (!document) return null;
        if (
          allowedTypes &&
          !allowedTypes.has(
            document.entityType,
          )
        ) {
          return null;
        }

        return scoreDocument({
          document,
          normalizedQuery,
          typoTolerance,
        });
      })
      .filter(
        (
          hit,
        ): hit is UniversalSearchHit =>
          Boolean(hit),
      )
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.document.label.localeCompare(
            b.document.label,
          ),
      )
      .slice(0, limit);

  const groups =
    groupHits(
      hits,
      limitPerGroup,
    );

  return {
    query,
    normalizedQuery,
    total: hits.length,
    groups,
    hits,
    generatedAt:
      new Date().toISOString(),
  };
}

function gatherCandidates({
  index,
  normalizedQuery,
  typoTolerance,
}: {
  index: UniversalSearchIndex;
  normalizedQuery: string;
  typoTolerance: number;
}) {
  const result =
    new Set<string>();
  const queryTokens =
    tokenizeSearchText(
      normalizedQuery,
    );

  for (const [
    token,
    ids,
  ] of index.tokenIndex) {
    const tokenMatched =
      queryTokens.some(
        (queryToken) =>
          token === queryToken ||
          token.startsWith(
            queryToken,
          ) ||
          token.includes(
            queryToken,
          ) ||
          (
            queryToken.length >= 4 &&
            levenshteinDistance(
              token,
              queryToken,
            ) <=
              typoTolerance
          ),
      );

    if (tokenMatched) {
      for (const id of ids) {
        result.add(id);
      }
    }
  }

  for (const document of index.documents) {
    const searchable =
      [
        document.label,
        ...document.aliases,
        ...document.keywords,
      ].map(
        normalizeSearchText,
      );

    if (
      searchable.some(
        (value) =>
          value.includes(
            normalizedQuery,
          ),
      )
    ) {
      result.add(
        document.id,
      );
    }
  }

  return result;
}

function scoreDocument({
  document,
  normalizedQuery,
  typoTolerance,
}: {
  document:
    UniversalSearchIndex["documents"][number];
  normalizedQuery: string;
  typoTolerance: number;
}): UniversalSearchHit | null {
  const label =
    normalizeSearchText(
      document.label,
    );
  const aliases =
    document.aliases.map(
      normalizeSearchText,
    );
  const keywords =
    document.keywords.map(
      normalizeSearchText,
    );

  let baseScore = 0;
  let matchType:
    UniversalSearchHit["matchType"] =
      "partial";
  let matchedValue =
    document.label;

  if (
    label === normalizedQuery
  ) {
    baseScore = 100;
    matchType = "exact";
  } else if (
    aliases.some(
      (alias) =>
        alias ===
        normalizedQuery,
    )
  ) {
    baseScore = 96;
    matchType = "alias";
    matchedValue =
      document.aliases[
        aliases.findIndex(
          (alias) =>
            alias ===
            normalizedQuery,
        )
      ];
  } else if (
    label.startsWith(
      normalizedQuery,
    )
  ) {
    baseScore = 88;
    matchType = "prefix";
  } else if (
    aliases.some(
      (alias) =>
        alias.startsWith(
          normalizedQuery,
        ),
    )
  ) {
    baseScore = 84;
    matchType = "alias";
  } else if (
    label.includes(
      normalizedQuery,
    )
  ) {
    baseScore = 76;
    matchType = "partial";
  } else if (
    aliases.some(
      (alias) =>
        alias.includes(
          normalizedQuery,
        ),
    )
  ) {
    baseScore = 72;
    matchType = "alias";
  } else if (
    keywords.some(
      (keyword) =>
        keyword.includes(
          normalizedQuery,
        ),
    )
  ) {
    baseScore = 62;
    matchType = "keyword";
  } else {
    const distance =
      Math.min(
        levenshteinDistance(
          label,
          normalizedQuery,
        ),
        ...aliases.map(
          (alias) =>
            levenshteinDistance(
              alias,
              normalizedQuery,
            ),
        ),
      );

    if (
      normalizedQuery.length <
        4 ||
      distance >
        typoTolerance
    ) {
      return null;
    }

    baseScore =
      66 -
      distance * 8;
    matchType = "typo";
  }

  const score =
    Math.round(
      baseScore +
        entityWeights[
          document.entityType
        ] +
        document.qualityScore *
          0.08 +
        document.popularityScore *
          0.06 +
        (document.source ===
        "imported"
          ? 2
          : 0),
    );

  return {
    document,
    score,
    matchType,
    matchedValue,
    explanation:
      explainMatch({
        document,
        matchType,
        matchedValue,
      }),
  };
}

function groupHits(
  hits: UniversalSearchHit[],
  limitPerGroup: number,
) {
  const byType =
    new Map<
      UniversalSearchEntityType,
      UniversalSearchHit[]
    >();

  for (const hit of hits) {
    const current =
      byType.get(
        hit.document
          .entityType,
      ) ?? [];
    current.push(hit);
    byType.set(
      hit.document
        .entityType,
      current,
    );
  }

  return [
    ...byType.entries(),
  ]
    .map(
      ([
        entityType,
        groupHits,
      ]): UniversalSearchGroup => ({
        entityType,
        label:
          groupLabels[
            entityType
          ],
        hits:
          groupHits.slice(
            0,
            limitPerGroup,
          ),
      }),
    )
    .sort(
      (a, b) =>
        (b.hits[0]?.score ??
          0) -
        (a.hits[0]?.score ??
          0),
    );
}

function explainMatch({
  document,
  matchType,
  matchedValue,
}: {
  document:
    UniversalSearchIndex["documents"][number];
  matchType:
    UniversalSearchHit["matchType"];
  matchedValue: string;
}) {
  const source =
    document.source ===
    "imported"
      ? "Imported catalog"
      : "OLFACTUS catalog";

  if (matchType === "exact") {
    return `Exact ${document.entityType} match · ${source}.`;
  }
  if (matchType === "prefix") {
    return `Name begins with the search query · ${source}.`;
  }
  if (matchType === "alias") {
    return `Matched alias: ${matchedValue} · ${source}.`;
  }
  if (matchType === "keyword") {
    return `Matched related metadata · ${source}.`;
  }
  if (matchType === "typo") {
    return `Likely typo-tolerant match · ${source}.`;
  }

  return `Partial name match · ${source}.`;
}

export function levenshteinDistance(
  first: string,
  second: string,
) {
  const a =
    normalizeSearchText(
      first,
    );
  const b =
    normalizeSearchText(
      second,
    );

  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous =
    Array.from(
      {
        length:
          b.length + 1,
      },
      (_, index) =>
        index,
    );

  for (
    let row = 1;
    row <= a.length;
    row += 1
  ) {
    const current =
      [row];

    for (
      let column = 1;
      column <= b.length;
      column += 1
    ) {
      const insertion =
        current[
          column - 1
        ] + 1;
      const deletion =
        previous[column] +
        1;
      const substitution =
        previous[
          column - 1
        ] +
        (a[
          row - 1
        ] ===
        b[
          column - 1
        ]
          ? 0
          : 1);

      current[column] =
        Math.min(
          insertion,
          deletion,
          substitution,
        );
    }

    previous.splice(
      0,
      previous.length,
      ...current,
    );
  }

  return previous[b.length];
}
