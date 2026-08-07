import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Gold Standard Dataset Builder milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.5.0-alpha.1",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Gold Standard Dataset Builder",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Gold Standard Dataset Builder",
    );
  });
});
