import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Catalog Intelligence Enrichment + Promotion Workflow", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.6-alpha.1",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Catalog Intelligence Enrichment + Promotion Workflow",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Enrichment Queue",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Intelligence Promotion Gate",
    );
  });
});
