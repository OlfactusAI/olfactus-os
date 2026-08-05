export interface CollectionItem {
  fragranceId: string;
  wearCount: number;
  daysSinceLastWear: number;
  personalRating?: number;
  bottleSizeMl?: number;
  fillLevelPercent?: number;
  favorite?: boolean;
  purchasePrice?: number;
  purchaseCurrency?: string;
}

export interface CollectorProfile {
  collectionStrategy: "balanced-luxury" | "minimalist" | "explorer";
  targetSize: number;
  climate: "hot-humid" | "hot-dry" | "four-seasons" | "cold";
}
