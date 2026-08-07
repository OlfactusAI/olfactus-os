import type {
  DnaDimension,
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  MemoryEvent,
} from "@/lib/memory/types";
import type {
  TasteDriftSignal,
} from "@/lib/predictive/types";

const dimensions:
  DnaDimension[] = [
    "fresh",
    "green",
    "woody",
    "amber",
    "sweet",
    "dark",
    "artistic",
    "formal",
  ];

export function detectTasteDrift({
  events,
  catalog,
}: {
  events:
    MemoryEvent[];
  catalog:
    FragranceRecord[];
}): TasteDriftSignal[] {
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
      )
      .map(
        (event) =>
          fragranceById.get(
            event.entity
              ?.id ??
              "",
          ),
      )
      .filter(
        (
          fragrance,
        ): fragrance is
          FragranceRecord =>
          Boolean(
            fragrance,
          ),
      );

  if (
    wears.length <
    4
  ) {
    return [];
  }

  const midpoint =
    Math.floor(
      wears.length /
        2,
    );
  const older =
    wears.slice(
      0,
      midpoint,
    );
  const recent =
    wears.slice(
      midpoint,
    );

  return dimensions
    .map(
      (
        dimension,
      ) => {
        const previousScore =
          average(
            older.map(
              (fragrance) =>
                fragrance.dna[
                  dimension
                ],
            ),
          );
        const recentScore =
          average(
            recent.map(
              (fragrance) =>
                fragrance.dna[
                  dimension
                ],
            ),
          );
        const delta =
          Math.round(
            recentScore -
              previousScore,
          );

        return {
          dimension,
          previousScore:
            Math.round(
              previousScore,
            ),
          recentScore:
            Math.round(
              recentScore,
            ),
          delta,
          direction:
            delta >= 8
              ? "rising"
              : delta <=
                    -8
                ? "falling"
                : "stable",
          confidence:
            Math.min(
              95,
              Math.round(
                52 +
                  Math.sqrt(
                    wears.length,
                  ) *
                    13,
              ),
            ),
          evidenceCount:
            wears.length,
        } satisfies TasteDriftSignal;
      },
    )
    .sort(
      (a, b) =>
        Math.abs(
          b.delta,
        ) -
        Math.abs(
          a.delta,
        ),
    );
}

function average(
  values: number[],
) {
  if (!values.length) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum +
        value,
      0,
    ) /
    values.length
  );
}
