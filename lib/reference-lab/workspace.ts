import type {
  ReferenceCalibrationTarget,
} from "@/lib/reference-lab/reference-targets";
import type {
  ReferenceCalibrationVersion,
  ReferenceClaim,
  ReferenceEvidenceLink,
} from "@/lib/reference-lab/types";
import {
  createReferenceCalibrationSession,
  createReferenceLabId,
} from "@/lib/reference-lab";
import {
  referenceCalibrationSections,
  requiredCalibrationMetricCount,
} from "@/lib/reference-lab/workspace-schema";

export interface ReferenceWorkspaceClaimDraft {
  domain: string;
  metric: string;
  value?: number;
  confidence?: number;
  rationale: string;
  evidence: string;
  sourceUrl: string;
}

export interface ReferenceWorkspaceDraft {
  workspaceVersion:
    "RWL-1.0.0";
  sessionId: string;
  fragranceId: string;
  brand: string;
  name: string;
  calibrationVersion:
    string;
  versionId: string;
  status:
    | "draft"
    | "review";
  reviewerId: string;
  locked: boolean;
  claims:
    Record<
      string,
      ReferenceWorkspaceClaimDraft
    >;
  createdAt: string;
  updatedAt: string;
}

export function createReferenceWorkspaceDraft({
  target,
  reviewerId,
  timestamp,
}: {
  target:
    ReferenceCalibrationTarget;
  reviewerId: string;
  timestamp: string;
}): ReferenceWorkspaceDraft {
  const created =
    createReferenceCalibrationSession({
      fragranceId:
        target.fragranceId,
      brand:
        target.brand,
      name:
        target.name,
      createdBy:
        reviewerId,
      createdAt:
        timestamp,
    });

  const claims =
    Object.fromEntries(
      referenceCalibrationSections.flatMap(
        (section) =>
          section.metrics.map(
            (metric) => [
              claimKey(
                metric.domain,
                metric.metric,
              ),
              {
                domain:
                  metric.domain,
                metric:
                  metric.metric,
                rationale:
                  "",
                evidence:
                  "",
                sourceUrl:
                  "",
              } satisfies ReferenceWorkspaceClaimDraft,
            ],
          ),
      ),
    );

  return {
    workspaceVersion:
      "RWL-1.0.0",
    sessionId:
      created.session
        .sessionId,
    fragranceId:
      target.fragranceId,
    brand:
      target.brand,
    name:
      target.name,
    calibrationVersion:
      created.version
        .version,
    versionId:
      created.version
        .versionId,
    status:
      "draft",
    reviewerId,
    locked: false,
    claims,
    createdAt:
      timestamp,
    updatedAt:
      timestamp,
  };
}

export function updateReferenceWorkspaceClaim({
  draft,
  domain,
  metric,
  patch,
  timestamp,
}: {
  draft:
    ReferenceWorkspaceDraft;
  domain: string;
  metric: string;
  patch:
    Partial<
      ReferenceWorkspaceClaimDraft
    >;
  timestamp: string;
}): ReferenceWorkspaceDraft {
  if (
    draft.locked
  ) {
    throw new Error(
      "Locked Reference Laboratory workspaces are read-only.",
    );
  }

  const key =
    claimKey(
      domain,
      metric,
    );

  const current =
    draft.claims[
      key
    ];

  if (!current) {
    throw new Error(
      `Unknown calibration metric ${domain}:${metric}.`,
    );
  }

  return {
    ...draft,
    claims: {
      ...draft.claims,
      [key]: {
        ...current,
        ...patch,
        domain:
          current.domain,
        metric:
          current.metric,
      },
    },
    updatedAt:
      timestamp,
  };
}

