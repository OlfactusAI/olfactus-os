import type {
  IntelligenceEligibility,
} from "@/lib/intelligence/readiness-gateway";

export type EvidenceSource =
  | "explicit"
  | "derived"
  | "inferred";

export type EvidenceQuality =
  | "validated"
  | "strong"
  | "partial"
  | "insufficient";

export interface CalibrationEvidenceSignal {
  id: string;
  strength: number;
  source: EvidenceSource;
}

export interface CalibratedIntelligenceScore {
  score: number;
  confidence: number;
  uncertainty: number;
  range: [
    number,
    number,
  ];
  evidenceQuality:
    EvidenceQuality;
  supportingSignals: number;
  inferredSignals: number;
  disagreement: number;
  warnings: string[];
  explanation: string;
}

export function calibrateIntelligenceScore({
  rawScore,
  eligibility,
  evidenceSignals,
  warnings = [],
}: {
  rawScore: number;
  eligibility:
    IntelligenceEligibility;
  evidenceSignals:
    CalibrationEvidenceSignal[];
  warnings?: string[];
}): CalibratedIntelligenceScore {
  const score =
    clamp(
      Math.round(rawScore),
    );
  const strengths =
    evidenceSignals.map(
      (signal) =>
        clamp(signal.strength),
    );
  const averageStrength =
    strengths.length
      ? average(strengths)
      : 0;
  const disagreement =
    strengths.length > 1
      ? standardDeviation(
          strengths,
        )
      : 0;
  const inferredSignals =
    evidenceSignals.filter(
      (signal) =>
        signal.source ===
        "inferred",
    ).length;
  const inferredRatio =
    evidenceSignals.length
      ? inferredSignals /
        evidenceSignals.length
      : 1;
  const signalCoverage =
    Math.min(
      100,
      evidenceSignals.length *
        14,
    );
  const missingPenalty =
    Math.min(
      24,
      eligibility
        .missingFields.length *
        3,
    );
  const confidence =
    clamp(
      Math.round(
        eligibility.confidence *
          0.52 +
          averageStrength * 0.24 +
          signalCoverage * 0.17 -
          disagreement * 0.18 -
          inferredRatio * 14 -
          missingPenalty,
      ),
    );
  const uncertainty =
    clamp(
      Math.round(
        2 +
          (100 - confidence) *
            0.2 +
          disagreement * 0.12 +
          eligibility
            .missingFields.length *
            0.7 +
          inferredRatio * 5,
      ),
      2,
      25,
    );
  const minimum =
    clamp(
      score - uncertainty,
    );
  const maximum =
    clamp(
      score + uncertainty,
    );
  const evidenceQuality =
    classifyEvidenceQuality({
      eligibility,
      confidence,
      evidenceSignals,
    });
  const combinedWarnings = [
    ...eligibility.warnings,
    ...warnings,
  ].filter(
    (warning, index, values) =>
      values.indexOf(
        warning,
      ) === index,
  );

  return {
    score,
    confidence,
    uncertainty,
    range: [
      minimum,
      maximum,
    ],
    evidenceQuality,
    supportingSignals:
      evidenceSignals.length,
    inferredSignals,
    disagreement:
      Math.round(disagreement),
    warnings:
      combinedWarnings,
    explanation:
      buildExplanation({
        confidence,
        uncertainty,
        evidenceQuality,
        missingFields:
          eligibility
            .missingFields,
        inferredSignals,
      }),
  };
}

function classifyEvidenceQuality({
  eligibility,
  confidence,
  evidenceSignals,
}: {
  eligibility:
    IntelligenceEligibility;
  confidence: number;
  evidenceSignals:
    CalibrationEvidenceSignal[];
}): EvidenceQuality {
  if (
    eligibility.readiness ===
      "ready" &&
    confidence >= 88 &&
    evidenceSignals.length >= 5
  ) {
    return "validated";
  }

  if (
    confidence >= 74 &&
    evidenceSignals.length >= 4
  ) {
    return "strong";
  }

  if (
    eligibility.readiness ===
      "partial" &&
    evidenceSignals.length >= 2
  ) {
    return "partial";
  }

  if (
    confidence >= 45 &&
    evidenceSignals.length >= 2
  ) {
    return "partial";
  }

  return "insufficient";
}

function buildExplanation({
  confidence,
  uncertainty,
  evidenceQuality,
  missingFields,
  inferredSignals,
}: {
  confidence: number;
  uncertainty: number;
  evidenceQuality:
    EvidenceQuality;
  missingFields: string[];
  inferredSignals: number;
}) {
  const limitations: string[] =
    [];

  if (missingFields.length) {
    limitations.push(
      `missing ${missingFields.join(
        ", ",
      )}`,
    );
  }

  if (inferredSignals) {
    limitations.push(
      `${inferredSignals} inferred signal${
        inferredSignals === 1
          ? ""
          : "s"
      }`,
    );
  }

  const suffix =
    limitations.length
      ? ` Limited by ${limitations.join(
          " and ",
        )}.`
      : "";

  return `${titleCase(
    evidenceQuality,
  )} evidence supports ${confidence}% confidence with an expected ±${uncertainty}-point range.${suffix}`;
}

function average(
  values: number[],
) {
  return values.length
    ? values.reduce(
        (sum, value) =>
          sum + value,
        0,
      ) / values.length
    : 0;
}

function standardDeviation(
  values: number[],
) {
  const mean =
    average(values);
  const variance =
    average(
      values.map(
        (value) =>
          (value - mean) ** 2,
      ),
    );

  return Math.sqrt(
    variance,
  );
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value,
    ),
  );
}

function titleCase(
  value: string,
) {
  return value
    .replaceAll("-", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}
