import type { CollectionItem, CollectorProfile } from "@/lib/domain/collection";

export const demoProfile: CollectorProfile = {
  collectionStrategy: "balanced-luxury",
  targetSize: 20,
  climate: "hot-humid",
};

export const demoCollection: CollectionItem[] = [
  { fragranceId:"imagination", wearCount:22, daysSinceLastWear:16, personalRating:9.4 },
  { fragranceId:"ganymede", wearCount:9, daysSinceLastWear:31, personalRating:9.2 },
  { fragranceId:"grand-soir", wearCount:13, daysSinceLastWear:10, personalRating:9.1 },
  { fragranceId:"prada-lhomme", wearCount:28, daysSinceLastWear:5, personalRating:8.7 },
  { fragranceId:"terre", wearCount:15, daysSinceLastWear:24, personalRating:8.8 },
  { fragranceId:"naxos", wearCount:11, daysSinceLastWear:18, personalRating:9.0 },
];
