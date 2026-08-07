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

describe("Client component directives", () => {
  it("uses a valid directive in account components", () => {
    const files = [
      "components/account/auth-form.tsx",
      "components/account/sync-status.tsx",
      "components/providers/account-provider.tsx",
      "app/(app)/account/page.tsx",
    ];

    for (const file of files) {
      const source =
        readFileSync(
          join(
            process.cwd(),
            file,
          ),
          "utf8",
        );

      expect(
        source.startsWith(
          '"use client";',
        ),
      ).toBe(true);
    }
  });
});
