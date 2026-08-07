"use client";

import {
  Sparkles,
} from "lucide-react";

export function ContextPanel({
  title,
  items,
}: {
  title: string;
  items:
    Array<{
      label: string;
      value: string;
      note?: string;
    }>;
}) {
  return (
    <aside className="intelligence-context-panel">
      <header>
        <Sparkles
          size={15}
        />
        <div>
          <small>
            Context Intelligence
          </small>
          <strong>
            {title}
          </strong>
        </div>
      </header>

      <div>
        {items.map(
          (item) => (
            <article
              key={
                item.label
              }
            >
              <small>
                {
                  item.label
                }
              </small>
              <strong>
                {
                  item.value
                }
              </strong>
              {item.note ? (
                <p>
                  {
                    item.note
                  }
                </p>
              ) : null}
            </article>
          ),
        )}
      </div>
    </aside>
  );
}
