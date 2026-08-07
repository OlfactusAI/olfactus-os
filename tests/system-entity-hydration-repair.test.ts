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

describe("System entity diagnostics hydration", () => {
  const page =
    readFileSync(
      join(
        process.cwd(),
        "app/(app)/system/page.tsx",
      ),
      "utf8",
    );
  const diagnostics =
    readFileSync(
      join(
        process.cwd(),
        "lib/system/entity-diagnostics.ts",
      ),
      "utf8",
    );

  it("does not measure performance during render diagnostics", () => {
    const collectStart =
      diagnostics.indexOf(
        "export function collectEntityDiagnostics",
      );
    const measureStart =
      diagnostics.indexOf(
        "export function measureEntityRegistryBuildTime",
      );
    const collectSource =
      diagnostics.slice(
        collectStart,
        measureStart,
      );

    expect(
      collectSource,
    ).not.toContain(
      "performance.now",
    );
  });

  it("measures registry build time in a client effect", () => {
    expect(page).toContain(
      "measureEntityRegistryBuildTime",
    );
    expect(page).toContain(
      "setRegistryBuildTimeMs",
    );
    expect(page).toContain(
      "if (!hydrated)",
    );
  });

  it("gates registry text until hydration completes", () => {
    expect(page).toContain(
      "hydrated\n                ? entityDiagnostics.entityCount",
    );
    expect(page).toContain(
      'registryBuildTimeMs !==\n                null',
    );
  });
});
