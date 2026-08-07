import "server-only";

import {
  randomBytes,
  randomUUID,
} from "node:crypto";
import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type {
  PublicShareRecord,
  ShareRecord,
  ShareType,
  ShareVisibility,
} from "@/lib/sharing/types";

interface ShareDatabase {
  schemaVersion: 1;
  shares: ShareRecord[];
}

const emptyDatabase:
  ShareDatabase = {
    schemaVersion: 1,
    shares: [],
  };

function databasePath() {
  return path.join(
    process.env
      .OLFACTUS_DATA_DIR ??
      path.join(
        process.cwd(),
        ".olfactus-data",
      ),
    "shares.json",
  );
}

async function readDatabase() {
  try {
    const parsed =
      JSON.parse(
        await readFile(
          databasePath(),
          "utf8",
        ),
      ) as ShareDatabase;

    return parsed.schemaVersion ===
      1 &&
      Array.isArray(
        parsed.shares,
      )
      ? parsed
      : structuredClone(
          emptyDatabase,
        );
  } catch {
    return structuredClone(
      emptyDatabase,
    );
  }
}

async function writeDatabase(
  database:
    ShareDatabase,
) {
  const target =
    databasePath();
  await mkdir(
    path.dirname(target),
    {
      recursive: true,
    },
  );
  const temporary =
    `${target}.tmp`;
  await writeFile(
    temporary,
    JSON.stringify(
      database,
      null,
      2,
    ),
    "utf8",
  );
  await rename(
    temporary,
    target,
  );
}

let queue =
  Promise.resolve();

async function mutate<T>(
  callback: (
    database:
      ShareDatabase,
  ) => T | Promise<T>,
) {
  let resolveResult:
    (value: T) => void;
  let rejectResult:
    (reason?: unknown) => void;

  const result =
    new Promise<T>(
      (resolve, reject) => {
        resolveResult =
          resolve;
        rejectResult =
          reject;
      },
    );

  queue = queue.then(
    async () => {
      try {
        const database =
          await readDatabase();
        const value =
          await callback(
            database,
          );
        await writeDatabase(
          database,
        );
        resolveResult(value);
      } catch (error) {
        rejectResult(error);
      }
    },
  );

  return result;
}

export async function createShare({
  accountId,
  type,
  title,
  visibility,
  expiresAt,
  privacy,
  payload,
}: {
  accountId: string;
  type: ShareType;
  title: string;
  visibility: ShareVisibility;
  expiresAt?: string;
  privacy:
    ShareRecord["privacy"];
  payload:
    Record<string, unknown>;
}) {
  return mutate(
    (database) => {
      const now =
        new Date().toISOString();
      const share:
        ShareRecord = {
          id:
            randomUUID(),
          token:
            randomBytes(18).toString(
              "base64url",
            ),
          accountId,
          type,
          title:
            title.trim() ||
            "Untitled share",
          visibility,
          createdAt: now,
          updatedAt: now,
          expiresAt,
          viewCount: 0,
          privacy,
          payload,
        };
      database.shares.push(
        share,
      );
      return share;
    },
  );
}

export async function listShares(
  accountId: string,
) {
  const database =
    await readDatabase();
  return database.shares
    .filter(
      (share) =>
        share.accountId ===
        accountId,
    )
    .sort(
      (a, b) =>
        b.createdAt.localeCompare(
          a.createdAt,
        ),
    );
}

export async function revokeShare(
  accountId: string,
  token: string,
) {
  return mutate(
    (database) => {
      const share =
        database.shares.find(
          (item) =>
            item.accountId ===
              accountId &&
            item.token ===
              token,
        );
      if (!share) {
        return false;
      }
      share.revokedAt =
        new Date().toISOString();
      share.updatedAt =
        share.revokedAt;
      return true;
    },
  );
}

export async function regenerateShareToken(
  accountId: string,
  token: string,
) {
  return mutate(
    (database) => {
      const share =
        database.shares.find(
          (item) =>
            item.accountId ===
              accountId &&
            item.token ===
              token,
        );
      if (!share) {
        return null;
      }
      share.token =
        randomBytes(18).toString(
          "base64url",
        );
      share.updatedAt =
        new Date().toISOString();
      return share;
    },
  );
}

export async function readPublicShare(
  token: string,
) {
  return mutate(
    (database) => {
      const share =
        database.shares.find(
          (item) =>
            item.token ===
            token,
        );

      if (
        !share ||
        share.revokedAt ||
        (share.expiresAt &&
          new Date(
            share.expiresAt,
          ).getTime() <
            Date.now())
      ) {
        return null;
      }

      share.viewCount += 1;
      share.lastViewedAt =
        new Date().toISOString();

      return {
        token:
          share.token,
        type:
          share.type,
        title:
          share.title,
        visibility:
          share.visibility,
        createdAt:
          share.createdAt,
        expiresAt:
          share.expiresAt,
        viewCount:
          share.viewCount,
        privacy:
          share.privacy,
        payload:
          share.payload,
      } satisfies PublicShareRecord;
    },
  );
}
