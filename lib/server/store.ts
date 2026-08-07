import "server-only";

import {
  mkdir,
  readFile,
  rename,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type {
  AccountRecord,
} from "@/lib/auth/types";
import type {
  UserDataSnapshot,
} from "@/lib/sync/types";

interface ServerDatabase {
  schemaVersion: 1;
  accounts: AccountRecord[];
  snapshots: Record<
    string,
    UserDataSnapshot
  >;
}

const emptyDatabase: ServerDatabase = {
  schemaVersion: 1,
  accounts: [],
  snapshots: {},
};

function dataDirectory() {
  return (
    process.env.OLFACTUS_DATA_DIR ??
    path.join(
      process.cwd(),
      ".olfactus-data",
    )
  );
}

function databasePath() {
  return path.join(
    dataDirectory(),
    "server-database.json",
  );
}

async function readDatabase() {
  try {
    const raw = await readFile(
      databasePath(),
      "utf8",
    );
    const parsed =
      JSON.parse(raw) as
        ServerDatabase;

    if (
      parsed.schemaVersion !== 1 ||
      !Array.isArray(
        parsed.accounts,
      ) ||
      !parsed.snapshots
    ) {
      return structuredClone(
        emptyDatabase,
      );
    }

    return parsed;
  } catch {
    return structuredClone(
      emptyDatabase,
    );
  }
}

async function writeDatabase(
  database: ServerDatabase,
) {
  await mkdir(
    dataDirectory(),
    {
      recursive: true,
    },
  );
  const target =
    databasePath();
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

let mutationQueue =
  Promise.resolve();

async function mutateDatabase<T>(
  mutation: (
    database:
      ServerDatabase,
  ) => Promise<T> | T,
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

  mutationQueue =
    mutationQueue.then(
      async () => {
        try {
          const database =
            await readDatabase();
          const value =
            await mutation(
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

export async function findAccountByEmail(
  email: string,
) {
  const database =
    await readDatabase();
  return (
    database.accounts.find(
      (account) =>
        !account.deletedAt &&
        account.email ===
          email.toLowerCase(),
    ) ?? null
  );
}

export async function findAccountById(
  accountId: string,
) {
  const database =
    await readDatabase();
  return (
    database.accounts.find(
      (account) =>
        !account.deletedAt &&
        account.id ===
          accountId,
    ) ?? null
  );
}

export async function createAccount(
  account: AccountRecord,
) {
  return mutateDatabase(
    (database) => {
      if (
        database.accounts.some(
          (existing) =>
            !existing.deletedAt &&
            existing.email ===
              account.email,
        )
      ) {
        throw new Error(
          "An account with this email already exists.",
        );
      }

      database.accounts.push(
        account,
      );
      return account;
    },
  );
}

export async function deleteAccount(
  accountId: string,
) {
  return mutateDatabase(
    (database) => {
      const account =
        database.accounts.find(
          (item) =>
            item.id ===
            accountId,
        );
      if (!account) {
        return false;
      }

      account.deletedAt =
        new Date().toISOString();
      account.updatedAt =
        account.deletedAt;
      delete database.snapshots[
        accountId
      ];
      return true;
    },
  );
}

export async function readUserSnapshot(
  accountId: string,
) {
  const database =
    await readDatabase();
  return (
    database.snapshots[
      accountId
    ] ?? null
  );
}

export async function writeUserSnapshot(
  accountId: string,
  snapshot:
    UserDataSnapshot,
) {
  return mutateDatabase(
    (database) => {
      database.snapshots[
        accountId
      ] = snapshot;
      return snapshot;
    },
  );
}
