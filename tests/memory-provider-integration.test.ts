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

describe("Memory provider integration", () => {
  it("wraps the app and records collection actions", () => {
    const layout =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/layout.tsx",
        ),
        "utf8",
      );
    const collection =
      readFileSync(
        join(
          process.cwd(),
          "components/providers/collection-provider.tsx",
        ),
        "utf8",
      );

    expect(layout).toContain(
      "<MemoryProvider>",
    );
    expect(collection).toContain(
      '"wear-recorded"',
    );
    expect(collection).toContain(
      '"collection-added"',
    );
  });
});
