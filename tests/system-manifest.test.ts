import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Reference Intelligence Laboratory reviewer milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.4.6-alpha.4",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Reference Intelligence Laboratory — Evidence Ledger + Reviewer Workflow",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Evidence Ledger",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reference Reviewer Workflow",
    );
  });
});
