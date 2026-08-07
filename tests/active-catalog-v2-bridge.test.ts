import {
  describe,
  expect,
  it,
} from "vitest";
import {
  mergeFragranceCatalogs,
} from "@/lib/database/active-catalog";
import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";

function fragrance(
  id: string,
): FragranceRecord {
  return {
    id,
    brand: "House",
    name: id,
    concentration:
      "Eau de Parfum",
    family: "Woody",
    roles: ["casual"],
    seasons: {
      spring: 50,
      summer: 50,
      fall: 50,
      winter: 50,
    },
    dna: {
      fresh: 50,
      green: 50,
      woody: 50,
      amber: 50,
      sweet: 50,
      dark: 50,
      artistic: 50,
      formal: 50,
    },
    moods: [],
    performance: {
      projection: 50,
      longevity: 50,
    },
    intelligenceStatus:
      "calibration",
  };
}

describe("Active catalog Catalog V2 bridge", () => {
  it("merges activated intelligence records idempotently", () => {
    const merged =
      mergeFragranceCatalogs(
        [fragrance("a")],
        [fragrance("b")],
        [fragrance("b")],
      );

    expect(
      merged.map(
        (item) => item.id,
      ),
    ).toEqual([
      "a",
      "b",
    ]);
  });
});
