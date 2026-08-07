import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies Official Source Batch 001 while retaining the activation bridge", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe("4.4.5-alpha.2");

    expect(
      olfactusSystemManifest.release,
    ).toBe("Official Source Batch 001");

    expect(
      olfactusSystemManifest.engines,
    ).toContain("Catalog Activation Bridge");

    expect(
      olfactusSystemManifest.engines,
    ).toContain("Official Source Catalog Batch 001");
  });
});
