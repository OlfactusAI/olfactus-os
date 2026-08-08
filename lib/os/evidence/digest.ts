import { createHash } from "node:crypto";
import type { EvidenceRecord, SourceRecord } from "@/lib/os/contracts/evidence";
import type {
  DigestInput,
  EvidenceDigest,
  EvidenceDigestCoverage,
  EvidenceDigestGap,
  EvidenceDigestItem,
  EvidenceDigestSection,
} from "@/lib/os/evidence/digest-types";

const FORBIDDEN_DIGEST_KEYS = new Set([
  "score",
  "scores",
  "calibrationscore",
  "olfactusscore",
  "rating",
  "recommendation",
  "verdict",
  "reviewerconclusion",
]);

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function digestHash(value: Omit<EvidenceDigest, "integrityHash">): string {
  return `sha256:${createHash("sha256").update(stableStringify(value)).digest("hex")}`;
}

function coverageFor(evidenceCount: number, sourceCount: number): EvidenceDigestCoverage {
  if (evidenceCount === 0) return "none";
  if (evidenceCount === 1 || sourceCount === 1) return "thin";
  if (evidenceCount >= 4 && sourceCount >= 3) return "broad";
  return "supported";
}

function gapsFor(evidenceCount: number, sourceCount: number, primarySourceCount: number): EvidenceDigestGap[] {
  const gaps: EvidenceDigestGap[] = [];
  if (evidenceCount === 0) gaps.push({ code: "NO_EVIDENCE", message: "No frozen evidence is linked to this section." });
  if (evidenceCount === 1) gaps.push({ code: "SINGLE_EVIDENCE_ITEM", message: "Only one frozen evidence item is linked to this section." });
  if (sourceCount === 1) gaps.push({ code: "SINGLE_SOURCE", message: "All linked evidence resolves to a single source." });
  if (evidenceCount > 0 && primarySourceCount === 0) gaps.push({ code: "NO_PRIMARY_SOURCE", message: "No linked evidence resolves to a primary-weight source." });
  return gaps;
}

function asItem(record: EvidenceRecord, relationship: EvidenceDigestItem["relationship"]): EvidenceDigestItem {
  return {
    evidenceId: record.evidenceId,
    version: record.version,
    relationship,
    category: record.category,
    claim: record.claim,
    confidence: record.confidence,
    sourceIds: [...record.sourceIds].sort(),
  };
}

function sourceSummary(source: SourceRecord) {
  return {
    sourceId: source.sourceId,
    publisher: source.publisher,
    sourceType: source.sourceType,
    weight: source.weight,
    version: source.version,
  };
}

export function assertEvidenceDigestIsScoreFree(value: unknown): void {
  const visit = (node: unknown): void => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) return node.forEach(visit);
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
      if (FORBIDDEN_DIGEST_KEYS.has(key.toLowerCase())) {
        throw new Error(`Evidence Digest contains forbidden interpretive field: ${key}`);
      }
      visit(child);
    }
  };
  visit(value);
}

export function generateEvidenceDigest(input: DigestInput, generatedAt: string): EvidenceDigest {
  const evidenceById = new Map(input.evidence.map((record) => [record.evidenceId, record]));
  const sourceById = new Map(input.sources.map((source) => [source.sourceId, source]));
  const sectionIds = [...new Set(input.pack.sectionLinks.map((link) => link.sectionId))].sort();

  const sections: EvidenceDigestSection[] = sectionIds.map((sectionId) => {
    const links = input.pack.sectionLinks
      .filter((link) => link.sectionId === sectionId)
      .sort((a, b) => `${a.relationship}:${a.evidenceId}`.localeCompare(`${b.relationship}:${b.evidenceId}`));

    const items = links.map((link) => {
      const record = evidenceById.get(link.evidenceId);
      if (!record) throw new Error(`Digest cannot resolve frozen evidence ${link.evidenceId}.`);
      return asItem(record, link.relationship);
    });

    const linkedSourceIds = [...new Set(items.flatMap((item) => item.sourceIds))].sort();
    const linkedSources = linkedSourceIds.map((sourceId) => {
      const source = sourceById.get(sourceId);
      if (!source) throw new Error(`Digest cannot resolve source ${sourceId}.`);
      return source;
    });
    const confidences = items.map((item) => item.confidence);
    const primarySourceCount = linkedSources.filter((source) => source.weight === "primary").length;

    return {
      sectionId,
      coverage: coverageFor(items.length, linkedSources.length),
      evidenceCount: items.length,
      sourceCount: linkedSources.length,
      primarySourceCount,
      meanEvidenceConfidence: confidences.length ? Number((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)) : null,
      minimumEvidenceConfidence: confidences.length ? Math.min(...confidences) : null,
      supportingEvidence: items.filter((item) => item.relationship === "supports"),
      contextualEvidence: items.filter((item) => item.relationship === "contextualizes"),
      cautionEvidence: items.filter((item) => item.relationship === "cautions"),
      contradictingEvidence: items.filter((item) => item.relationship === "contradicts"),
      sourceRefs: linkedSources.map(sourceSummary).sort((a, b) => a.sourceId.localeCompare(b.sourceId)),
      gaps: gapsFor(items.length, linkedSources.length, primarySourceCount),
    };
  });

  const withoutHash: Omit<EvidenceDigest, "integrityHash"> = {
    digestId: `evidence-digest:${input.pack.fragranceId}:v1`,
    digestVersion: 1,
    fragranceId: input.pack.fragranceId,
    researchPackId: input.pack.researchPackId,
    researchPackIntegrityHash: input.pack.integrityHash,
    generatedAt,
    policy: {
      scoresIncluded: false,
      reviewerConclusionsIncluded: false,
      deterministic: true,
      purpose: "Organize frozen evidence for independent calibration without interpreting or scoring it.",
    },
    reviewerCautions: [...input.pack.reviewerCautions],
    sections,
    totals: {
      sectionCount: sections.length,
      evidenceLinkCount: input.pack.sectionLinks.length,
      distinctEvidenceCount: new Set(input.pack.sectionLinks.map((link) => link.evidenceId)).size,
      distinctSourceCount: new Set(sections.flatMap((section) => section.sourceRefs.map((source) => source.sourceId))).size,
      cautionLinkCount: input.pack.sectionLinks.filter((link) => link.relationship === "cautions").length,
      contradictionLinkCount: input.pack.sectionLinks.filter((link) => link.relationship === "contradicts").length,
      contextualLinkCount: input.pack.sectionLinks.filter((link) => link.relationship === "contextualizes").length,
    },
  };

  assertEvidenceDigestIsScoreFree(withoutHash);
  return { ...withoutHash, integrityHash: digestHash(withoutHash) };
}

export function assertEvidenceDigestIntegrity(digest: EvidenceDigest): void {
  const { integrityHash, ...withoutHash } = digest;
  if (digestHash(withoutHash) !== integrityHash) {
    throw new Error("Evidence Digest integrity verification failed.");
  }
  assertEvidenceDigestIsScoreFree(digest);
}
