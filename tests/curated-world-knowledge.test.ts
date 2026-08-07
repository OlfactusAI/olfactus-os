import {
  describe,
  expect,
  it,
} from "vitest";
import {
  getCuratedWorldKnowledge,
} from "@/lib/graph/data/curated-world-knowledge";

describe("Curated World Knowledge", () => {
  it("contains company, collection, lineage, and competitor knowledge", () => {
    const bundle =
      getCuratedWorldKnowledge();

    expect(
      bundle.entities.some(
        (item) =>
          item.type ===
          "company",
      ),
    ).toBe(true);

    expect(
      bundle.entities.some(
        (item) =>
          item.type ===
          "collection",
      ),
    ).toBe(true);

    expect(
      bundle.relationships.some(
        (item) =>
          item.type ===
          "owned-by-company",
      ),
    ).toBe(true);

    expect(
      bundle.relationships.some(
        (item) =>
          item.type ===
            "clone-of" ||
          item.type ===
            "inspired-by",
      ),
    ).toBe(true);
  });
});
