import {
  describe,
  expect,
  it,
} from "vitest";

import { importFragranceRows } from "@/lib/database/importer";
import {
  createCanonicalSlug,
  normalizeConcentration,
  normalizeEntityName,
} from "@/lib/database/normalization";

describe("Global database import and normalization", () => {
  it("normalizes names, slugs, and concentrations", () => {
    expect(
      normalizeEntityName(
        "  Terre   d’Hermès ",
      ),
    ).toBe("Terre d'Hermes");
    expect(
      createCanonicalSlug(
        "Maison Francis Kurkdjian",
        "Grand Soir",
      ),
    ).toBe(
      "maison-francis-kurkdjian-grand-soir",
    );
    expect(
      normalizeConcentration(
        "EDP",
      ),
    ).toBe("eau-de-parfum");
  });

  it("imports valid rows and rejects incomplete ones", () => {
    const result =
      importFragranceRows([
        {
          brand: "Example House",
          name: "Example Scent",
          concentration:
            "Eau de Parfum",
          family: "Woody",
          perfumers:
            "A. Perfumer; B. Perfumer",
        },
        {
          brand: "",
          name: "Incomplete",
          concentration: "EDT",
          family: "",
        },
      ]);

    expect(result.records).toHaveLength(1);
    expect(result.rejected).toHaveLength(1);
    expect(
      result.records[0].intelligenceStatus,
    ).toBe("draft");
  });
});
