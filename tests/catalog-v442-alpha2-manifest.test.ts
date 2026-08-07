import {
  describe,
  expect,
  it,
} from "vitest";
import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("Catalog source-adapter capability retention", () => {
  it("keeps alpha.2 source-adapter and activation capabilities registered in later releases", () => {
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Source Adapters",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Flanker-Aware Identity Resolver",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Staging Ledger",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Activation Gateway",
    );
  });
});
