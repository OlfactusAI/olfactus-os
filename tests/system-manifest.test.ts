import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Unified Intelligence Context Foundation release", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.4-alpha.1",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Unified Intelligence Context Foundation",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Shared Event Bus",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Unified Intelligence Context",
    );
  });
});
