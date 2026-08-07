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

describe("Collector Intelligence Unified Registry integration", () => {
  it("creates the registry once and supplies it to the Intelligence API", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "components/providers/collector-intelligence-provider.tsx",
        ),
        "utf8",
      );

    expect(source).toContain(
      "createUnifiedRegistry",
    );
    expect(source).toContain(
      "registry: OlfactusUnifiedRegistry",
    );
    expect(source).toContain(
      "registry,",
    );
  });
});
