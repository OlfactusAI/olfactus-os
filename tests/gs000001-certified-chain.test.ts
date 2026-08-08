import { describe, expect, it } from "vitest";
import gs001 from "@/lib/os/gold-standard-builder/certified/GS-000001";

describe("Gold Standard Reference #001", () => {
  it("is a complete certified active Aventus chain", () => {
    expect(gs001.referenceId).toBe("GS-000001");
    expect(gs001.fragranceId).toBe("creed:aventus");
    expect(gs001.provenance.status).toBe("PASS");
    expect(gs001.certificate.status).toBe("CERTIFIED");
    expect(gs001.registryRecord.status).toBe("REGISTERED");
    expect(gs001.productionFingerprints.status).toBe("LOCKED");
    expect(gs001.promotionPackage.status).toBe("APPROVED_FOR_ACTIVATION_PACKAGE");
    expect(gs001.activationPackage.status).toBe("READY_FOR_RUNTIME_ACTIVATION");
    expect(gs001.runtimeReference.state).toBe("ACTIVE");
    expect(gs001.activationChainManifest.overallStatus)
      .toBe("GOLD_STANDARD_REFERENCE_001_ACTIVE");
  });

  it("keeps the certified consensus truth boundary controlling", () => {
    expect(gs001.certificate.certificationPolicy.consensusTruthBoundaryIsControlling)
      .toBe(true);
    expect(gs001.certificate.certificationPolicy.withheldCalibrationsExcludedFromGoldStandard)
      .toBe(true);
    expect(gs001.runtimeReference.truthBoundary)
      .toBe("CERTIFIED_CONSENSUS_ONLY");
  });
});
