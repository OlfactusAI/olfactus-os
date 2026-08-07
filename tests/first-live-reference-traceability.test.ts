import {
  describe,
  expect,
  it,
} from "vitest";
import {
  proveRuntimeReferenceTraceability,
} from "@/lib/reference-live/runtime-proof";

describe("First live reference runtime traceability", () => {
  it("requires every production fingerprint plus certificate and consensus identity", () => {
    const kinds = [
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

    const proof =
      proveRuntimeReferenceTraceability({
        runtimeReferenceId:
          "runtime:aventus",
        referenceId:
          "ref-registry:creed-aventus",
        fragranceId:
          "creed:aventus",
        versionId:
          "version:1",
        certificateId:
          "certificate:1",
        certificateHash:
          "gs1-test",
        sourceConsensusId:
          "consensus:1",
        activatedAt:
          "2026-08-07T00:00:00.000Z",
        activatedBy:
          "production:admin",
        fingerprints:
          kinds.map(
            (kind) => ({
              kind,
              completeness: 100,
              metrics: [],
            }),
          ),
      });

    expect(
      proof.traceable,
    ).toBe(true);

    expect(
      proof.missingFingerprintKinds,
    ).toHaveLength(0);
  });
});
