export type FragranceAssetStatus = "verified" | "approved" | "placeholder" | "missing";
export type FragranceAssetSource = "brand" | "retailer" | "user-supplied" | "licensed" | "olfactus-render";
export type FragranceBottleShape = "cylinder" | "square" | "rounded" | "arched" | "generic";

export interface FragranceAssetRecord {
  fragranceId: string;
  brand: string;
  name: string;
  status: FragranceAssetStatus;
  source: FragranceAssetSource;
  sourceUrl?: string;
  attribution?: string;
  shape: FragranceBottleShape;
  palette: { primary: string; accent: string; glass: string };
  assets: { hero: string | null; transparent: string | null; thumbnail: string | null; dark: string | null; light: string | null };
  updatedAt: string;
}

export const fragranceAssetRegistry: Record<string, FragranceAssetRecord> = {
  "imagination": {
    fragranceId: "imagination",
    brand: "Louis Vuitton",
    name: "Imagination",
    status: "placeholder",
    source: "olfactus-render",
    shape: "cylinder",
    palette: { primary: "#1d3543", accent: "#b8d7e4", glass: "rgba(255,255,255,.17)" },
    assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
    updatedAt: "2026-08-05",
  },
  "ganymede": {
    fragranceId: "ganymede",
    brand: "Marc-Antoine Barrois",
    name: "Ganymede",
    status: "placeholder",
    source: "olfactus-render",
    shape: "rounded",
    palette: { primary: "#5a4a36", accent: "#d7bd8b", glass: "rgba(255,255,255,.17)" },
    assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
    updatedAt: "2026-08-05",
  },
  "grand-soir": {
    fragranceId: "grand-soir",
    brand: "Maison Francis Kurkdjian",
    name: "Grand Soir",
    status: "placeholder",
    source: "olfactus-render",
    shape: "square",
    palette: { primary: "#4b260d", accent: "#d39739", glass: "rgba(255,255,255,.17)" },
    assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
    updatedAt: "2026-08-05",
  },
  "prada-lhomme": {
    fragranceId: "prada-lhomme",
    brand: "Prada",
    name: "Prada L'Homme",
    status: "placeholder",
    source: "olfactus-render",
    shape: "square",
    palette: { primary: "#35383a", accent: "#d9d9d2", glass: "rgba(255,255,255,.17)" },
    assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
    updatedAt: "2026-08-05",
  },
  "terre": {
    fragranceId: "terre",
    brand: "Herm\u00e8s",
    name: "Terre d'Herm\u00e8s",
    status: "placeholder",
    source: "olfactus-render",
    shape: "rounded",
    palette: { primary: "#4a210c", accent: "#c77d2f", glass: "rgba(255,255,255,.17)" },
    assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
    updatedAt: "2026-08-05",
  },
  "naxos": {
    fragranceId: "naxos",
    brand: "Xerjoff",
    name: "Naxos",
    status: "placeholder",
    source: "olfactus-render",
    shape: "arched",
    palette: { primary: "#6a3d10", accent: "#e2b05f", glass: "rgba(255,255,255,.17)" },
    assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
    updatedAt: "2026-08-05",
  },
  "un-air": {
    fragranceId: "un-air",
    brand: "L'Artisan Parfumeur",
    name: "Un Air de Bretagne",
    status: "placeholder",
    source: "olfactus-render",
    shape: "rounded",
    palette: { primary: "#123844", accent: "#62a3ae", glass: "rgba(255,255,255,.17)" },
    assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
    updatedAt: "2026-08-05",
  },
  "bottled-absolu": {
    fragranceId: "bottled-absolu",
    brand: "Hugo Boss",
    name: "Bottled Absolu",
    status: "placeholder",
    source: "olfactus-render",
    shape: "arched",
    palette: { primary: "#251712", accent: "#7d5035", glass: "rgba(255,255,255,.17)" },
    assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
    updatedAt: "2026-08-05",
  },
};

const fallbackAsset: FragranceAssetRecord = {
  fragranceId: "unknown",
  brand: "OLFACTUS",
  name: "Fragrance",
  status: "missing",
  source: "olfactus-render",
  shape: "generic",
  palette: { primary: "#242a31", accent: "#c8a866", glass: "rgba(255,255,255,.17)" },
  assets: { hero: null, transparent: null, thumbnail: null, dark: null, light: null },
  updatedAt: "2026-08-05",
};

export function getFragranceAsset(fragranceId: string): FragranceAssetRecord {
  return fragranceAssetRegistry[fragranceId] ?? { ...fallbackAsset, fragranceId };
}
export function getFragranceAssetPath(fragranceId: string, mode: keyof FragranceAssetRecord["assets"]): string | null {
  return getFragranceAsset(fragranceId).assets[mode];
}
export function hasVerifiedFragranceAsset(fragranceId: string) {
  const asset = getFragranceAsset(fragranceId);
  return asset.status === "verified" && Boolean(asset.assets.transparent);
}
export function getAssetRegistrySummary() {
  const records = Object.values(fragranceAssetRegistry);
  return {
    total: records.length,
    verified: records.filter((r) => r.status === "verified").length,
    approved: records.filter((r) => r.status === "approved").length,
    placeholder: records.filter((r) => r.status === "placeholder").length,
    missing: records.filter((r) => r.status === "missing").length,
  };
}
