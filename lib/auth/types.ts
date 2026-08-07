export interface AccountRecord {
  id: string;
  email: string;
  displayName: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface PublicAccount {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface SessionPayload {
  accountId: string;
  email: string;
  displayName: string;
  issuedAt: number;
  expiresAt: number;
}
