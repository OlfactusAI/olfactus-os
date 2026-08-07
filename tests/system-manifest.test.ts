import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Global Intelligence Network release while retaining semantic intelligence", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.3.0-alpha.1",
    );
    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Global Intelligence Network Foundation",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Personal Fragrance Language",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Preference Embedding",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Global Intelligence Network",
    );
  });
});
