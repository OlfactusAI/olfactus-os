import {
  describe,
  expect,
  it,
} from "vitest";
import {
  resolveCatalogIdentity,
} from "@/lib/catalog-v2/identity/flanker-aware-resolver";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

function record(
  name: string,
  concentration?: string,
): CatalogV2Record {
  return {
    canonicalId:
      `brand:${name}`,
    brand:
      "Brand",
    name,
    aliases: [],
    concentration,
    perfumers: [],
    notes: [],
    accords: [],
    collections: [],
    validationStatus:
      "validated",
    provenance: [],
    fieldConfidence: {},
  };
}

describe("Flanker-aware identity resolution", () => {
  it("keeps concentration variants distinct", () => {
    expect(
      resolveCatalogIdentity(
        record(
          "Example",
          "Eau de Toilette",
        ),
        record(
          "Example",
          "Parfum",
        ),
      ).outcome,
    ).toBe(
      "distinct",
    );
  });

  it("matches equivalent normalized identities", () => {
    expect(
      resolveCatalogIdentity(
        record(
          "Example Scent",
        ),
        record(
          "EXAMPLE SCENT",
        ),
      ).outcome,
    ).toBe(
      "same",
    );
  });
});
