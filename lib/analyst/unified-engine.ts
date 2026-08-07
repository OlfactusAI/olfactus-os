import type {
  AnalystCommand,
  AnalystResponse,
} from "@/lib/analyst/types";
import {
  runAnalystCommand,
} from "@/lib/analyst/engine";
import type {
  EntityRegistry,
} from "@/lib/entities/types";
import type {
  OlfactusIntelligenceApi,
} from "@/lib/intelligence-api";
import {
  runSemanticFragranceQuery,
} from "@/lib/semantic/engine";

export function runUnifiedAnalystCommand({
  command,
  api,
  registry,
}: {
  command:
    AnalystCommand;
  api:
    OlfactusIntelligenceApi;
  registry:
    EntityRegistry;
}) {
  if (
    command.type ===
      "unknown" &&
    looksLikeSemanticFragranceRequest(
      command.raw,
    )
  ) {
    const semantic =
      runSemanticFragranceQuery({
        api,
        text:
          command.raw,
        limit: 5,
      });

    const top =
      semantic
        .candidates[0];

    if (top) {
      return {
        command,
        response: {
          type:
            "recommendation",
          title:
            "Semantic fragrance match",
          fragranceId:
            top.fragrance.id,
          fragranceName:
            top.fragrance.name,
          brand:
            top.fragrance.brand,
          probability:
            top.combinedScore,
          confidence:
            semantic.request
              .confidence,
          explanation:
            [
              `Your request was translated into ${semantic.request.weightedDimensions.length} preference-space constraints.`,
              ...top.explanation,
              top.decision
                ? `Unified Decision Core: ${top.decision.verdict.toUpperCase()} at ${top.decision.confidence}% confidence.`
                : "Unified Decision Core was not available for this candidate.",
            ],
          evidence: [
            {
              kind:
                "calculated",
              label:
                "Personal Fragrance Language",
              detail:
                semantic.request
                  .explanation
                  .join("; "),
            },
            {
              kind:
                "calculated",
              label:
                "Preference Embedding",
              detail:
                `${semantic.collectorEmbedding.confidence}% confidence across 21 scent dimensions.`,
            },
          ],
        },
      };
    }
  }

  const state =
    api.getCollectorState();
  const catalog =
    api.getCatalogContext();
  const analysis =
    api.getCollectionHealthContext();

  const result =
    runAnalystCommand({
      command,
      collection:
        state.collection,
      catalog,
      analysis,
      registry,
    });

  return {
    ...result,
    response:
      appendUnifiedEvidence(
        result.response,
        state.confidence
          .overall,
        state.confidence
          .provenance.model,
      ),
  };
}

function appendUnifiedEvidence(
  response:
    AnalystResponse,
  confidence: number,
  model: string,
): AnalystResponse {
  const evidence = [
    ...response.evidence,
    {
      kind:
        "calculated" as const,
      label:
        "Canonical Collector State",
      detail:
        `Collector context is unified through ${model} at ${confidence}% state confidence.`,
    },
    {
      kind:
        "calculated" as const,
      label:
        "Personal Intelligence Graph",
      detail:
        "Ownership, wear, preference, and prediction relationships are resolved through the personal graph instead of independent page state.",
    },
    {
      kind:
        "calculated" as const,
      label:
        "Global Intelligence Network",
      detail:
        "Fragrance-world relationships are available through GIN-1.0.0 for graph-backed reasoning and evidence traversal.",
    },
  ];

  return {
    ...response,
    evidence,
  } as AnalystResponse;
}

const semanticTerms = [
  "cleaner",
  "darker",
  "sweeter",
  "less sweet",
  "fresher",
  "airier",
  "drier",
  "warmer",
  "stronger",
  "more formal",
  "unusual",
  "unique",
  "creamy",
  "smoky",
  "greener",
  "fruitier",
  "floral",
  "mineral",
  "metallic",
  "woody",
  "expensive",
  "expensive-smelling",
];

function looksLikeSemanticFragranceRequest(
  raw: string,
): boolean {
  const text =
    raw.toLowerCase();

  return semanticTerms.some(
    (term) =>
      text.includes(
        term.toLowerCase(),
      ),
  );
}
