import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Global Fragrance Catalog Expansion Foundation release", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.2-alpha.1",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Global Fragrance Catalog Expansion Foundation",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Neural Recommendation Engine 2.0",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog V2 Ingestion",
    );
  });
});
