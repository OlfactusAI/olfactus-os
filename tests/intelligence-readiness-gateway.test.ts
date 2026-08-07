import {
  describe,
  expect,
  it,
} from "vitest";
import type { FragranceRecord } from "@/lib/domain/fragrance";
import {
  evaluateIntelligenceEligibility,
  filterCatalogForEngine,
  assertEligibleForEngine,
} from "@/lib/intelligence/readiness-gateway";

const complete: FragranceRecord = {
  id:"complete",brand:"Example",name:"Complete",concentration:"Eau de Parfum",
  releaseYear:2024,family:"Woody",perfumers:["A Nose"],
  notes:{top:["Bergamot"],heart:["Lavender"],base:["Cedar"]},
  accords:["Woody"],roles:["office"],seasons:{spring:70,summer:60,fall:80,winter:75},
  dna:{fresh:50,green:40,woody:80,amber:50,sweet:30,dark:40,artistic:60,formal:70},
  moods:["refined"],performance:{longevity:75,projection:70},
  intelligenceStatus:"calibration",
};

const minimal: FragranceRecord = {
  ...complete,id:"minimal",name:"Minimal",family:"Unknown",perfumers:[],
  notes:{top:[],heart:[],base:[]},accords:[],roles:[],moods:[],
};

describe("Intelligence Readiness Gateway", () => {
  it("allows complete calibrated records into advanced engines", () => {
    const result = evaluateIntelligenceEligibility(complete);
    expect(["ready","partial"]).toContain(result.readiness);
    expect(result.allowedEngines).toContain("recommendation");
  });

  it("restricts identity-only records to discovery", () => {
    const result = evaluateIntelligenceEligibility(minimal);
    expect(result.readiness).toBe("search-only");
    expect(result.allowedEngines).toEqual(["search","explorer"]);
    expect(result.restrictedEngines).toContain("deal-lab");
  });

  it("filters catalogs by engine eligibility", () => {
    expect(filterCatalogForEngine([complete,minimal],"recommendation").map((item)=>item.id))
      .toEqual(["complete"]);
  });

  it("throws when a restricted engine receives search-only data", () => {
    expect(() => assertEligibleForEngine(minimal,"blind-buy-risk")).toThrow(
      "is search-only",
    );
  });
});
