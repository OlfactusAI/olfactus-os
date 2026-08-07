export function forecastConfidence({
  baseConfidence,
  evidenceEvents,
  collectionSize,
  horizonDays,
}: {
  baseConfidence: number;
  evidenceEvents: number;
  collectionSize: number;
  horizonDays: number;
}) {
  const evidenceBoost =
    Math.min(
      16,
      Math.sqrt(
        evidenceEvents,
      ) * 3.2,
    );
  const collectionBoost =
    Math.min(
      7,
      collectionSize * 0.4,
    );
  const horizonPenalty =
    horizonDays <= 30
      ? 1
      : horizonDays <= 90
        ? 5
        : horizonDays <= 180
          ? 10
          : 18;

  return clamp(
    baseConfidence * 0.68 +
      evidenceBoost +
      collectionBoost +
      15 -
      horizonPenalty,
  );
}

export function forecastUncertainty({
  confidence,
  horizonDays,
}: {
  confidence: number;
  horizonDays: number;
}) {
  const horizonBase =
    horizonDays <= 30
      ? 2
      : horizonDays <= 90
        ? 4
        : horizonDays <= 180
          ? 6
          : 9;

  const confidencePenalty =
    Math.round(
      Math.max(
        0,
        72 - confidence,
      ) * 0.08,
    );

  return Math.min(
    14,
    horizonBase +
      confidencePenalty,
  );
}

function clamp(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value),
    ),
  );
}
