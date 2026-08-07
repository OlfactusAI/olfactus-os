"use client";

import {
  BellRing,
} from "lucide-react";

import {
  useIntelligenceEverywhere,
} from "@/components/providers/intelligence-everywhere-provider";

export function IntelligenceEventFeed() {
  const {
    events,
  } =
    useIntelligenceEverywhere();

  return (
    <section className="intelligence-feed">
      <header>
        <BellRing
          size={15}
        />
        <div>
          <small>
            Intelligence Events
          </small>
          <strong>
            Recent system signals
          </strong>
        </div>
      </header>

      <div>
        {events
          .slice(
            0,
            6,
          )
          .map(
            (event) => (
              <article
                key={
                  event.id
                }
              >
                <small>
                  {
                    event.type
                  }
                </small>
                <strong>
                  {
                    event.title
                  }
                </strong>
                <p>
                  {
                    event.summary
                  }
                </p>
              </article>
            ),
          )}

        {!events.length ? (
          <p className="intelligence-empty">
            New milestones, alerts, and collection changes will appear here automatically.
          </p>
        ) : null}
      </div>
    </section>
  );
}
