import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import type {
  ReferenceCalibrationConflict,
  ReferenceClaim,
  ReferenceConsensusMetric,
} from "@/lib/reference-lab/types";
import type {
  ReferenceReviewPackage,
} from "@/lib/reference-lab/review-types";
import type {
  ReferenceConsensusRun,
  ReferenceConsensusThresholds,
} from "@/lib/reference-lab/consensus-types";

export const defaultReferenceConsensusThresholds:
  ReferenceConsensusThresholds = {
  lowMaxRange: 8,
  moderateMaxRange: 18,
  minimumReviewerCount: 2,
};

export function buildReferenceConsensus({
  packages,
  fragranceId,
  versionId,
  timestamp,
  thresholds =
    defaultReferenceConsensusThresholds,
}: {
  packages:
    ReferenceReviewPackage[];
  fragranceId: string;
  versionId: string;
  timestamp: string;
  thresholds?:
    ReferenceConsensusThresholds;
}): ReferenceConsensusRun {
  const eligible =
    packages.filter(
      (item) =>
        item.state ===
          "approved" &&
        item.submission
          .fragranceId ===
          fragranceId &&
        item.submission
          .versionId ===
          versionId,
    );

  const reviewerIds =
    [
      ...new Set(
        eligible.map(
          (item) =>
            item.submission
              .reviewerId,
        ),
      ),
    ];

  if (
    reviewerIds.length <
    thresholds.minimumReviewerCount
  ) {
    throw new Error(
      `Reference consensus requires at least ${thresholds.minimumReviewerCount} independently approved reviewer submissions.`,
    );
  }

  const metricGroups =
    groupClaims(
      eligible,
    );

  const metrics:
    ReferenceConsensusMetric<number>[] =
      [];

  const conflicts:
    ReferenceCalibrationConflict[] =
      [];

  for (
    const [
      key,
      claims,
    ] of metricGroups
  ) {
    const [
      domain,
      metric,
    ] =
      splitMetricKey(
        key,
      );

    const numericClaims =
      claims.filter(
        (
          claim,
        ): claim is
          ReferenceClaim<number> =>
          typeof claim.value ===
          "number",
      );

    if (
      numericClaims.length !==
      claims.length
    ) {
      continue;
    }

    const uniqueReviewerClaims =
      latestClaimPerReviewer(
        numericClaims,
      );

    if (
      uniqueReviewerClaims.length <
      thresholds.minimumReviewerCount
    ) {
      continue;
    }

    const values =
      uniqueReviewerClaims.map(
        (claim) =>
          claim.value,
      );

    const consensusValue =
      confidenceWeightedMean(
        uniqueReviewerClaims,
      );

    const variance =
      populationVariance(
        values,
      );

    const range =
      Math.max(
        ...values,
      ) -
      Math.min(
        ...values,
      );

    const conflict =
      classifyConflict(
        range,
        thresholds,
      );

    const confidence =
      calculateConsensusConfidence({
        claims:
          uniqueReviewerClaims,
        variance,
        range,
        conflict,
      });

    metrics.push({
      domain:
        domain as ReferenceConsensusMetric<number>["domain"],
      metric,
      value:
        round(
          consensusValue,
          1,
        ),
      confidence,
      reviewerCount:
        uniqueReviewerClaims.length,
      variance:
        round(
          variance,
          2,
        ),
      conflict,
      supportingClaimIds:
        uniqueReviewerClaims.map(
          (claim) =>
            claim.claimId,
        ),
    });

    if (
      conflict ===
        "moderate" ||
      conflict ===
        "high"
    ) {
      conflicts.push({
        conflictId:
          createReferenceLabId(
            "ref-conflict",
            [
              fragranceId,
              versionId,
              domain,
              metric,
            ],
          ),
        sessionId:
          uniqueReviewerClaims[
            0
          ]!.sessionId,
        fragranceId,
        versionId,
        domain:
          domain as ReferenceCalibrationConflict["domain"],
        metric,
        claimIds:
          uniqueReviewerClaims.map(
            (claim) =>
              claim.claimId,
          ),
        severity:
          conflict,
        status:
          "open",
      });
    }
  }

  if (
    metrics.length ===
    0
  ) {
    throw new Error(
      "No metrics have enough independently approved numeric claims to calculate consensus.",
    );
  }

  const averageConfidence =
    Math.round(
      metrics.reduce(
        (
          total,
          metric,
        ) =>
          total +
          metric.confidence,
        0,
      ) /
        metrics.length,
    );

  const consensusId =
    createReferenceLabId(
      "ref-consensus",
      [
        fragranceId,
        versionId,
        timestamp,
      ],
    );

  return {
    runId:
      createReferenceLabId(
        "ref-consensus-run",
        [
          fragranceId,
          versionId,
          timestamp,
        ],
      ),
    fragranceId,
    versionId,
    sourcePackageIds:
      eligible.map(
        (item) =>
          item.packageId,
      ),
    sourceSubmissionIds:
      eligible.map(
        (item) =>
          item.submission
            .submissionId,
      ),
    reviewerIds,
    generatedAt:
      timestamp,
    thresholds,
    snapshot: {
      consensusId,
      sessionId:
        eligible[
          0
        ]!.submission
          .sessionId,
      fragranceId,
      versionId,
      generatedAt:
        timestamp,
      metrics,
      averageConfidence,
      unresolvedConflictCount:
        conflicts.length,
    },
    conflicts,
  };
}

