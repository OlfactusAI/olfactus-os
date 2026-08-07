"use client";

import {
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import {
  useState,
} from "react";

import type {
  TimelineEvent,
  TimelineEventType,
} from "@/lib/timeline/types";
import {
  appendTimelineEvent,
  deleteTimelineEvent,
  updateTimelineEvent,
} from "@/lib/timeline/event-ledger";

const editableTypes:
  TimelineEventType[] = [
    "bottle_added",
    "bottle_removed",
    "wear_logged",
    "sample_added",
    "decant_added",
    "bottle_finished",
    "bottle_upgraded",
    "repurchased",
    "milestone_reached",
    "collection_value_updated",
  ];

export function TimelineEventEditor({
  events,
}: {
  events:
    TimelineEvent[];
}) {
  const [
    editing,
    setEditing,
  ] =
    useState<TimelineEvent | null>(
      null,
    );
  const [
    creating,
    setCreating,
  ] = useState(false);
  const [
    type,
    setType,
  ] =
    useState<TimelineEventType>(
      "sample_added",
    );
  const [
    title,
    setTitle,
  ] = useState("");
  const [
    summary,
    setSummary,
  ] = useState("");
  const [
    timestamp,
    setTimestamp,
  ] = useState(
    toInputDate(
      new Date().toISOString(),
    ),
  );

  function reset() {
    setCreating(false);
    setEditing(null);
    setType(
      "sample_added",
    );
    setTitle("");
    setSummary("");
    setTimestamp(
      toInputDate(
        new Date().toISOString(),
      ),
    );
  }

  function beginEdit(
    event: TimelineEvent,
  ) {
    setEditing(event);
    setCreating(false);
    setType(event.type);
    setTitle(event.title);
    setSummary(
      event.summary,
    );
    setTimestamp(
      toInputDate(
        event.timestamp,
      ),
    );
  }

  function save() {
    if (
      !title.trim() ||
      !summary.trim()
    ) {
      return;
    }

    const payload = {
      type,
      title:
        title.trim(),
      summary:
        summary.trim(),
      timestamp:
        new Date(
          timestamp,
        ).toISOString(),
    };

    if (editing) {
      updateTimelineEvent(
        editing.id,
        payload,
      );
    } else {
      appendTimelineEvent(
        payload,
      );
    }

    reset();
  }

  return (
    <section className="timeline-editor">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="layer3-kicker">
            Timeline Editor
          </p>
          <h2 className="display-serif mt-2 text-3xl">
            Correct the collector record.
          </h2>
        </div>

        <button
          type="button"
          className="layer3-secondary"
          onClick={() => {
            reset();
            setCreating(
              true,
            );
          }}
        >
          <Plus size={14} />
          Add event
        </button>
      </div>

      {creating ||
      editing ? (
        <div className="timeline-editor-form mt-5">
          <label>
            <span>
              Event type
            </span>
            <select
              value={type}
              onChange={(
                event,
              ) =>
                setType(
                  event.target
                    .value as TimelineEventType,
                )
              }
            >
              {editableTypes.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {value.replaceAll(
                      "_",
                      " ",
                    )}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            <span>
              Date and time
            </span>
            <input
              type="datetime-local"
              value={
                timestamp
              }
              onChange={(
                event,
              ) =>
                setTimestamp(
                  event.target
                    .value,
                )
              }
            />
          </label>

          <label className="sm:col-span-2">
            <span>
              Title
            </span>
            <input
              value={title}
              onChange={(
                event,
              ) =>
                setTitle(
                  event.target
                    .value,
                )
              }
            />
          </label>

          <label className="sm:col-span-2">
            <span>
              Notes
            </span>
            <textarea
              value={summary}
              onChange={(
                event,
              ) =>
                setSummary(
                  event.target
                    .value,
                )
              }
            />
          </label>

          <div className="sm:col-span-2 flex gap-2">
            <button
              type="button"
              className="layer3-apply"
              onClick={save}
            >
              <Save size={14} />
              Save event
            </button>
            <button
              type="button"
              className="layer3-secondary"
              onClick={reset}
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-2">
        {events
          .slice()
          .reverse()
          .slice(0, 12)
          .map((event) => (
            <div
              key={event.id}
              className="timeline-edit-row"
            >
              <div className="min-w-0 flex-1">
                <strong>
                  {event.title}
                </strong>
                <small>
                  {new Date(
                    event.timestamp,
                  ).toLocaleString()}{" "}
                  ·{" "}
                  {event.type.replaceAll(
                    "_",
                    " ",
                  )}
                </small>
              </div>
              <button
                type="button"
                onClick={() =>
                  beginEdit(event)
                }
              >
                <Pencil
                  size={13}
                />
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteTimelineEvent(
                    event.id,
                  )
                }
              >
                <Trash2
                  size={13}
                />
              </button>
            </div>
          ))}
      </div>
    </section>
  );
}

function toInputDate(
  value: string,
) {
  const date =
    new Date(value);
  const local =
    new Date(
      date.getTime() -
        date.getTimezoneOffset() *
          60_000,
    );

  return local
    .toISOString()
    .slice(0, 16);
}
