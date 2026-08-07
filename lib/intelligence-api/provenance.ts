import { intelligenceModelRef } from "@/lib/models/registry";

export type ProvenanceEvidenceKind =
  | "direct-user"
  | "observed-behavior"
  | "verified-database"
  | "calculated"
  | "estimated"
  | "unavailable";

export interface ScoreEvidenceContribution {
  id: string;
  label: string;
  kind: ProvenanceEvidenceKind;
  contribution: number;
  detail: string;
  sourceEventIds?: string[];
}

export interface ScoreProvenance {
  score: number;
  confidence: number;
  model: string;
  generatedAt: string;
  evidence: ScoreEvidenceContribution[];
  limitations: string[];
}

export function createScoreProvenance({
  score,
  confidence,
  modelId,
  evidence,
  limitations = [],
  generatedAt,
}: {
  score: number;
  confidence: number;
  modelId: string;
  evidence: ScoreEvidenceContribution[];
  limitations?: string[];
  generatedAt?: string;
}): ScoreProvenance {
  return {
    score: clamp(score),
    confidence: clamp(confidence),
    model: intelligenceModelRef(modelId),
    generatedAt: generatedAt ?? new Date().toISOString(),
    evidence: normalizeContributions(evidence),
    limitations: [...new Set(limitations)],
  };
}

export function provenanceSummary(provenance: ScoreProvenance) {
  const strongest = provenance.evidence
    .slice()
    .sort(
      (a, b) =>
        Math.abs(b.contribution) -
        Math.abs(a.contribution),
    )
    .slice(0, 3);

  return {
    model: provenance.model,
    confidence: provenance.confidence,
    strongestEvidence: strongest.map((item) => item.label),
    limitations: provenance.limitations,
  };
}

function normalizeContributions(evidence: ScoreEvidenceContribution[]) {
  if (!evidence.length) return [];

  const total = evidence.reduce(
    (sum, item) => sum + Math.abs(item.contribution),
    0,
  );

  if (total <= 0) {
    return evidence.map((item) => ({ ...item, contribution: 0 }));
  }

  return evidence.map((item) => ({
    ...item,
    contribution:
      Math.round((item.contribution / total) * 1000) / 10,
  }));
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}
