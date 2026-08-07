import {
  describe,
  expect,
  it,
} from "vitest";

import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("OLFACTUS OS manifest", () => {
  it("identifies the Integrated Two-Reviewer Authoring milestone", () => {
    expect(
      olfactusSystemManifest.version,
    ).toBe(
      "4.5.0-alpha.2",
    );

    expect(
      olfactusSystemManifest.release,
    ).toBe(
      "Integrated Two-Reviewer Authoring Workspace",
    );

    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Reviewer Independence Guard",
    );
  });
});
