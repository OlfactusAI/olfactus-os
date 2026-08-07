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

const routes = [
  {
    route: "brands",
    client: "brands-client.tsx",
  },
  {
    route: "database",
    client: "database-client.tsx",
  },
  {
    route: "perfumers",
    client: "perfumers-client.tsx",
  },
];

describe("Route-level useSearchParams boundaries", () => {
  for (const entry of routes) {
    it(`wraps /${entry.route} in a server Suspense boundary`, () => {
      const directory =
        join(
          process.cwd(),
          "app/(app)",
          entry.route,
        );
      const page =
        readFileSync(
          join(
            directory,
            "page.tsx",
          ),
          "utf8",
        );
      const client =
        readFileSync(
          join(
            directory,
            entry.client,
          ),
          "utf8",
        );

      expect(page).toContain(
        "Suspense",
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
  }
});
