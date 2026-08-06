import { describe, expect, it } from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeDeal } from "@/lib/intelligence/deal-analyzer-engine";
import { getMarketCatalogEntry } from "@/lib/market/market-catalog";

describe("Deal score and price-tier alignment", () => {
  it("labels an offer below the buy window as exceptional and raises the score", () => {
    const candidate = fragrances[0];
    const market =
      getMarketCatalogEntry(candidate.id);

    const baseline = analyzeDeal({
      candidateId: candidate.id,
      offers: [
        {
          id: "baseline",
          seller: "Baseline",
          price: market.typicalMarketPrice,
          condition: "new",
        },
      ],
      collection: demoCollection,
      catalog: fragrances,
    });

    const exceptionalPrice = Math.max(
      1,
      baseline.buyWindow.minimum - 25,
    );

    const result = analyzeDeal({
      candidateId: candidate.id,
      offers: [
        {
          id: "exceptional",
          seller: "Exceptional Offer",
          price: exceptionalPrice,
          condition: "new",
        },
      ],
      collection: demoCollection,
      catalog: fragrances,
    });

    expect(result.bestOffer.price).toBeLessThan(
      result.buyWindow.minimum,
    );
    expect(result.verdict).toBe(
      "Exceptional Deal",
    );
    expect(result.purchaseScore).toBeGreaterThanOrEqual(90);
    expect(result.opportunity).toBe("Exceptional");
  });

  it("labels an offer inside the buy window as a good buy", () => {
    const candidate = fragrances[1];
    const first = analyzeDeal({
      candidateId: candidate.id,
      offers: [
        {
          id: "initial",
          seller: "Initial",
          price:
            getMarketCatalogEntry(
              candidate.id,
            ).typicalMarketPrice,
          condition: "new",
        },
      ],
      collection: demoCollection,
      catalog: fragrances,
    });

    const insideWindow = Math.round(
      (first.buyWindow.minimum +
        first.buyWindow.maximum) /
        2,
    );

    const result = analyzeDeal({
      candidateId: candidate.id,
      offers: [
        {
          id: "inside",
          seller: "Inside Window",
          price: insideWindow,
          condition: "new",
        },
      ],
      collection: demoCollection,
      catalog: fragrances,
    });

    expect(result.verdict).toBe("Good Buy");
    expect(result.purchaseScore).toBeGreaterThanOrEqual(80);
  });

  it("still handles an empty temporary offer state", () => {
    const result = analyzeDeal({
      candidateId: fragrances[0].id,
      offers: [],
      collection: demoCollection,
      catalog: fragrances,
    });

    expect(result.bestOffer.price).toBeGreaterThan(0);
  });
});
