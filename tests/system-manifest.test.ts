import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Source Adapters + Catalog Staging & Activation release", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.2-alpha.2",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Source Adapters + Catalog Staging & Activation",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog V2 Ingestion",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Activation Gateway",
    );
  });
});
