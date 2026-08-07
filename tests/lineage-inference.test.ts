import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  FragranceRecord,
} from "@/lib/domain/fragrance";
import { buildGlobalFragranceDatabase } from "@/lib/database/database-foundation";
import {
  inferLineageRegistry,
  normalizeLineName,
} from "@/lib/lineage/inference";

const base = {
  brand: "Example",
  family: "Woody",
  roles: ["office"] as const,
  seasons: {
    spring: 80,
    summer: 70,
    fall: 70,
    winter: 60,
  },
  dna: {
    fresh: 60,
    green: 40,
    woody: 70,
    amber: 30,
    sweet: 20,
    dark: 20,
    artistic: 60,
    formal: 70,
  },
  moods: ["refined"],
  performance: {
    longevity: 75,
    projection: 70,
  },
  intelligenceStatus:
    "validated" as const,
};

const catalog:
  FragranceRecord[] = [
    {
      ...base,
      id: "vector-edt",
      name: "Vector",
      concentration:
        "Eau de Toilette",
      releaseYear: 2012,
      roles: [...base.roles],
    },
    {
      ...base,
      id: "vector-edp",
      name: "Vector Eau de Parfum",
      concentration:
        "Eau de Parfum",
      releaseYear: 2016,
      roles: [...base.roles],
    },
    {
      ...base,
      id: "unrelated",
      name: "Unrelated",
      concentration:
        "Eau de Parfum",
      releaseYear: 2020,
      roles: [...base.roles],
    },
  ];

describe("Lineage inference", () => {
  it("normalizes concentration tokens out of line names", () => {
    const database =
      buildGlobalFragranceDatabase({
        catalog,
      });

    expect(
      normalizeLineName(
        database.fragrances[1],
      ),
    ).toBe("vector");
  });

  it("infers only repeated brand and line-name groups", () => {
    const database =
      buildGlobalFragranceDatabase({
        catalog,
      });
    const registry =
      inferLineageRegistry(
        database,
      );

    expect(
      registry.lines,
    ).toHaveLength(1);
    expect(
      registry.lines[0]
        .memberIds,
    ).toEqual([
      "vector-edt",
      "vector-edp",
    ]);
    expect(
      registry.metadata[0]
        .relationship,
    ).toBe("original");
    expect(
      registry.metadata[1]
        .relationship,
    ).toBe("flanker");
  });
});
