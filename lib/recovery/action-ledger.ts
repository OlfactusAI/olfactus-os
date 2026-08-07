import type { CollectionItem } from "@/lib/domain/collection";

export type RecoveryActionType =
  | "collection-transaction"
  | "timeline-edit"
  | "import-commit"
  | "assistant-feedback"
  | "metadata-change";

export interface RecoveryAction {
  id: string;
  type: RecoveryActionType;
  title: string;
  summary: string;
  createdAt: string;
  beforeCollection?: CollectionItem[];
  afterCollection?: CollectionItem[];
  metadata?: Record<string, string | number | boolean | undefined>;
}

export interface RecoveryLedger {
  past: RecoveryAction[];
  future: RecoveryAction[];
}

const storageKey = "olfactus.recovery.ledger.v1";

export function readRecoveryLedger(): RecoveryLedger {
  if (typeof window === "undefined") return { past: [], future: [] };
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return { past: [], future: [] };
    const parsed = JSON.parse(raw) as RecoveryLedger;
    return {
      past: Array.isArray(parsed.past) ? parsed.past : [],
      future: Array.isArray(parsed.future) ? parsed.future : [],
    };
  } catch {
    return { past: [], future: [] };
  }
}

export function recordRecoveryAction(action: Omit<RecoveryAction, "id" | "createdAt">) {
  const ledger = readRecoveryLedger();
  const next: RecoveryAction = {
    ...action,
    id: `recovery-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  write({ past: [...ledger.past, next].slice(-100), future: [] });
  return next;
}

export function popUndoAction() {
  const ledger = readRecoveryLedger();
  const action = ledger.past.at(-1);
  if (!action) return null;
  write({
    past: ledger.past.slice(0, -1),
    future: [action, ...ledger.future].slice(0, 100),
  });
  return action;
}

export function popRedoAction() {
  const ledger = readRecoveryLedger();
  const action = ledger.future[0];
  if (!action) return null;
  write({
    past: [...ledger.past, action].slice(-100),
    future: ledger.future.slice(1),
  });
  return action;
}

export function clearRecoveryLedger() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(storageKey);
    window.dispatchEvent(new Event("olfactus:recovery-updated"));
  }
}

function write(ledger: RecoveryLedger) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(ledger));
  window.dispatchEvent(new Event("olfactus:recovery-updated"));
}