export function calculateReferenceWorkspaceCompleteness(
  draft:
    ReferenceWorkspaceDraft,
) {
  const required =
    Object.values(
      draft.claims,
    );

  const scored =
    required.filter(
      isScoredClaim,
    );

  const evidenced =
    required.filter(
      (claim) =>
        isScoredClaim(
          claim,
        ) &&
        claim.rationale
          .trim()
          .length >
          0 &&
        claim.evidence
          .trim()
          .length >
          0,
    );

  const confidenceReady =
    required.filter(
      (claim) =>
        typeof claim.confidence ===
          "number" &&
        claim.confidence >=
          0 &&
        claim.confidence <=
          100,
    );

  return {
    required:
      requiredCalibrationMetricCount,
    scored:
      scored.length,
    evidenced:
      evidenced.length,
    confidenceReady:
      confidenceReady.length,
    scorePercent:
      percent(
        scored.length,
        requiredCalibrationMetricCount,
      ),
    evidencePercent:
      percent(
        evidenced.length,
        requiredCalibrationMetricCount,
      ),
    confidencePercent:
      percent(
        confidenceReady.length,
        requiredCalibrationMetricCount,
      ),
    readyForReview:
      scored.length ===
        requiredCalibrationMetricCount &&
      evidenced.length ===
        requiredCalibrationMetricCount &&
      confidenceReady.length ===
        requiredCalibrationMetricCount,
  };
}

export function submitReferenceWorkspaceForReview({
  draft,
  timestamp,
}: {
  draft:
    ReferenceWorkspaceDraft;
  timestamp: string;
}): ReferenceWorkspaceDraft {
  if (
    draft.locked
  ) {
    throw new Error(
      "Locked Reference Laboratory workspaces cannot be submitted.",
    );
  }

  const completeness =
    calculateReferenceWorkspaceCompleteness(
      draft,
    );

  if (
    !completeness
      .readyForReview
  ) {
    throw new Error(
      "Reference workspace is incomplete and cannot be submitted for review.",
    );
  }

  return {
    ...draft,
    status:
      "review",
    updatedAt:
      timestamp,
  };
}

export function lockReferenceWorkspace({
  draft,
  version,
  timestamp,
}: {
  draft:
    ReferenceWorkspaceDraft;
  version:
    ReferenceCalibrationVersion;
  timestamp: string;
}) {
  if (
    !version.lockedAt
  ) {
    throw new Error(
      "A Reference Laboratory workspace can only be locked from a locked calibration version.",
    );
  }

  return {
    ...draft,
    locked: true,
    updatedAt:
      timestamp,
  };
}

export function materializeReferenceWorkspace({
  draft,
  timestamp,
}: {
  draft:
    ReferenceWorkspaceDraft;
  timestamp: string;
}) {
  const claims:
    ReferenceClaim<number>[] =
      [];
  const evidence:
    ReferenceEvidenceLink[] =
      [];

  for (
    const item
    of Object.values(
      draft.claims,
    )
  ) {
    if (
      !isScoredClaim(
        item,
      )
    ) {
      continue;
    }

    const claimId =
      createReferenceLabId(
        "ref-claim",
        [
          draft.fragranceId,
          draft.calibrationVersion,
          item.domain,
          item.metric,
          draft.reviewerId,
        ],
      );

    const evidenceId =
      createReferenceLabId(
        "ref-evidence",
        [
          draft.fragranceId,
          draft.calibrationVersion,
          item.domain,
          item.metric,
          draft.reviewerId,
        ],
      );

    evidence.push({
      evidenceId,
      label:
        `${item.domain}:${item.metric}`,
      method:
        "curated-review",
      detail:
        item.evidence,
      sourceUrl:
        item.sourceUrl
          .trim() ||
        undefined,
      confidence:
        item.confidence ??
        0,
      capturedAt:
        timestamp,
      capturedBy:
        draft.reviewerId,
    });

    claims.push({
      claimId,
      sessionId:
        draft.sessionId,
      fragranceId:
        draft.fragranceId,
      versionId:
        draft.versionId,
      reviewerId:
        draft.reviewerId,
      domain:
        item.domain as ReferenceClaim<number>["domain"],
      metric:
        item.metric,
      value:
        item.value!,
      confidence:
        item.confidence ??
        0,
      rationale:
        item.rationale,
      evidenceIds: [
        evidenceId,
      ],
      createdAt:
        timestamp,
      updatedAt:
        timestamp,
    });
  }

  return {
    claims,
    evidence,
  };
}

export function claimKey(
  domain: string,
  metric: string,
) {
  return `${domain}:${metric}`;
}

function isScoredClaim(
  claim:
    ReferenceWorkspaceClaimDraft,
) {
  return (
    typeof claim.value ===
      "number" &&
    claim.value >=
      0 &&
    claim.value <=
      100
  );
}

function percent(
  value: number,
  total: number,
) {
  return total
    ? Math.round(
        (
          value /
          total
        ) *
          100,
      )
    : 0;
}
