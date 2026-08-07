import {
  describe,
  expect,
  it,
} from "vitest";
import {
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

describe("Public entity provider boundaries", () => {
  it("wraps legacy fragrance routes in ActiveCatalogProvider", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/fragrance/[slug]/layout.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "ActiveCatalogProvider",
    );
    expect(source).toContain(
      "<ActiveCatalogProvider>",
    );
  });

  it("wraps universal entity routes in ActiveCatalogProvider", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "app/entity/[type]/[identifier]/layout.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "ActiveCatalogProvider",
    );
    expect(source).toContain(
      "<ActiveCatalogProvider>",
    );
  });
});
