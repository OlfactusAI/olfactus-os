import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Production Fingerprint Builder milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.7-alpha.2",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Production Fingerprint Builder + Coverage Synchronization",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Production Fingerprint Builder",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Production Coverage Synchronization",
    );
  });
});
