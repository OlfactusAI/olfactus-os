import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Reference Intelligence Laboratory data-model milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.6-alpha.2",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Reference Intelligence Laboratory — Data Model",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Intelligence Laboratory",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Calibration Versioning",
    );
  });
});
