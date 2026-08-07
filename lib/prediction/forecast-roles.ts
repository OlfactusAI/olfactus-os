import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import {
  roles,
} from "@/lib/domain/fragrance";
import type {
  BottleFutureForecast,
  RoleForecast,
} from "@/lib/prediction/prediction-types";

export function forecastRoleCoverage({
  catalog,
  bottleStates,
  confidence,
}: {
  catalog:
    FragranceRecord[];
  bottleStates:
    BottleFutureForecast[];
  confidence: number;
}): RoleForecast[] {
  const byId =
    new Map(
      catalog.map(
        (fragrance) => [
          fragrance.id,
          fragrance,
        ],
      ),
    );

  return roles
    .map(
      (role) => {
        const activeBottleCount =
          bottleStates.filter(
            (state) => {
              const fragrance =
                byId.get(
                  state.fragranceId,
                );

              if (
                !fragrance
                  ?.roles.includes(
                    role,
                  )
              ) {
                return false;
              }

              return ![
                "removal-candidate",
                "archive",
                "neglect-risk",
              ].includes(
                state.state,
              );
            },
          ).length;

        return {
          role,
          activeBottleCount,
          status:
            activeBottleCount ===
            0
              ? "likely-gap"
              : activeBottleCount ===
                  1
                ? "emerging-gap"
                : "covered",
          confidence,
        } satisfies RoleForecast;
      },
    )
    .sort(
      (a, b) =>
        gapPriority(
          a.status,
        ) -
        gapPriority(
          b.status,
        ),
    );
}

function gapPriority(
  status:
    RoleForecast["status"],
) {
  return status ===
    "likely-gap"
    ? 0
    : status ===
        "emerging-gap"
      ? 1
      : 2;
}
