import {
  describe,
  expect,
  it,
} from "vitest";
import {
  findCatalogDuplicateCandidates,
} from "@/lib/catalog-v2/dedupe";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

const base:
  CatalogV2Record = {
    canonicalId:
      "creed:aventus",
    brand:
      "Creed",
    name:
      "Aventus",
    aliases: [],
    perfumers: [],
    notes: [],
    accords: [],
    collections: [],
    validationStatus:
      "validated",
    provenance: [],
    fieldConfidence: {},
  };

describe("Catalog V2 duplicate detection", () => {
  it("flags canonical duplicates before commit", () => {
    const duplicates =
      findCatalogDuplicateCandidates({
        incoming: [
          {
            ...base,
          },
        ],
        existing: [
          {
            ...base,
          },
        ],
      });

    expect(
      duplicates[0]
        .score,
    ).toBe(
      100,
    );
  });
});
