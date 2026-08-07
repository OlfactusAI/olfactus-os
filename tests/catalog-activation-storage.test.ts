import {
  describe,
  expect,
  it,
} from "vitest";
import {
  mergeCatalogV2Activations,
} from "@/lib/catalog-v2/activation/storage";
import type {
  ActivatedCatalogV2Entity,
} from "@/lib/catalog-v2/activation/types";

function activation(
  canonicalId: string,
  confidence: number,
): ActivatedCatalogV2Entity {
  return {
    canonicalId,
    activationId:
      `activation:${canonicalId}`,
    activatedAt:
      "2026-08-07T00:00:00.000Z",
    level:
      "discovery",
    confidence,
    sourceRecord: {
      canonicalId,
      brand: "House",
      name: canonicalId,
      aliases: [],
      perfumers: [],
      notes: [],
      accords: [],
      collections: [],
      validationStatus:
        "validated",
      provenance: [],
      fieldConfidence: {},
    },
  };
}

describe("Catalog V2 activation storage", () => {
  it("keeps activation commits idempotent by canonical identity", () => {
    const merged =
      mergeCatalogV2Activations(
        [activation("a", 70)],
        [activation("a", 95)],
        [activation("b", 80)],
      );

    expect(
      merged.length,
    ).toBe(2);
    expect(
      merged.find(
        (item) =>
          item.canonicalId === "a",
      )?.confidence,
    ).toBe(95);
  });
});
