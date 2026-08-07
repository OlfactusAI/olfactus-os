import {
  describe,
  expect,
  it,
} from "vitest";
import {
  createCatalogStagingStore,
} from "@/lib/catalog-v2/staging/store";
import {
  evaluateCatalogActivation,
} from "@/lib/catalog-v2/activation/gateway";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

const record:
  CatalogV2Record = {
    canonicalId:
      "house:scent",
    brand:
      "House",
    name:
      "Scent",
    aliases: [],
    releaseYear:
      2024,
    concentration:
      "Eau de Parfum",
    family:
      "Woody",
    perfumers: [
      "Perfumer",
    ],
    notes: [
      "Cedar",
    ],
    accords: [
      "Woody",
    ],
    collections: [],
    validationStatus:
      "validated",
    provenance: [
      {
        sourceId:
          "curated",
        sourceKind:
          "curated",
        sourceName:
          "Curated",
        importedAt:
          "2026-08-07T00:00:00.000Z",
        confidence: 95,
      },
    ],
    fieldConfidence: {},
  };

describe("Catalog staging and activation", () => {
  it("keeps records staged and evaluates activation readiness separately", () => {
    const store =
      createCatalogStagingStore();

    const staged =
      store.stage({
        record,
      });

    const decision =
      evaluateCatalogActivation(
        staged,
      );

    expect(
      staged.status,
    ).toBe(
      "pending",
    );
    expect(
      decision.allowed,
    ).toBe(true);
  });
});
