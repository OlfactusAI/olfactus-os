import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  embedFragrance,
} from "@/lib/embedding/fragrance-embedding";
import type {
  PreferenceDimension,
} from "@/lib/embedding/types";

export function compareFragrancesInPreferenceSpace({
  a,
  b,
}: {
  a:
    FragranceRecord;
  b:
    FragranceRecord;
}) {
  const ea =
    embedFragrance(
      a,
    );
  const eb =
    embedFragrance(
      b,
    );

  return Object.keys(
    ea,
  )
    .map(
      (dimension) => {
        const key =
          dimension as
            PreferenceDimension;
        const delta =
          ea[key] -
          eb[key];

        return {
          dimension:
            key,
          a:
            ea[key],
          b:
            eb[key],
          delta,
          direction:
            delta >
            0
              ? "more"
              : delta <
                  0
                ? "less"
                : "equal",
        };
      },
    )
    .sort(
      (x, y) =>
        Math.abs(
          y.delta,
        ) -
        Math.abs(
          x.delta,
        ),
    );
}
