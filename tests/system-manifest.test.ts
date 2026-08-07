import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Dataset Consensus + Certification Orchestrator milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.5.0-alpha.4",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Dataset Consensus + Certification Orchestrator",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Dataset Consensus + Certification Orchestrator",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Dataset Production Preparation",
    );
  });
});
