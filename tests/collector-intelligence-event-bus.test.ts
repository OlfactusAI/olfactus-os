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

describe("Collector Intelligence Shared Event Bus integration", () => {
  it("creates one stable platform bus and supplies it to every registry refresh", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/providers/collector-intelligence-provider.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "createPlatformEventBus",
    );
    expect(source).toContain(
      "eventBus: OlfactusEventBus",
    );
    expect(source).toContain(
      "eventBus,",
    );
  });
});
