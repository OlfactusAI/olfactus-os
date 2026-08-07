import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Reference Registry + Production Promotion Pipeline milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.7-alpha.1",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Reference Registry + Production Promotion Pipeline",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Registry",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Production Promotion Pipeline",
    );
  });
});
