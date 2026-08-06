import { describe, expect, it } from "vitest";
import { olfactusSystemManifest } from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the stable 1.0 release", () => {
    expect(olfactusSystemManifest.version).toBe("1.0.0");
    expect(olfactusSystemManifest.channel).toBe("stable");
    expect(olfactusSystemManifest.engines.length).toBeGreaterThanOrEqual(7);
  });
});
