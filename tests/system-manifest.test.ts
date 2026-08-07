import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the first live Gold Standard reference milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.8-alpha.1",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "First Live Gold Standard Reference — Creed Aventus",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "First Live Gold Standard Reference",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Creed Aventus Reference Activation",
    );
  });
});
