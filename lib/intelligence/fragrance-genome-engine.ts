import type {
  DnaDimension,
  FragranceRecord,
} from "@/lib/domain/fragrance";
import type { ProfilePreferences } from "@/lib/intelligence/profile-intelligence-engine";

const dimensions: DnaDimension[] = [
  "fresh",
  "green",
  "woody",
  "amber",
  "sweet",
  "dark",
  "artistic",
  "formal",
];

export interface GenomeDimension {
  dimension: DnaDimension;
  owned: number;
  worn: number;
  gap: number;
}

export interface GenomeMatch {
  fragranceId: string;
  brand: string;
  fragranceName: string;
  match: number;
  expansion: number;
  sharedCore: DnaDimension[];
}

export interface FragranceGenomeOutput {
  modelVersion: "FG-1.0.0";
  generatedAt: string;
  dimensions: GenomeDimension[];
  signatureCore: DnaDimension[];
  hiddenPreferences: Array<{
    dimension: DnaDimension;
    confidence: number;
    explanation: string;
  }>;
  underdevelopedDna: Array<{
    dimension: DnaDimension;
    opportunity: number;
    explanation: string;
  }>;
  ownedIdentity: string;
  wornIdentity: string;
  emergingIdentity: string;
  collectionCoherence: number;
  genomeConfidence: number;
  matches: GenomeMatch[];
}

export interface FragranceGenomeInput {
  owned: Array<{
    fragrance: FragranceRecord;
    wearCount: number;
    favorite: boolean;
  }>;
  candidates: FragranceRecord[];
  preferences: ProfilePreferences;
}

export function analyzeFragranceGenome({
  owned,
  candidates,
  preferences,
}: FragranceGenomeInput): FragranceGenomeOutput {
  const dimensionsOutput = dimensions.map((dimension) => {
    const ownedValue = average(
      owned.map((item) => item.fragrance.dna[dimension]),
    );

    const wearWeights = owned.map((item) =>
      Math.max(1, item.wearCount + (item.favorite ? 2 : 0)),
    );
    const weightedTotal = wearWeights.reduce(
      (sum, value) => sum + value,
      0,
    ) || 1;

    const wornValue = Math.round(
      owned.reduce(
        (sum, item, index) =>
          sum +
          item.fragrance.dna[dimension] *
            wearWeights[index],
        0,
      ) / weightedTotal,
    );

    return {
      dimension,
      owned: ownedValue,
      worn: wornValue,
      gap: wornValue - ownedValue,
    };
  });

  const signatureCore = [...dimensionsOutput]
    .sort((a, b) => b.worn - a.worn)
    .slice(0, 3)
    .map((item) => item.dimension);

  const hiddenPreferences = dimensionsOutput
    .filter(
      (item) =>
        item.worn >= 68 &&
        item.gap >= 6 &&
        !signatureCore.includes(item.dimension),
    )
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3)
    .map((item) => ({
      dimension: item.dimension,
      confidence: Math.round(
        clamp(item.worn * 0.72 + item.gap * 1.8),
      ),
      explanation: `${capitalize(
        item.dimension,
      )} appears more strongly in what you wear than in what you merely own.`,
    }));

  const underdevelopedDna = dimensionsOutput
    .filter((item) => item.owned < 62)
    .sort((a, b) => a.owned - b.owned)
    .slice(0, 4)
    .map((item) => ({
      dimension: item.dimension,
      opportunity: Math.round(
        clamp(100 - item.owned),
      ),
      explanation: `${capitalize(
        item.dimension,
      )} remains underrepresented and could expand identity without overwhelming the existing core.`,
    }));

  const wornVector = Object.fromEntries(
    dimensionsOutput.map((item) => [
      item.dimension,
      item.worn,
    ]),
  ) as Record<DnaDimension, number>;

  const matches = candidates
    .map((candidate) => {
      const match = vectorSimilarity(
        candidate.dna,
        wornVector,
      );
      const expansion = Math.round(
        average(
          dimensions.map((dimension) =>
            Math.max(
              0,
              candidate.dna[dimension] -
                dimensionsOutput.find(
                  (item) =>
                    item.dimension === dimension,
                )!.owned,
            ),
          ),
        ),
      );
      const sharedCore = [...dimensions]
        .map((dimension) => ({
          dimension,
          strength: Math.min(
            candidate.dna[dimension],
            wornVector[dimension],
          ),
        }))
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3)
        .map((item) => item.dimension);

      return {
        fragranceId: candidate.id,
        brand: candidate.brand,
        fragranceName: candidate.name,
        match,
        expansion,
        sharedCore,
      };
    })
    .sort(
      (a, b) =>
        b.match + b.expansion * 0.22 -
        (a.match + a.expansion * 0.22),
    )
    .slice(0, 6);

  const coherence = Math.round(
    clamp(
      100 -
        average(
          dimensionsOutput.map((item) =>
            Math.abs(item.gap),
          ),
        ) *
          1.35,
    ),
  );

  const preferenceBonus =
    signatureCore.includes(
      dimensionFromPreference(preferences),
    )
      ? 8
      : 0;

  return {
    modelVersion: "FG-1.0.0",
    generatedAt: new Date().toISOString(),
    dimensions: dimensionsOutput,
    signatureCore,
    hiddenPreferences:
      hiddenPreferences.length > 0
        ? hiddenPreferences
        : [
            {
              dimension:
                dimensionsOutput
                  .filter(
                    (item) =>
                      !signatureCore.includes(
                        item.dimension,
                      ),
                  )
                  .sort((a, b) => b.worn - a.worn)[0]
                  ?.dimension ?? "green",
              confidence: 74,
              explanation:
                "Wear behavior suggests a secondary preference that is not yet dominant enough to enter the Signature Core.",
            },
          ],
    underdevelopedDna,
    ownedIdentity: identitySentence(
      [...dimensionsOutput]
        .sort((a, b) => b.owned - a.owned)
        .slice(0, 3)
        .map((item) => item.dimension),
      "owned",
    ),
    wornIdentity: identitySentence(
      signatureCore,
      "worn",
    ),
    emergingIdentity: identitySentence(
      [
        ...hiddenPreferences.map(
          (item) => item.dimension,
        ),
        ...underdevelopedDna
          .slice(0, 2)
          .map((item) => item.dimension),
      ].slice(0, 3),
      "emerging",
    ),
    collectionCoherence: coherence,
    genomeConfidence: Math.round(
      clamp(
        68 +
          Math.min(20, owned.length * 3) +
          preferenceBonus,
      ),
    ),
    matches,
  };
}

