import {
  describe,
  expect,
  it,
} from "vitest";

import {
  findWorkspace,
  searchWorkspaces,
} from "@/lib/navigation/workspaces";

describe("Lineage workspace navigation", () => {
  it("registers lineage in the NEXUS workspace index", () => {
    expect(
      findWorkspace(
        "/lineage",
      )?.label,
    ).toBe("Lineage");

    expect(
      searchWorkspaces(
        "flanker",
      ).some(
        (workspace) =>
          workspace.href ===
          "/lineage",
      ),
    ).toBe(true);
  });
});
