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

describe("Brands Suspense boundary", () => {
  it("keeps useSearchParams inside a client child", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/brands/page.tsx",
        ),
        "utf8",
      );
    const client =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/brands/brands-client.tsx",
        ),
        "utf8",
      );

    expect(page).toContain(
      "Suspense",
    );
    expect(page).toContain(
      "<BrandsClient />",
    );
    expect(page).not.toContain(
      "useSearchParams",
    );
    expect(page).not.toContain(
      '"use client"',
    );

    expect(client).toContain(
      '"use client"',
    );
    expect(client).toContain(
      "useSearchParams",
    );
  });
});
