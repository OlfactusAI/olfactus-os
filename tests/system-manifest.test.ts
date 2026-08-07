import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies Official Source Batch 002 + Enrichment Queue", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.5-alpha.3",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Official Source Batch 002 + Enrichment Queue",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Activation Bridge",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Enrichment Queue",
    );
  });
});
