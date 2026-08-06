"use client";

import {
  Ban,
  Check,
  Compass,
  Eye,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { CoachAction } from "@/lib/intelligence/collection-coach-engine";

const icons = {
  wear: Sparkles,
  revisit: RotateCcw,
  explore: Compass,
  avoid: Ban,
  review: Eye,
};

export function CoachActionCard({
  action,
  completed,
  onComplete,
  onReopen,
  onDismiss,
}: {
  action: CoachAction;
  completed: boolean;
  onComplete: () => void;
  onReopen: () => void;
  onDismiss: () => void;
}) {
  const Icon = icons[action.type];

  return (
    <article
      className={`coach-action-card ${
        completed ? "is-complete" : ""
      } rounded-[24px] border border-[var(--border)] p-5`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="coach-action-icon">
          <Icon size={16} />
        </span>

        <p className="display-serif text-3xl text-[var(--gold-bright)]">
          {action.priority}
        </p>
      </div>

      <p className="mt-5 text-[.58rem] font-bold uppercase tracking-[.16em] text-[var(--gold)]">
        {action.title}
      </p>
      <h3 className="display-serif mt-2 text-3xl">
        {action.subject}
      </h3>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">
        {action.explanation}
      </p>

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
        <span className="text-xs text-[var(--muted)]">
          {action.confidence}% confidence
        </span>

        <div className="flex gap-2">
          {completed ? (
            <Button onClick={onReopen}>
              <RotateCcw size={14} />
              Reopen
            </Button>
          ) : (
            <Button variant="primary" onClick={onComplete}>
              <Check size={14} />
              Complete
            </Button>
          )}

          <Button
            aria-label="Dismiss coaching action"
            onClick={onDismiss}
          >
            <X size={14} />
          </Button>
        </div>
      </div>
    </article>
  );
}
