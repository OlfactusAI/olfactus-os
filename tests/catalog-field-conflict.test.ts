import {
  describe,
  expect,
  it,
} from "vitest";
import {
  mergeCatalogRecordsWithConflicts,
} from "@/lib/catalog-v2/conflicts/merge-engine";
import type {
  CatalogV2Record,
} from "@/lib/catalog-v2/types";

function record(
  year: number,
  sourceId: string,
): CatalogV2Record {
  return {
    canonicalId:
      "brand:scent",
    brand:
      "Brand",
    name:
      "Scent",
    aliases: [],
    releaseYear:
      year,
    perfumers: [],
    notes: [],
    accords: [],
    collections: [],
    validationStatus:
      "review",
    provenance: [
      {
        sourceId,
        sourceKind:
          "curated",
        sourceName:
          sourceId,
        importedAt:
          "2026-08-07T00:00:00.000Z",
        confidence: 90,
      },
    ],
    fieldConfidence: {
      releaseYear: 90,
    },
  };
}

describe("Field-level conflict preservation", () => {
  it("preserves conflicting claims rather than silently overwriting them", () => {
    const result =
      mergeCatalogRecordsWithConflicts(
        record(
          2018,
          "a",
        ),
        record(
          2019,
          "b",
        ),
      );

    expect(
      result.conflicts.length,
    ).toBe(
      1,
    );
    expect(
      result.conflicts[0]
        .claims.length,
    ).toBe(
      2,
    );
  });
});
