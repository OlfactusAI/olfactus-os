import type {
  ReferenceClaimDomain,
} from "@/lib/reference-lab/types";

export interface CalibrationMetricDefinition {
  domain:
    ReferenceClaimDomain;
  metric: string;
  label: string;
  description: string;
  kind:
    | "score"
    | "weighted-score";
  required: boolean;
}

export interface CalibrationSectionDefinition {
  id: string;
  title: string;
  description: string;
  metrics:
    CalibrationMetricDefinition[];
}

function score(
  domain:
    ReferenceClaimDomain,
  metric: string,
  label: string,
  description: string,
): CalibrationMetricDefinition {
  return {
    domain,
    metric,
    label,
    description,
    kind:
      "score",
    required: true,
  };
}

export const referenceCalibrationSections:
  CalibrationSectionDefinition[] = [
  {
    id: "dna",
    title:
      "DNA Laboratory",
    description:
      "Calibrate the fragrance's structural character on a 0–100 scale.",
    metrics: [
      score(
        "dna",
        "freshness",
        "Freshness",
        "Overall fresh, airy, cooling, or sparkling character.",
      ),
      score(
        "dna",
        "warmth",
        "Warmth",
        "Perceived thermal warmth and enveloping character.",
      ),
      score(
        "dna",
        "sweetness",
        "Sweetness",
        "Perceived sweetness across the full wear.",
      ),
      score(
        "dna",
        "dryness",
        "Dryness",
        "Dry, austere, crisp, or unsweetened character.",
      ),
      score(
        "dna",
        "darkness",
        "Darkness",
        "Shadowed, deep, nocturnal, or brooding character.",
      ),
      score(
        "dna",
        "brightness",
        "Brightness",
        "Luminous, radiant, high-energy character.",
      ),
      score(
        "dna",
        "naturalness",
        "Naturalness",
        "Perceived naturalistic versus abstract/synthetic presentation.",
      ),
      score(
        "dna",
        "texture",
        "Texture",
        "Tactile richness and textural presence.",
      ),
      score(
        "dna",
        "density",
        "Density",
        "Olfactory weight, concentration, and compactness.",
      ),
      score(
        "dna",
        "mass-appeal",
        "Mass Appeal",
        "Breadth of likely positive reception.",
      ),
      score(
        "dna",
        "originality",
        "Originality",
        "Distinctiveness relative to its market context.",
      ),
      score(
        "dna",
        "sophistication",
        "Sophistication",
        "Perceived refinement, polish, and compositional maturity.",
      ),
    ],
  },
  {
    id: "performance",
    title:
      "Performance Laboratory",
    description:
      "Calibrate wear behavior independently from preference.",
    metrics: [
      score(
        "performance",
        "longevity",
        "Longevity",
        "Duration of clearly perceptible wear.",
      ),
      score(
        "performance",
        "projection",
        "Projection",
        "Distance and force of scent radiating from the wearer.",
      ),
      score(
        "performance",
        "sillage",
        "Sillage",
        "Strength and persistence of the scent trail.",
      ),
      score(
        "performance",
        "consistency",
        "Consistency",
        "Reliability across repeated wears and conditions.",
      ),
      score(
        "performance",
        "development-speed",
        "Development Speed",
        "How quickly the composition moves from opening to drydown.",
      ),
      score(
        "performance",
        "skin-persistence",
        "Skin Persistence",
        "Persistence close to the skin after projection fades.",
      ),
      score(
        "performance",
        "air-persistence",
        "Air Persistence",
        "Persistence of the fragrance in surrounding air.",
      ),
    ],
  },
  {
    id: "roles",
    title:
      "Role Laboratory",
    description:
      "Score how strongly the fragrance serves common collection roles.",
    metrics: [
      score(
        "role",
        "daily",
        "Daily",
        "Suitability for regular everyday wear.",
      ),
      score(
        "role",
        "office",
        "Office",
        "Professional-environment suitability.",
      ),
      score(
        "role",
        "date",
        "Date",
        "Romantic or intimate social suitability.",
      ),
      score(
        "role",
        "formal",
        "Formal",
        "Suitability for elevated formal settings.",
      ),
      score(
        "role",
        "signature",
        "Signature",
        "Potential to represent a wearer's identity consistently.",
      ),
      score(
        "role",
        "statement",
        "Statement",
        "Ability to create a strong deliberate impression.",
      ),
      score(
        "role",
        "vacation",
        "Vacation",
        "Suitability for leisure and travel contexts.",
      ),
    ],
  },
  {
    id: "seasons",
    title:
      "Season Laboratory",
    description:
      "Rate seasonal suitability independently for each season.",
    metrics: [
      score(
        "season",
        "spring",
        "Spring",
        "Suitability for typical spring conditions.",
      ),
      score(
        "season",
        "summer",
        "Summer",
        "Suitability for typical summer conditions.",
      ),
      score(
        "season",
        "autumn",
        "Autumn",
        "Suitability for typical autumn conditions.",
      ),
      score(
        "season",
        "winter",
        "Winter",
        "Suitability for typical winter conditions.",
      ),
    ],
  },
  {
    id: "weather",
    title:
      "Weather Laboratory",
    description:
      "Separate climate performance from broad seasonal labels.",
    metrics: [
      score(
        "weather",
        "hot-dry",
        "Hot / Dry",
        "Suitability in hot, low-humidity conditions.",
      ),
      score(
        "weather",
        "hot-humid",
        "Hot / Humid",
        "Suitability in hot, humid conditions.",
      ),
      score(
        "weather",
        "mild-dry",
        "Mild / Dry",
        "Suitability in moderate, dry weather.",
      ),
      score(
        "weather",
        "mild-humid",
        "Mild / Humid",
        "Suitability in moderate, humid weather.",
      ),
      score(
        "weather",
        "cold-dry",
        "Cold / Dry",
        "Suitability in cold, dry weather.",
      ),
      score(
        "weather",
        "cold-humid",
        "Cold / Humid",
        "Suitability in cold, damp weather.",
      ),
      score(
        "weather",
        "rain",
        "Rain",
        "Suitability during rainy conditions.",
      ),
      score(
        "weather",
        "wind",
        "Wind",
        "Ability to remain effective in windy conditions.",
      ),
    ],
  },
  {
    id: "time",
    title:
      "Time Laboratory",
    description:
      "Calibrate fit across the day rather than assigning one time label.",
    metrics: [
      score(
        "time",
        "morning",
        "Morning",
        "Suitability for morning wear.",
      ),
      score(
        "time",
        "afternoon",
        "Afternoon",
        "Suitability for afternoon wear.",
      ),
      score(
        "time",
        "evening",
        "Evening",
        "Suitability for evening wear.",
      ),
      score(
        "time",
        "night",
        "Night",
        "Suitability for late-night wear.",
      ),
    ],
  },
  {
    id: "formality",
    title:
      "Formality Laboratory",
    description:
      "Score fit across escalating levels of dress and occasion.",
    metrics: [
      score(
        "formality",
        "casual",
        "Casual",
        "Suitability for informal settings.",
      ),
      score(
        "formality",
        "business-casual",
        "Business Casual",
        "Suitability for polished but relaxed professional settings.",
      ),
      score(
        "formality",
        "business",
        "Business",
        "Suitability for conventional professional settings.",
      ),
      score(
        "formality",
        "formal",
        "Formal",
        "Suitability for elevated formal events.",
      ),
      score(
        "formality",
        "black-tie",
        "Black Tie",
        "Suitability for highly formal evening dress.",
      ),
    ],
  },
  {
    id: "mood",
    title:
      "Mood Laboratory",
    description:
      "Calibrate the emotional and social energy communicated by the fragrance.",
    metrics: [
      score(
        "mood",
        "relaxed",
        "Relaxed",
        "Ease, comfort, and low-pressure character.",
      ),
      score(
        "mood",
        "professional",
        "Professional",
        "Controlled, composed, competent character.",
      ),
      score(
        "mood",
        "romantic",
        "Romantic",
        "Intimate, sensual, or romantic character.",
      ),
      score(
        "mood",
        "energetic",
        "Energetic",
        "Lively, active, high-energy character.",
      ),
      score(
        "mood",
        "attention-grabbing",
        "Attention Grabbing",
        "Tendency to attract notice.",
      ),
      score(
        "mood",
        "statement",
        "Statement",
        "Deliberate boldness and presence.",
      ),
    ],
  },
  {
    id: "collector",
    title:
      "Collector Metrics",
    description:
      "OLFACTUS-specific collection and ownership intelligence.",
    metrics: [
      score(
        "collector-metric",
        "signature-potential",
        "Signature Potential",
        "Ability to function as a defining personal fragrance.",
      ),
      score(
        "collector-metric",
        "collection-value",
        "Collection Value",
        "Strategic value added to a well-built collection.",
      ),
      score(
        "collector-metric",
        "blind-buy-risk",
        "Blind Buy Risk",
        "Risk of mismatch when purchased without testing.",
      ),
      score(
        "collector-metric",
        "collector-longevity",
        "Collector Longevity",
        "Likelihood of remaining valued over long-term ownership.",
      ),
      score(
        "collector-metric",
        "collection-uniqueness",
        "Collection Uniqueness",
        "Ability to add distinctive territory to a collection.",
      ),
      score(
        "collector-metric",
        "versatility",
        "Versatility",
        "Breadth of situations in which the fragrance works.",
      ),
      score(
        "collector-metric",
        "rotation-importance",
        "Rotation Importance",
        "Likely strategic importance within a rotation.",
      ),
      score(
        "collector-metric",
        "replacement-difficulty",
        "Replacement Difficulty",
        "Difficulty of replacing the fragrance's role and character.",
      ),
      score(
        "collector-metric",
        "bottle-finish-probability",
        "Bottle Finish Probability",
        "Likelihood that an engaged owner actually finishes the bottle.",
      ),
    ],
  },
];

export const requiredCalibrationMetricCount =
  referenceCalibrationSections.reduce(
    (total, section) =>
      total +
      section.metrics.filter(
        (metric) =>
          metric.required,
      ).length,
    0,
  );
