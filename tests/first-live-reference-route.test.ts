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

describe("First live Gold Standard reference route", () => {
  it("exposes Aventus end-to-end activation diagnostics", () => {
    const page =
      readFileSync(
        join(
          process.cwd(),
          "app/(app)/reference-live/aventus/page.tsx",
        ),
        "utf8",
      );

    const workspace =
      readFileSync(
        join(
          process.cwd(),
          "components/reference-live/aventus-live-reference.tsx",
        ),
        "utf8",
      );

    expect(
      page,
    ).toContain(
      "AventusLiveReference",
    );

    expect(
      workspace,
    ).toContain(
      "End-to-end provenance chain",
    );

    expect(
      workspace,
    ).toContain(
      "Activate first live Gold Standard reference",
    );
  });
});
