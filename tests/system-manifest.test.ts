import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Reference Intelligence Laboratory Gold Standard milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.6-alpha.6",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Reference Intelligence Laboratory — Gold Standard Certification",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Gold Standard Certification Engine",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Production Promotion Queue",
    );
  });
});