function dimensionFromPreference(
  preferences: ProfilePreferences,
): DnaDimension {
  if (
    preferences.preferredRole === "formal" ||
    preferences.preferredRole === "office"
  ) {
    return "formal";
  }
  if (
    preferences.preferredRole === "creative"
  ) {
    return "artistic";
  }
  if (
    preferences.preferredSeason === "summer"
  ) {
    return "fresh";
  }
  if (
    preferences.preferredSeason === "winter"
  ) {
    return "amber";
  }
  return "woody";
}

function identitySentence(
  core: DnaDimension[],
  type: "owned" | "worn" | "emerging",
) {
  const names = core.length
    ? core.map(capitalize).join(" · ")
    : "Still calibrating";

  return {
    owned: `The collection you own is defined by ${names}.`,
    worn: `The identity you actually wear is defined by ${names}.`,
    emerging: `Your next identity direction is moving toward ${names}.`,
  }[type];
}

function vectorSimilarity(
  first: Record<DnaDimension, number>,
  second: Record<DnaDimension, number>,
) {
  let dot = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (const dimension of dimensions) {
    dot +=
      first[dimension] * second[dimension];
    firstMagnitude += first[dimension] ** 2;
    secondMagnitude += second[dimension] ** 2;
  }

  return Math.round(
    clamp(
      (dot /
        (Math.sqrt(firstMagnitude) *
          Math.sqrt(secondMagnitude) || 1)) *
        100,
    ),
  );
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(
    values.reduce((sum, value) => sum + value, 0) /
      values.length,
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
) {
  return Math.min(maximum, Math.max(minimum, value));
}
