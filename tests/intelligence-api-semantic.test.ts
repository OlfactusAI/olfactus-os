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

describe("Intelligence API semantic surface", () => {
  it("exposes language interpretation, preference embedding, semantic search, and comparison", () => {
    const source =
      readFileSync(
        join(
          process.cwd(),
          "lib/intelligence-api/index.ts",
        ),
        "utf8",
      );

    expect(source).toContain(
      "getPreferenceEmbedding()",
    );
    expect(source).toContain(
      "interpretFragranceRequest",
    );
    expect(source).toContain(
      "findSemanticCandidates",
    );
    expect(source).toContain(
      "compareInPreferenceSpace",
    );
  });
});
