import type {
  DnaDimension,
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type {
  OlfactusIntelligenceApi,
} from "@/lib/intelligence-api";
import {
  createScoreProvenance,
} from "@/lib/intelligence-api/provenance";
import {
  analyzeBuyDecision,
} from "@/lib/intelligence/buy-decision";
import {
  analyzeCollectionHealth,
} from "@/lib/intelligence/collection-health";
import type {
  UnifiedDecision,
  UnifiedDecisionFactor,
} from "@/lib/decision-core/types";

const dnaKeys:
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

export function evaluateCandidateDecision({
  api,
  candidateFragranceId,
  price,
}: {
  api:
    OlfactusIntelligenceApi;
  candidateFragranceId:
    string;
  price?: number;
}): UnifiedDecision {
  const state =
    api.getCollectorState();
  const catalog =
    api.getCatalogContext();
  const candidate =
    catalog.find(
      (fragrance) =>
        fragrance.id ===
        candidateFragranceId,
    );

  if (!candidate) {
    throw new Error(
      `Unknown fragrance: ${candidateFragranceId}`,
    );
  }

  if (
    state.ownership.some(
      (item) =>
        item.fragranceId ===
        candidate.id,
    )
  ) {
    return evaluateOwnedDecision({
      api,
      fragranceId:
        candidate.id,
    });
  }

  const legacy =
    analyzeBuyDecision({
      candidateFragranceId:
        candidate.id,
      collection:
        state.collection,
      profile:
        state.profile,
      catalog,
      price,
    });

  const recommendation =
    state.prediction
      .snapshot
      .adaptiveRecommendations
      .find(
        (item) =>
          item.fragranceId ===
          candidate.id,
      );

  const familyAffinity =
    state.preferences
      .families.find(
        (item) =>
          item.id ===
          candidate.family
            .toLowerCase(),
      )?.score ??
    42;

  const accordAffinity =
    average(
      (
        candidate.accords ??
        []
      ).map(
        (accord) =>
          state.preferences
            .accords.find(
              (item) =>
                item.id ===
                accord.toLowerCase(),
            )?.score ??
          35,
      ),
    );

  const tasteFit =
    Math.round(
      recommendation
        ?.probability ??
        (
          familyAffinity *
            0.55 +
          accordAffinity *
            0.45
        ),
    );

  const sixMonth =
    state.prediction
      .collectionForecast
      .points.find(
        (point) =>
          point.horizon ===
          "6m",
      );

  const futureGapRoles =
    sixMonth?.roles
      .filter(
        (role) =>
          role.status !==
          "covered",
      )
      .map(
        (role) =>
          role.role,
      ) ??
    [];

  const fillsFutureGap =
    candidate.roles.filter(
      (role) =>
        futureGapRoles.includes(
          role,
        ),
    );

  const futureRoleNeed =
    fillsFutureGap.length
      ? 94
      : candidate.roles.some(
            (role) =>
              sixMonth?.roles.some(
                (forecast) =>
                  forecast.role ===
                    role &&
                  forecast.status ===
                    "covered",
              ),
          )
        ? 46
        : 62;

  const owned =
    api.getOwnedFragrances();
  const closest =
    owned
      .map(
        ({ fragrance }) => ({
          fragrance,
          similarity:
            similarity(
              candidate,
              fragrance,
            ),
        }),
      )
      .sort(
        (a, b) =>
          b.similarity -
          a.similarity,
      )[0];

  const overlap =
    Math.round(
      (
        closest?.similarity ??
        0
      ) *
        100,
    );
  const overlapSafety =
    clamp(
      100 -
        overlap,
    );

  const simulated =
    [
      ...state.collection,
      {
        fragranceId:
          candidate.id,
        wearCount: 0,
        daysSinceLastWear:
          0,
      },
    ];

  const projected =
    analyzeCollectionHealth({
      collection:
        simulated,
      catalog,
      profile:
        state.profile,
    });
  const current =
    api.getCollectionHealthContext();
  const healthDelta =
    projected.score -
    current.score;

  const futureHealthSupport =
    clamp(
      56 +
        healthDelta *
          10 +
        (
          fillsFutureGap
            .length
            ? 12
            : 0
        ),
    );

  const retention =
    clamp(
      tasteFit *
        0.48 +
        overlapSafety *
          0.22 +
        futureRoleNeed *
          0.18 +
        legacy.score *
          0.12,
    );

  const priceRisk =
    price ===
    undefined
      ? 26
      : price >=
          500
        ? 78
        : price >=
            350
          ? 60
          : price >=
              225
            ? 42
            : 24;

  const longTermRisk =
    clamp(
      legacy.risk *
        0.42 +
        overlap *
          0.25 +
        (
          100 -
          retention
        ) *
          0.23 +
        priceRisk *
          0.1,
    );

  const score =
    clamp(
      tasteFit *
        0.25 +
        futureRoleNeed *
          0.2 +
        overlapSafety *
          0.18 +
        futureHealthSupport *
          0.17 +
        retention *
          0.15 +
        legacy.score *
          0.05,
    );

  const candidatePerformance =
    average([
      candidate.performance
        .projection,
      candidate.performance
        .longevity,
      candidate.performance
        .consistency ??
        70,
    ]);
  const closestPerformance =
    closest
      ? average([
          closest
            .fragrance
            .performance
            .projection,
          closest
            .fragrance
            .performance
            .longevity,
          closest
            .fragrance
            .performance
            .consistency ??
            70,
        ])
      : 0;

  const verdict =
    overlap >=
      78 &&
    score >=
      72 &&
    candidatePerformance >=
      closestPerformance +
        7
      ? "replace"
      : score >=
            80 &&
          longTermRisk <=
            42 &&
          retention >=
            68
        ? "buy"
        : score >=
              68 &&
            longTermRisk <=
              62 &&
            tasteFit >=
              62
          ? "sample"
          : score >=
                63 &&
              (
                overlap >=
                  70 ||
                priceRisk >=
                  55
              )
            ? "wait"
            : "skip";

  const factors:
    UnifiedDecisionFactor[] = [
      factor(
        "taste-fit",
        "Personal taste fit",
        tasteFit,
        tasteFit >=
          70
          ? "positive"
          : tasteFit >=
              55
            ? "neutral"
            : "negative",
        recommendation
          ? `Adaptive Recommendation predicts ${recommendation.probability}% fit from learned behavior.`
          : `Family and accord affinity produce a ${tasteFit}/100 learned fit.`,
        "REC-3.0.0",
      ),
      factor(
        "future-role",
        "Future role need",
        futureRoleNeed,
        fillsFutureGap.length
          ? "positive"
          : futureRoleNeed <
              50
            ? "negative"
            : "neutral",
        fillsFutureGap.length
          ? `Fills projected ${fillsFutureGap.join(", ")} coverage pressure within six months.`
          : "No high-confidence future role gap requires this candidate.",
        "CF-3.2.0",
      ),
      factor(
        "overlap",
        "Redundancy safety",
        overlapSafety,
        overlap <=
          60
          ? "positive"
          : overlap <=
              76
            ? "neutral"
            : "negative",
        closest
          ? `${overlap}% similarity to ${closest.fragrance.name}, the closest owned fragrance.`
          : "No owned overlap baseline is available.",
        "BDE-1.0.0",
      ),
      factor(
        "health",
        "Collection impact",
        futureHealthSupport,
        healthDelta >
          0
          ? "positive"
          : healthDelta <
              0
            ? "negative"
            : "neutral",
        `Immediate Collection Health ${signed(
          healthDelta,
        )}; current ${current.score}, projected ${projected.score}.`,
        "CHE-1.0.0",
      ),
      factor(
        "retention",
        "Long-term retention",
        retention,
        retention >=
          70
          ? "positive"
          : retention >=
              55
            ? "neutral"
            : "negative",
        `${retention}% estimated retention based on learned fit, overlap, role need, and collection evidence.`,
        "RET-1.2.0",
      ),
      factor(
        "price-risk",
        "Price exposure",
        100 -
          priceRisk,
        priceRisk <=
          35
          ? "positive"
          : priceRisk <=
              55
            ? "neutral"
            : "negative",
        price
          ? `$${Math.round(price)} observed price contributes ${priceRisk}/100 purchase-risk pressure.`
          : "No observed price supplied; price risk is only lightly weighted.",
        "UDC-1.0.0",
      ),
    ];

  const confidence =
    clamp(
      state.confidence
        .overall *
        0.55 +
        legacy.confidence *
          0.25 +
        (
          recommendation
            ?.confidence ??
          55
        ) *
          0.2,
    );

  const summary =
    summaryForCandidate({
      verdict,
      candidate,
      overlap,
      retention,
      healthDelta,
      fillsFutureGap,
    });

  return {
    decisionVersion:
      "UDC-1.0.0",
    generatedAt:
      new Date().toISOString(),
    targetFragranceId:
      candidate.id,
    targetFragranceName:
      `${candidate.brand} ${candidate.name}`,
    mode:
      "candidate",
    verdict,
    score,
    risk:
      longTermRisk,
    confidence,
    summary,
    positives:
      factors.filter(
        (item) =>
          item.direction ===
          "positive",
      ),
    friction:
      factors.filter(
        (item) =>
          item.direction ===
          "negative",
      ),
    factors,
    closestOverlap:
      closest
        ? {
            fragranceId:
              closest
                .fragrance.id,
            fragranceName:
              closest
                .fragrance.name,
            similarity:
              overlap,
          }
        : undefined,
    projectedHealth: {
      current:
        current.score,
      immediate:
        projected.score,
      delta:
        healthDelta,
      sixMonth:
        sixMonth?.health
          .center,
    },
    provenance:
      createScoreProvenance({
        score,
        confidence,
        modelId:
          "UDC",
        evidence:
          factors.map(
            (item) => ({
              id:
                item.id,
              label:
                item.label,
              kind:
                item.id ===
                "taste-fit"
                  ? "observed-behavior"
                  : item.id ===
                      "price-risk"
                    ? price
                      ? "direct-user"
                      : "estimated"
                    : "calculated",
              contribution:
                Math.max(
                  1,
                  Math.abs(
                    item.score -
                      50,
                  ),
                ),
              detail:
                item.explanation,
            }),
          ),
        limitations: [
          ...(state.behavior
            .eventState
            .totalEvents <
          10
            ? [
                "Behavioral memory is still sparse.",
              ]
            : []),
          ...(!price
            ? [
                "No observed transaction price was supplied.",
              ]
            : []),
        ],
      }),
  };
}

export function evaluateOwnedDecision({
  api,
  fragranceId,
}: {
  api:
    OlfactusIntelligenceApi;
  fragranceId: string;
}): UnifiedDecision {
  const state =
    api.getCollectorState();
  const context =
    api.getFragranceState(
      fragranceId,
    );
  const fragrance =
    context.fragrance;
  const ownership =
    context.ownership;

  if (
    !fragrance ||
    !ownership
  ) {
    throw new Error(
      `Owned fragrance not found: ${fragranceId}`,
    );
  }

  const sixMonth =
    state.prediction
      .collectionForecast
      .points.find(
        (point) =>
          point.horizon ===
          "6m",
      );
  const future =
    sixMonth?.bottleStates.find(
      (item) =>
        item.fragranceId ===
        fragranceId,
    );

  const wearStrength =
    clamp(
      ownership.wearCount *
        8 +
        ownership.memoryWearCount *
          5,
    );
  const recency =
    clamp(
      100 -
        ownership
          .daysSinceLastWear *
          1.35,
    );
  const personalLove =
    ownership.favorite
      ? 95
      : ownership
          .personalRating
        ? clamp(
            ownership
              .personalRating *
              10,
          )
        : 55;
  const signature =
    future
      ?.signaturePotential ??
    context.prediction
      ?.signaturePotential ??
    45;
  const retentionRisk =
    future
      ?.retentionRisk ??
    context.prediction
      ?.retentionRisk ??
    45;

  const score =
    clamp(
      wearStrength *
        0.25 +
        recency *
          0.2 +
        personalLove *
          0.25 +
        signature *
          0.2 +
        (
          100 -
          retentionRisk
        ) *
          0.1,
    );

  const verdict =
    retentionRisk >=
      78 &&
    ownership
      .daysSinceLastWear >=
      70 &&
    personalLove <
      70
      ? "sell"
      : ownership
            .daysSinceLastWear >=
          35 &&
        personalLove >=
          65
        ? "revisit"
        : "keep";

  const risk =
    clamp(
      retentionRisk *
        0.7 +
        (
          100 -
          recency
        ) *
          0.3,
    );

  const factors = [
    factor(
      "wear-history",
      "Wear history",
      wearStrength,
      wearStrength >=
        65
        ? "positive"
        : wearStrength >=
            40
          ? "neutral"
          : "negative",
      `${ownership.wearCount} collection wears and ${ownership.memoryWearCount} memory wears.`,
      "MEM-1.0.0",
    ),
    factor(
      "recency",
      "Rotation recency",
      recency,
      recency >=
        65
        ? "positive"
        : recency >=
            40
          ? "neutral"
          : "negative",
      `${ownership.daysSinceLastWear} days since last wear.`,
      "CF-3.2.0",
    ),
    factor(
      "personal-love",
      "Personal attachment",
      personalLove,
      personalLove >=
        70
        ? "positive"
        : personalLove >=
            50
          ? "neutral"
          : "negative",
      ownership.favorite
        ? "Marked as a favorite."
        : ownership.personalRating
          ? `${ownership.personalRating}/10 personal rating.`
          : "No explicit favorite or personal rating signal.",
      "COLLECTOR-STATE-1.0.0",
    ),
    factor(
      "signature",
      "Signature potential",
      signature,
      signature >=
        70
        ? "positive"
        : signature >=
            50
          ? "neutral"
          : "negative",
      `${signature}% projected signature potential.`,
      "SIG-1.1.0",
    ),
    factor(
      "retention",
      "Retention safety",
      100 -
        retentionRisk,
      retentionRisk <=
        40
        ? "positive"
        : retentionRisk <=
            65
          ? "neutral"
          : "negative",
      `${retentionRisk}% future retention-risk signal.`,
      "RET-1.2.0",
    ),
  ] satisfies UnifiedDecisionFactor[];

  const confidence =
    clamp(
      state.confidence
        .overall *
        0.65 +
        (
          context.prediction
            ?.confidence ??
          55
        ) *
          0.35,
    );

  return {
    decisionVersion:
      "UDC-1.0.0",
    generatedAt:
      new Date().toISOString(),
    targetFragranceId:
      fragrance.id,
    targetFragranceName:
      `${fragrance.brand} ${fragrance.name}`,
    mode:
      "owned",
    verdict,
    score,
    risk,
    confidence,
    summary:
      verdict ===
      "sell"
        ? `${fragrance.name} has crossed into a credible sell-candidate zone because weak rotation and retention risk now outweigh attachment signals.`
        : verdict ===
            "revisit"
          ? `${fragrance.name} deserves another wear before any removal decision; attachment remains stronger than current rotation.`
          : `${fragrance.name} remains strategically supported by current ownership evidence.`,
    positives:
      factors.filter(
        (item) =>
          item.direction ===
          "positive",
      ),
    friction:
      factors.filter(
        (item) =>
          item.direction ===
          "negative",
      ),
    factors,
    provenance:
      createScoreProvenance({
        score,
        confidence,
        modelId:
          "UDC",
        evidence:
          factors.map(
            (item) => ({
              id:
                item.id,
              label:
                item.label,
              kind:
                item.id ===
                "personal-love"
                  ? "direct-user"
                  : item.id ===
                      "wear-history"
                    ? "observed-behavior"
                    : "calculated",
              contribution:
                Math.max(
                  1,
                  Math.abs(
                    item.score -
                      50,
                  ),
                ),
              detail:
                item.explanation,
            }),
          ),
      }),
  };
}

function factor(
  id: string,
  label: string,
  score: number,
  direction:
    UnifiedDecisionFactor["direction"],
  explanation: string,
  model: string,
): UnifiedDecisionFactor {
  return {
    id,
    label,
    score:
      clamp(score),
    direction,
    explanation,
    model,
  };
}

function similarity(
  a: FragranceRecord,
  b: FragranceRecord,
) {
  let dot = 0;
  let magnitudeA =
    0;
  let magnitudeB =
    0;

  for (
    const key
    of dnaKeys
  ) {
    dot +=
      a.dna[key] *
      b.dna[key];
    magnitudeA +=
      a.dna[key] ** 2;
    magnitudeB +=
      b.dna[key] ** 2;
  }

  const dna =
    dot /
    (
      Math.sqrt(
        magnitudeA,
      ) *
        Math.sqrt(
          magnitudeB,
        ) ||
      1
    );

  const sharedRoles =
    a.roles.filter(
      (role) =>
        b.roles.includes(
          role,
        ),
    ).length;
  const union =
    new Set([
      ...a.roles,
      ...b.roles,
    ]).size;

  return (
    dna *
      0.68 +
    (
      sharedRoles /
      Math.max(
        1,
        union,
      )
    ) *
      0.32
  );
}

function summaryForCandidate({
  verdict,
  candidate,
  overlap,
  retention,
  healthDelta,
  fillsFutureGap,
}: {
  verdict:
    UnifiedDecision["verdict"];
  candidate:
    FragranceRecord;
  overlap: number;
  retention: number;
  healthDelta: number;
  fillsFutureGap:
    string[];
}) {
  const name =
    candidate.name;

  if (
    verdict ===
    "replace"
  ) {
    return `${name} overlaps heavily with an owned bottle but appears strong enough to evaluate as an upgrade rather than an additional slot.`;
  }

  if (
    verdict ===
    "buy"
  ) {
    return `${name} combines strong personal fit, ${retention}% estimated retention, and ${healthDelta >= 0 ? "non-negative" : "negative"} Collection Health impact.`;
  }

  if (
    verdict ===
    "sample"
  ) {
    return `${name} has meaningful upside${fillsFutureGap.length ? ` and future ${fillsFutureGap.join(", ")} role value` : ""}, but the evidence is not strong enough for an immediate buy.`;
  }

  if (
    verdict ===
    "wait"
  ) {
    return `${name} may fit, but ${overlap}% overlap or purchase exposure makes waiting more rational than acting now.`;
  }

  return `${name} currently adds too little durable value relative to overlap, retention, and collection need.`;
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
        sum + value,
      0,
    ) /
    values.length
  );
}

function signed(
  value: number,
) {
  return value >=
    0
    ? `+${value}`
    : `${value}`;
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
