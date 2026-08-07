import {
  describe,
  expect,
  it,
} from "vitest";
import {
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import {
  join,
} from "node:path";

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap(
    (name) => {
      const fullPath =
        join(
          directory,
          name,
        );
      return statSync(fullPath).isDirectory()
        ? walk(fullPath)
        : [fullPath];
    },
  );
}

describe("No direct route-level useSearchParams calls", () => {
  it("keeps useSearchParams out of app page.tsx client routes", () => {
    const appDirectory =
      join(
        process.cwd(),
        "app",
      );
    const offenders =
      walk(appDirectory)
        .filter(
          (file) =>
            file.endsWith(
              "page.tsx",
            ),
        )
        .filter(
          (file) => {
            const source =
              readFileSync(
                file,
                "utf8",
              );
            return (
              source.includes(
                '"use client"',
              ) &&
              source.includes(
                "useSearchParams",
              )
            );
          },
        );

    expect(offenders).toEqual([]);
  });
});
