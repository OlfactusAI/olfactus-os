import {
  describe,
  expect,
  it,
} from "vitest";

import { demoCollection } from "@/lib/data/demo";
import { fragrances } from "@/lib/data/fragrances";
import { analyzeCollectionValueDashboard } from "@/lib/intelligence/collection-value-dashboard";
import { analyzeDeal } from "@/lib/intelligence/deal-analyzer-engine";
import { getMarketCatalogEntry } from "@/lib/market/market-catalog";

describe("Market Intelligence Stable integration", () => {
  it("connects portfolio holdings to Deal Lab candidates", () => {
    const portfolio =
      analyzeCollectionValueDashboard({
        collection: demoCollection,
        catalog: fragrances,
      });

    const holding =
      portfolio.topHoldings[0];

    expect(holding).toBeDefined();
    expect(
      fragrances.some(
        (item) =>
          item.id ===
          holding.fragranceId,
      ),
    ).toBe(true);
  });

  it("keeps Deal Lab price tiers aligned with the Purchase Score", () => {
    const candidate =
      fragrances[0];

    const first = analyzeDeal({
      candidateId:
        candidate.id,
      offers: [
        {
          id: "market",
          seller: "Market",
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

    const result = analyzeDeal({
      candidateId:
        candidate.id,
      offers: [
        {
          id: "exceptional",
          seller:
            "Exceptional Offer",
          price: Math.max(
            1,
            first.buyWindow.minimum -
              20,
          ),
          condition: "new",
        },
      ],
      collection: demoCollection,
      catalog: fragrances,
    });

    expect(result.verdict).toBe(
      "Exceptional Deal",
    );
    expect(
      result.purchaseScore,
    ).toBeGreaterThanOrEqual(90);
  });

  it("keeps temporary empty offer states renderable", () => {
    const result = analyzeDeal({
      candidateId:
        fragrances[0].id,
      offers: [],
      collection: demoCollection,
      catalog: fragrances,
    });

    expect(
      result.bestOffer.price,
    ).toBeGreaterThan(0);
  });
});
