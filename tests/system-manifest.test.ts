import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Aventus Reference Research Pack milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.5.0-alpha.5",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Aventus Reference Research Pack + Calibration Evidence Import",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Aventus Reference Research Pack",
    );
  });
});
