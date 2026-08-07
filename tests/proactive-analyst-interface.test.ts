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

describe("Proactive Analyst interface", () => {
  const source =
    readFileSync(
      join(
        process.cwd(),
        "components/intelligence/global-olfactus-analyst.tsx",
      ),
      "utf8",
    );

  it("supports structured responses and confirmed actions", () => {
    expect(source).toContain(
      "AnalystResponseCard",
    );
    expect(source).toContain(
      "ActionPreview",
    );
    expect(source).toContain(
      "confirmPreview",
    );
    expect(source).toContain(
      "logWear",
    );
  });

  it("uses a non-conflicting global shortcut", () => {
    expect(source).toContain(
      "event.shiftKey",
    );
    expect(source).toContain(
      'event.key.toLowerCase() ===',
    );
  });
});
