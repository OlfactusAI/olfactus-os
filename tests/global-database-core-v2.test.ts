import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fragrances,
} from "@/lib/data/fragrances";
import {
  buildGlobalDatabaseSnapshot,
} from "@/lib/database/core/builder";
import {
  GlobalDatabaseRepository,
} from "@/lib/database/core/repository";
import {
  validateGlobalDatabase,
} from "@/lib/database/core/validator";

describe("Global Fragrance Database Core", () => {
  const snapshot =
    buildGlobalDatabaseSnapshot({
      catalog: fragrances,
      datasetId:
        "test-catalog",
      datasetVersion:
        "2.0.0-test",
    });

  it("builds a normalized v2 snapshot", () => {
    expect(
      snapshot.schemaVersion,
    ).toBe("GFD-2.0.0");
    expect(
      snapshot.metadata.fragranceCount,
    ).toBe(
      fragrances.length,
    );
    expect(
      snapshot.relationships.length,
    ).toBeGreaterThanOrEqual(
      fragrances.length * 2,
    );
  });

  it("validates the generated snapshot", () => {
    const validation =
      validateGlobalDatabase(
        snapshot,
      );

    expect(
      validation.valid,
    ).toBe(true);
    expect(
      validation.errorCount,
    ).toBe(0);
  });

  it("indexes entities and relationships", () => {
    const repository =
      new GlobalDatabaseRepository(
        snapshot,
      );
    const fragrance =
      snapshot.fragrances[0];

    expect(
      repository.getFragrance(
        fragrance.id,
      )?.name,
    ).toBe(fragrance.name);

    expect(
      repository.getRelationshipsFrom({
        type: "fragrance",
        id: fragrance.id,
      }).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it("searches the central repository", () => {
    const repository =
      new GlobalDatabaseRepository(
        snapshot,
      );

    const result =
      repository.searchFragrances(
        fragrances[0].name,
      );

    expect(
      result[0]?.id,
    ).toBe(fragrances[0].id);
  });

  it("rejects invalid snapshots", () => {
    const invalid = {
      ...snapshot,
      metadata: {
        ...snapshot.metadata,
        fragranceCount: 999,
      },
    };

    expect(
      () =>
        new GlobalDatabaseRepository(
          invalid,
        ),
    ).toThrow();
  });
});
