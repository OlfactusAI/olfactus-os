import {
  describe,
  expect,
  it,
} from "vitest";
import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Catalog Activation Bridge Foundation release", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.5-alpha.1",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Catalog Activation Bridge Foundation",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Unified Intelligence Context",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Activation Bridge",
    );
  });
});
