import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  SavedExplorerSearch,
} from "@/lib/database/explorer-search-storage";

describe("Explorer saved search contract", () => {
  it("supports portable saved-search records", () => {
    const record: SavedExplorerSearch = {
      id: "search-1",
      label: "Fresh office",
      query: "fresh office",
      createdAt:
        "2026-08-06T12:00:00.000Z",
      filters: {
        minimumLongevity: 70,
        minimumProjection: 60,
      },
    };

    expect(record.query).toBe(
      "fresh office",
    );
    expect(
      record.filters
        .minimumLongevity,
    ).toBe(70);
  });
});
