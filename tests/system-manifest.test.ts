import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Dataset Review Console milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.5.0-alpha.3",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Dataset Review Console",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Dataset Review Console",
    );
  });
});
