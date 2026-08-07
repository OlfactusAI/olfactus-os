import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Reference Intelligence Laboratory consensus milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.6-alpha.5",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Reference Intelligence Laboratory — Consensus + Conflict Detection",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Consensus Engine",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Calibration Conflict Detection",
    );
  });
});
