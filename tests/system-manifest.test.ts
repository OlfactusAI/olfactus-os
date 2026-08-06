import {
  describe,
  expect,
  it,
} from "vitest";

import { olfactusSystemManifest } from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the stable 1.6 market release", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe("1.6.0");
    expect(
      olfactusSystemManifest.channel,
    ).toBe("stable");
    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Market Intelligence Stable",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Market Intelligence",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain("Deal Analyzer");
  });
});
