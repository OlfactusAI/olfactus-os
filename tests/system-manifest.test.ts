import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Reference Intelligence Laboratory Calibration Workspace", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.6-alpha.3",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Reference Intelligence Laboratory — Calibration Workspace",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Intelligence Laboratory",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Calibration Workspace",
    );
  });
});
