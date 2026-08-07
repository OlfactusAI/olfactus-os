import type {
  RuntimeReferenceEntity,
} from "@/lib/production-activation/types";

export function proveRuntimeReferenceTraceability(
  runtime:
    RuntimeReferenceEntity,
) {
  const fingerprintKinds =
    new Set(
      runtime.fingerprints.map(
        (fingerprint) =>
          fingerprint.kind,
      ),
    );

  const requiredKinds = [
    "dna",
    "performance",
    "season-weather",
    "role-occasion",
    "recommendation",
    "similarity",
    "collection-twin",
    "blind-buy",
    "decision-lab",
    "global-intelligence",
  ];

  const missing =
    requiredKinds.filter(
      (kind) =>
        !fingerprintKinds.has(
          kind,
        ),
    );

  return {
    traceable:
      missing.length ===
      0 &&
      Boolean(
        runtime.certificateId &&
        runtime.certificateHash &&
        runtime.sourceConsensusId,
      ),
    missingFingerprintKinds:
      missing,
    certificateId:
      runtime.certificateId,
    certificateHash:
      runtime.certificateHash,
    sourceConsensusId:
      runtime.sourceConsensusId,
  };
}
