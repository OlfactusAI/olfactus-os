import type {
  CollectionItem,
} from "@/lib/domain/collection";
import type {
  DnaDimension,
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  BottleFutureForecast,
  DnaForecastPoint,
} from "@/lib/prediction/prediction-types";

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

export function forecastDnaBalance({
  collection,
  catalog,
  bottleStates,
}: {
  collection:
    CollectionItem[];
  catalog:
    FragranceRecord[];
  bottleStates:
    BottleFutureForecast[];
}): DnaForecastPoint[] {
  const stateById =
    new Map(
      bottleStates.map(
        (item) => [
          item.fragranceId,
          item,
        ],
      ),
    );

  const currentRaw =
    new Map<
      DnaDimension,
      number
    >();
  const futureRaw =
    new Map<
      DnaDimension,
      number
    >();

  for (const item of collection) {
    const fragrance =
      catalog.find(
        (candidate) =>
          candidate.id ===
          item.fragranceId,
      );

    if (!fragrance) {
      continue;
    }

    const state =
      stateById.get(
        fragrance.id,
      );
    const currentWeight =
      Math.max(
        0.5,
        item.wearCount +
          1,
      );
    const futureWeight =
      Math.max(
        0.15,
        state
          ?.estimatedWearsPerMonth ??
          0.5,
      );

    for (const dimension of dimensions) {
      currentRaw.set(
        dimension,
        (
          currentRaw.get(
            dimension,
          ) ??
          0
        ) +
          fragrance.dna[
            dimension
          ] *
            currentWeight,
      );
      futureRaw.set(
        dimension,
        (
          futureRaw.get(
            dimension,
          ) ??
          0
        ) +
          fragrance.dna[
            dimension
          ] *
            futureWeight,
      );
    }
  }

  const currentTotal =
    Math.max(
      1,
      dimensions.reduce(
        (sum, dimension) =>
          sum +
          (
            currentRaw.get(
              dimension,
            ) ??
            0
          ),
        0,
      ),
    );
  const futureTotal =
    Math.max(
      1,
      dimensions.reduce(
        (sum, dimension) =>
          sum +
          (
            futureRaw.get(
              dimension,
            ) ??
            0
          ),
        0,
      ),
    );

  return dimensions
    .map(
      (dimension) => {
        const currentShare =
          Math.round(
            (
              (
                currentRaw.get(
                  dimension,
                ) ??
                0
              ) /
              currentTotal
            ) *
              100,
          );
        const share =
          Math.round(
            (
              (
                futureRaw.get(
                  dimension,
                ) ??
                0
              ) /
              futureTotal
            ) *
              100,
          );

        return {
          dimension,
          share,
          currentShare,
          delta:
            share -
            currentShare,
        };
      },
    )
    .sort(
      (a, b) =>
        b.share -
        a.share,
    );
}
