import { describe, expect, it } from "vitest";
import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeDeal } from "@/lib/intelligence/deal-analyzer-engine";

describe("Deal Analyzer",()=>{
 const result=analyzeDeal({candidateId:"un-air",collection:demoCollection,catalog:fragrances,offers:[{id:"a",seller:"A",price:135,condition:"new"},{id:"b",seller:"B",price:175,condition:"new"}]});
 it("ranks offers and produces a complete verdict",()=>{expect(result.modelVersion).toBe("DLA-1.0.0");expect(result.bestOffer.seller).toBe("A");expect(result.purchaseScore).toBeGreaterThan(0);expect(result.analystVerdict.length).toBeGreaterThan(120)});
 it("includes graph, timing, and alternative intelligence",()=>{expect(result.graph.strategicValue).toBeGreaterThanOrEqual(0);expect(result.timeline).toHaveLength(4);expect(result.alternatives.length).toBeGreaterThan(0)});
});
