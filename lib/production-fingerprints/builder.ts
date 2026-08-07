import {
  createReferenceLabId,
} from "@/lib/reference-lab/ids";
import type {
  ReferenceConsensusRun,
} from "@/lib/reference-lab/consensus-types";
import type {
  ReferenceRegistryRecord,
} from "@/lib/reference-registry/types";
import type {
  ProductionFingerprint,
  ProductionFingerprintBundle,
  ProductionFingerprintKind,
  ProductionFingerprintMetric,
} from "@/lib/production-fingerprints/types";

interface FingerprintRule {
  kind:
    ProductionFingerprintKind;
  requiredDomains:
    string[];
  optionalDomains?:
    string[];
}

const fingerprintRules:
  FingerprintRule[] = [
  {
    kind: "dna",
    requiredDomains: [
      "dna",
    ],
  },
  {
    kind: "performance",
    requiredDomains: [
      "performance",
    ],
  },
  {
    kind: "season-weather",
    requiredDomains: [
      "season",
      "weather",
    ],
  },
  {
    kind: "role-occasion",
    requiredDomains: [
      "role",
      "formality",
      "time",
    ],
  },
  {
    kind: "recommendation",
    requiredDomains: [
      "dna",
      "performance",
      "role",
      "season",
      "mood",
      "collector-metric",
    ],
  },
  {
    kind: "similarity",
    requiredDomains: [
      "dna",
      "performance",
      "mood",
    ],
  },
  {
    kind: "collection-twin",
    requiredDomains: [
      "dna",
      "role",
      "season",
      "collector-metric",
    ],
  },
  {
    kind: "blind-buy",
    requiredDomains: [
      "dna",
      "performance",
      "collector-metric",
    ],
  },
  {
    kind: "decision-lab",
    requiredDomains: [
      "role",
      "season",
      "weather",
      "formality",
      "collector-metric",
    ],
  },
  {
    kind: "global-intelligence",
    requiredDomains: [
      "dna",
      "performance",
      "role",
      "season",
      "weather",
      "time",
      "formality",
      "mood",
      "collector-metric",
    ],
  },
];

export function buildProductionFingerprintBundle({
  record,
  run,
  timestamp,
}: {
  record:
    ReferenceRegistryRecord;
  run:
    ReferenceConsensusRun;
  timestamp: string;
}): ProductionFingerprintBundle {
  assertCertifiedSource(
    record,
    run,
  );

  const fingerprints =
    fingerprintRules.map(
      (rule) =>
        buildFingerprint({
          record,
          run,
          rule,
          timestamp,
        }),
    );

  const overallCompleteness =
    fingerprints.length
      ? Math.round(
          fingerprints.reduce(
            (
              total,
              fingerprint,
            ) =>
              total +
              fingerprint.completeness,
            0,
          ) /
            fingerprints.length,
        )
      : 0;

  return {
    bundleId:
      createReferenceLabId(
        "ref-fingerprint-bundle",
        [
          record.referenceId,
          record.currentVersionId,
          run.snapshot
            .consensusId,
        ],
      ),
    referenceId:
      record.referenceId,
    fragranceId:
      record.fragranceId,
    versionId:
      record.currentVersionId,
    certificateId:
      record.currentCertificateId,
    sourceConsensusId:
      run.snapshot
        .consensusId,
    fingerprints,
    generatedAt:
      timestamp,
    overallCompleteness,
    productionReady:
      fingerprints.every(
        (fingerprint) =>
          fingerprint.status ===
          "complete",
      ),
  };
}

export function buildFingerprint({
  record,
  run,
  rule,
  timestamp,
}: {
  record:
    ReferenceRegistryRecord;
  run:
    ReferenceConsensusRun;
  rule:
    FingerprintRule;
  timestamp: string;
}): ProductionFingerprint {
  const availableDomains =
    new Set(
      run.snapshot.metrics.map(
        (metric) =>
          String(
            metric.domain,
          ),
      ),
    );

  const missingDomains =
    rule.requiredDomains.filter(
      (domain) =>
        !availableDomains.has(
          domain,
        ),
    );

  const selectedDomains =
    new Set([
      ...rule.requiredDomains,
      ...(
        rule.optionalDomains ??
        []
      ),
    ]);

  const metrics:
    ProductionFingerprintMetric[] =
      run.snapshot.metrics
        .filter(
          (metric) =>
            selectedDomains.has(
              String(
                metric.domain,
              ),
            ) &&
            typeof metric.value ===
              "number",
        )
        .map(
          (metric) => ({
            key:
              `${String(metric.domain)}:${metric.metric}`,
            value:
              normalizeScore(
                metric.value as number,
              ),
            confidence:
              normalizeScore(
                metric.confidence,
              ),
            sourceConsensusMetric:
              `${String(metric.domain)}:${metric.metric}`,
          }),
        );

  const domainCoverage =
    rule.requiredDomains
      .length
      ? Math.round(
          (
            (
              rule.requiredDomains
                .length -
              missingDomains
                .length
            ) /
            rule.requiredDomains
              .length
          ) *
            100,
        )
      : 100;

  const status =
    missingDomains.length ===
      0 &&
    metrics.length >
      0
      ? "complete"
      : "incomplete";

  return {
    fingerprintId:
      createReferenceLabId(
        "ref-fingerprint",
        [
          record.referenceId,
          record.currentVersionId,
          rule.kind,
        ],
      ),
    referenceId:
      record.referenceId,
    fragranceId:
      record.fragranceId,
    versionId:
      record.currentVersionId,
    certificateId:
      record.currentCertificateId,
    kind:
      rule.kind,
    status,
    completeness:
      status ===
        "complete"
        ? 100
        : domainCoverage,
    metrics,
    blockers:
      missingDomains.map(
        (domain) =>
          `Certified consensus is missing required ${domain} metrics.`,
      ),
    generatedAt:
      timestamp,
    sourceConsensusId:
      run.snapshot
        .consensusId,
  };
}

function assertCertifiedSource(
  record:
    ReferenceRegistryRecord,
  run:
    ReferenceConsensusRun,
) {
  if (
    !record.certificate
      .locked
  ) {
    throw new Error(
      "Production fingerprints require a locked Gold Standard certificate.",
    );
  }

  if (
    record.currentVersionId !==
      run.versionId ||
    record.fragranceId !==
      run.fragranceId
  ) {
    throw new Error(
      "Consensus run does not match the registered certified reference.",
    );
  }

  if (
    record.certificate
      .consensusId !==
      run.snapshot
        .consensusId
  ) {
    throw new Error(
      "Fingerprint generation must use the consensus snapshot named by the Gold Standard certificate.",
    );
  }

  if (
    run.conflicts.some(
      (conflict) =>
        conflict.status ===
        "open",
    )
  ) {
    throw new Error(
      "Production fingerprints cannot be generated from consensus with unresolved conflicts.",
    );
  }
}

function normalizeScore(
  value: number,
) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        value *
          10,
      ) /
        10,
    ),
  );
}