export function recalculateUnresolvedConflictCount({
  run,
  resolvedConflictIds,
}: {
  run:
    ReferenceConsensusRun;
  resolvedConflictIds:
    string[];
}) {
  const resolved =
    new Set(
      resolvedConflictIds,
    );

  return run.conflicts.filter(
    (conflict) =>
      conflict.status ===
        "open" &&
      !resolved.has(
        conflict.conflictId,
      ),
  ).length;
}

function groupClaims(
  packages:
    ReferenceReviewPackage[],
) {
  const groups =
    new Map<
      string,
      ReferenceClaim[]
    >();

  for (
    const reviewPackage
    of packages
  ) {
    for (
      const claim
      of reviewPackage.claims
    ) {
      const key =
        metricKey(
          claim.domain,
          claim.metric,
        );

      const current =
        groups.get(
          key,
        ) ??
        [];

      groups.set(
        key,
        [
          ...current,
          claim,
        ],
      );
    }
  }

  return groups;
}

function latestClaimPerReviewer(
  claims:
    ReferenceClaim<number>[],
) {
  const byReviewer =
    new Map<
      string,
      ReferenceClaim<number>
    >();

  for (
    const claim
    of claims
  ) {
    const current =
      byReviewer.get(
        claim.reviewerId,
      );

    if (
      !current ||
      current.updatedAt <
        claim.updatedAt
    ) {
      byReviewer.set(
        claim.reviewerId,
        claim,
      );
    }
  }

  return [
    ...byReviewer.values(),
  ];
}

function confidenceWeightedMean(
  claims:
    ReferenceClaim<number>[],
) {
  const totalWeight =
    claims.reduce(
      (
        total,
        claim,
      ) =>
        total +
        Math.max(
          claim.confidence,
          1,
        ),
      0,
    );

  return claims.reduce(
    (
      total,
      claim,
    ) =>
      total +
      claim.value *
        Math.max(
          claim.confidence,
          1,
        ),
    0,
  ) /
    totalWeight;
}

function populationVariance(
  values: number[],
) {
  const mean =
    values.reduce(
      (
        total,
        value,
      ) =>
        total +
        value,
      0,
    ) /
    values.length;

  return values.reduce(
    (
      total,
      value,
    ) =>
      total +
      (
        value -
        mean
      ) **
        2,
    0,
  ) /
    values.length;
}

function classifyConflict(
  range: number,
  thresholds:
    ReferenceConsensusThresholds,
):
  | "none"
  | "low"
  | "moderate"
  | "high" {
  if (
    range <=
    thresholds.lowMaxRange
  ) {
    return "none";
  }

  if (
    range <=
    thresholds.moderateMaxRange
  ) {
    return "low";
  }

  if (
    range <=
    thresholds.moderateMaxRange +
      12
  ) {
    return "moderate";
  }

  return "high";
}

function calculateConsensusConfidence({
  claims,
  variance,
  range,
  conflict,
}: {
  claims:
    ReferenceClaim<number>[];
  variance: number;
  range: number;
  conflict:
    | "none"
    | "low"
    | "moderate"
    | "high";
}) {
  const averageClaimConfidence =
    claims.reduce(
      (
        total,
        claim,
      ) =>
        total +
        claim.confidence,
      0,
    ) /
    claims.length;

  const disagreementPenalty =
    Math.min(
      35,
      Math.sqrt(
        variance,
      ) *
        1.4 +
        range *
          0.35,
    );

  const conflictPenalty =
    {
      none: 0,
      low: 3,
      moderate: 8,
      high: 15,
    }[
      conflict
    ];

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        averageClaimConfidence -
          disagreementPenalty -
          conflictPenalty,
      ),
    ),
  );
}

function metricKey(
  domain: string,
  metric: string,
) {
  return `${domain}::${metric}`;
}

function splitMetricKey(
  key: string,
) {
  const [
    domain,
    ...metricParts
  ] =
    key.split(
      "::",
    );

  return [
    domain ??
      "",
    metricParts.join(
      "::",
    ),
  ] as const;
}

function round(
  value: number,
  decimals: number,
) {
  const factor =
    10 **
    decimals;

  return Math.round(
    value *
      factor,
  ) /
    factor;
}
