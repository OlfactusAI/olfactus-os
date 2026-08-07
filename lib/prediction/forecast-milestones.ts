import type {
  BottleFutureForecast,
  ForecastMilestone,
  RoleForecast,
} from "@/lib/prediction/prediction-types";

export function buildForecastMilestones({
  bottles,
  roles,
  health,
  confidence,
}: {
  bottles:
    BottleFutureForecast[];
  roles:
    RoleForecast[];
  health: number;
  confidence: number;
}): ForecastMilestone[] {
  const milestones:
    ForecastMilestone[] = [];

  const signature =
    bottles
      .filter(
        (bottle) =>
          bottle.state ===
          "signature-candidate",
      )
      .sort(
        (a, b) =>
          b.signaturePotential -
          a.signaturePotential,
      )[0];

  if (
    signature &&
    confidence >=
      55
  ) {
    milestones.push({
      id:
        `signature:${signature.fragranceId}`,
      title:
        `${signature.fragranceName} may consolidate as a signature`,
      detail:
        `${signature.signaturePotential}% signature potential at this horizon.`,
      confidence:
        Math.min(
          confidence,
          signature.confidence,
        ),
      category:
        "signature",
    });
  }

  const highRisk =
    bottles.filter(
      (bottle) =>
        bottle.state ===
          "neglect-risk" ||
        bottle.state ===
          "removal-candidate",
    );

  if (
    highRisk.length &&
    confidence >=
      50
  ) {
    milestones.push({
      id:
        "rotation:neglect-threshold",
      title:
        `${highRisk.length} bottle${highRisk.length === 1 ? "" : "s"} may enter high-neglect territory`,
      detail:
        highRisk
          .slice(
            0,
            3,
          )
          .map(
            (bottle) =>
              bottle.fragranceName,
          )
          .join(", "),
      confidence,
      category:
        "rotation",
    });
  }

  const roleGap =
    roles.find(
      (role) =>
        role.status ===
        "likely-gap",
    );

  if (
    roleGap &&
    confidence >=
      55
  ) {
    milestones.push({
      id:
        `role:${roleGap.role}`,
      title:
        `${roleGap.role} may become an uncovered role`,
      detail:
        "Projected active rotation leaves no bottle confidently covering this role.",
      confidence:
        roleGap.confidence,
      category:
        "role",
    });
  }

  if (
    health <
      70 &&
    confidence >=
      55
  ) {
    milestones.push({
      id:
        "health:below-70",
      title:
        "Collection Health may enter Needs Attention territory",
      detail:
        `Forecast center falls to ${health}/100.`,
      confidence,
      category:
        "health",
    });
  }

  return milestones;
}
