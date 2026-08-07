import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Production Activation Bridge milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.7-alpha.3",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Production Activation Bridge",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Production Activation Bridge",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Runtime Reference Registry",
    );
  });
});
