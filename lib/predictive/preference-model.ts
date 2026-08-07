import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  MemoryEvent,
} from "@/lib/memory/types";
import type {
  PreferenceAffinity,
} from "@/lib/predictive/types";

export function buildFamilyAffinities({
  events,
  catalog,
}: {
  events:
    MemoryEvent[];
  catalog:
    FragranceRecord[];
}): PreferenceAffinity[] {
  return buildAffinities({
    events,
    catalog,
    valuesFor:
      (fragrance) => [
        fragrance.family,
      ],
  });
}

export function buildAccordAffinities({
  events,
  catalog,
}: {
  events:
    MemoryEvent[];
  catalog:
    FragranceRecord[];
}): PreferenceAffinity[] {
  return buildAffinities({
    events,
    catalog,
    valuesFor:
      (fragrance) =>
        fragrance.accords ??
        [],
  });
}

function buildAffinities({
  events,
  catalog,
  valuesFor,
}: {
  events:
    MemoryEvent[];
  catalog:
    FragranceRecord[];
  valuesFor:
    (
      fragrance:
        FragranceRecord,
    ) => string[];
}) {
  const fragranceById =
    new Map(
      catalog.map(
        (fragrance) => [
          fragrance.id,
          fragrance,
        ],
      ),
    );

  const wears =
    events
      .filter(
        (event) =>
          event.type ===
          "wear-recorded" &&
          event.entity?.type ===
            "fragrance",
      )
      .sort(
        (a, b) =>
          a.timestamp.localeCompare(
            b.timestamp,
          ),
      );

  const counts =
    new Map<
      string,
      {
        all: number;
        recent: number;
        older: number;
      }
    >();
  const split =
    Math.floor(
      wears.length /
        2,
    );

  wears.forEach(
    (
      event,
      index,
    ) => {
      const fragrance =
        fragranceById.get(
          event.entity
            ?.id ??
            "",
        );

      if (!fragrance) {
        return;
      }

      for (
        const value
        of valuesFor(
          fragrance,
        )
      ) {
        const key =
          normalize(
            value,
          );
        if (!key) {
          continue;
        }

        const current =
          counts.get(
            key,
          ) ?? {
            all: 0,
            recent: 0,
            older: 0,
          };

        current.all +=
          1;

        if (
          index >=
          split
        ) {
          current.recent +=
            1;
        } else {
          current.older +=
            1;
        }

        counts.set(
          key,
          current,
        );
      }
    },
  );

  const maximum =
    Math.max(
      1,
      ...[
        ...counts.values(),
      ].map(
        (value) =>
          value.all,
      ),
    );

  return [
    ...counts.entries(),
  ]
    .map(
      ([
        id,
        value,
      ]) => {
        const score =
          Math.round(
            value.all /
              maximum *
              100,
          );
        const delta =
          value.recent -
          value.older;

        return {
          id,
          label:
            titleCase(
              id,
            ),
          score,
          confidence:
            confidenceFromEvidence(
              value.all,
            ),
          evidenceCount:
            value.all,
          direction:
            delta >= 2
              ? "rising"
              : delta <=
                    -2
                ? "falling"
                : "stable",
        } satisfies PreferenceAffinity;
      },
    )
    .sort(
      (a, b) =>
        b.score -
        a.score ||
        b.evidenceCount -
          a.evidenceCount,
    );
}

function normalize(
  value?: string,
) {
  return (
    value
      ?.trim()
      .toLowerCase() ??
    ""
  );
}

function titleCase(
  value: string,
) {
  return value
    .split(
      /[\s-]+/,
    )
    .map(
      (word) =>
        word
          ? word[0].toUpperCase() +
            word.slice(1)
          : word,
    )
    .join(" ");
}

function confidenceFromEvidence(
  count: number,
) {
  return Math.min(
    96,
    Math.round(
      45 +
        Math.sqrt(
          count,
        ) *
          15,
    ),
  );
}
