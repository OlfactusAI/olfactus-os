export type ShareType =
  | "collection"
  | "simulation"
  | "recommendation";

export type ShareVisibility =
  | "unlisted"
  | "public";

export interface SharePrivacy {
  hidePrices: boolean;
  hideWearHistory: boolean;
  hideAcquisitionDates: boolean;
  hidePrivateNotes: boolean;
  disableIndexing: boolean;
}

export interface ShareRecord {
  id: string;
  token: string;
  accountId: string;
  type: ShareType;
  title: string;
  visibility: ShareVisibility;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  revokedAt?: string;
  viewCount: number;
  lastViewedAt?: string;
  passwordHash?: string;
  privacy: SharePrivacy;
  payload: Record<string, unknown>;
}

export interface PublicShareRecord {
  token: string;
  type: ShareType;
  title: string;
  visibility: ShareVisibility;
  createdAt: string;
  expiresAt?: string;
  viewCount: number;
  privacy: SharePrivacy;
  payload: Record<string, unknown>;
}
