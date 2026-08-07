import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Shared Event Bus Foundation release", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.3-alpha.1",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Shared Event Bus Foundation",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Unified Registry",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Shared Event Bus",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Typed Platform Events",
    );
  });
});
