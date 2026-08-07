import type {
  CollectionHealthAnalysis,
} from "@/lib/domain/analysis";
import type {
  BottleFutureForecast,
  DnaForecastPoint,
  ForecastDriver,
  RoleForecast,
} from "@/lib/prediction/prediction-types";

export function buildForecastDrivers({
  current,
  projected,
  bottles,
  dna,
  roles,
}: {
  current:
    CollectionHealthAnalysis;
  projected:
    CollectionHealthAnalysis;
  bottles:
    BottleFutureForecast[];
  dna:
    DnaForecastPoint[];
  roles:
    RoleForecast[];
}): ForecastDriver[] {
  const drivers:
    ForecastDriver[] = [];

  compareDimension(
    drivers,
    "Rotation",
    current.dimensions.rotation,
    projected.dimensions.rotation,
  );
  compareDimension(
    drivers,
    "DNA diversity",
    current.dimensions.diversity,
    projected.dimensions.diversity,
  );
  compareDimension(
    drivers,
    "Seasonal balance",
    current.dimensions.seasonalBalance,
    projected.dimensions.seasonalBalance,
  );
  compareDimension(
    drivers,
    "Redundancy control",
    current.dimensions.redundancy,
    projected.dimensions.redundancy,
  );

  const highRisk =
    bottles.filter(
      (bottle) =>
        bottle.state ===
          "neglect-risk" ||
        bottle.state ===
          "removal-candidate",
    ).length;

  if (highRisk) {
    drivers.push({
      kind: "risk",
      title:
        `${highRisk} bottle${highRisk === 1 ? "" : "s"} approaching inactivity`,
      detail:
        "Projected rotation behavior moves these bottles into neglect or removal territory.",
      impact:
        -Math.min(
          18,
          highRisk * 4,
        ),
    });
  }

  const signatureCount =
    bottles.filter(
      (bottle) =>
        bottle.state ===
          "signature-candidate" ||
        bottle.state ===
          "core-rotation",
    ).length;

  if (signatureCount >= 2) {
    drivers.push({
      kind: "positive",
      title:
        "Signature rotation remains concentrated",
      detail:
        `${signatureCount} bottles retain core or signature-candidate status.`,
      impact:
        Math.min(
          14,
          signatureCount * 3,
        ),
    });
  }

  const likelyGap =
    roles.find(
      (role) =>
        role.status ===
        "likely-gap",
    );

  if (likelyGap) {
    drivers.push({
      kind: "risk",
      title:
        `${likelyGap.role} role coverage weakens`,
      detail:
        "Projected active rotation leaves no strong bottle in this role.",
      impact: -8,
    });
  }

  const dominantShift =
    [...dna]
      .sort(
        (a, b) =>
          Math.abs(
            b.delta,
          ) -
          Math.abs(
            a.delta,
          ),
      )[0];

  if (
    dominantShift &&
    Math.abs(
      dominantShift.delta,
    ) >=
      3
  ) {
    drivers.push({
      kind:
        dominantShift.delta >
        0
          ? "positive"
          : "risk",
      title:
        `${dominantShift.dimension} DNA ${dominantShift.delta > 0 ? "rises" : "falls"}`,
      detail:
        `Projected active-wear share changes ${signed(
          dominantShift.delta,
        )} points.`,
      impact:
        dominantShift.delta,
    });
  }

  return drivers
    .sort(
      (a, b) =>
        Math.abs(
          b.impact,
        ) -
        Math.abs(
          a.impact,
        ),
    )
    .slice(
      0,
      8,
    );
}

function compareDimension(
  drivers:
    ForecastDriver[],
  label: string,
  current: number,
  projected: number,
) {
  const delta =
    projected -
    current;

  if (
    Math.abs(
      delta,
    ) <
    4
  ) {
    return;
  }

  drivers.push({
    kind:
      delta >
      0
        ? "positive"
        : "risk",
    title:
      `${label} ${delta > 0 ? "improves" : "declines"}`,
    detail:
      `${current}/100 → ${projected}/100.`,
    impact:
      delta,
  });
}

function signed(
  value: number,
) {
  return value >=
    0
    ? `+${value}`
    : `${value}`;
}
