import {
  describe,
  expect,
  it,
} from "vitest";

import {
  fragranceSlug,
} from "@/lib/public/fragrance-slug";

describe("Public fragrance dossier slugs", () => {
  it("creates stable URL-safe slugs", () => {
    expect(
      fragranceSlug(
        "Creed",
        "Aventus",
      ),
    ).toBe(
      "creed-aventus",
    );
    expect(
      fragranceSlug(
        "Maison Francis Kurkdjian",
        "Baccarat Rouge 540",
      ),
    ).toBe(
      "maison-francis-kurkdjian-baccarat-rouge-540",
    );
  });
});
