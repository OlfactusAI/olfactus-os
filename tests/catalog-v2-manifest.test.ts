import {
  describe,
  expect,
  it,
} from "vitest";
import {
  olfactusSystemManifest,
} from "@/lib/os/system-manifest";

describe("Catalog V2 manifest integration", () => {
  it("keeps Catalog V2 foundation capabilities registered across later releases", () => {
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog V2 Ingestion",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Provenance Ledger",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Validation Pipeline",
    );
    expect(
      olfactusSystemManifest.engines,
    ).toContain(
      "Catalog Duplicate Detection",
    );
  });
});
