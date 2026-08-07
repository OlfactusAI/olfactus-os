export type AssistantFeedback =
  | "helpful"
  | "inaccurate"
  | "dismissed"
  | "remind-later";

export interface AssistantFeedbackRecord {
  insightId: string;
  feedback:
    AssistantFeedback;
  recordedAt: string;
}

const storageKey =
  "olfactus.assistant.feedback.v1";

export function loadAssistantFeedback() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [] as AssistantFeedbackRecord[];
  }

  try {
    const raw =
      window.localStorage.getItem(
        storageKey,
      );
    return raw
      ? (JSON.parse(
          raw,
        ) as AssistantFeedbackRecord[])
      : [];
  } catch {
    return [];
  }
}

export function saveAssistantFeedback(
  insightId: string,
  feedback:
    AssistantFeedback,
) {
  const existing =
    loadAssistantFeedback();
  const next = [
    {
      insightId,
      feedback,
      recordedAt:
        new Date().toISOString(),
    },
    ...existing.filter(
      (item) =>
        item.insightId !==
        insightId,
    ),
  ].slice(0, 100);

  window.localStorage.setItem(
    storageKey,
    JSON.stringify(next),
  );
  window.dispatchEvent(
    new Event(
      "olfactus:assistant-feedback",
    ),
  );
  return next;
}
