"use client";

import {
  RotateCcw,
  Settings2,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import {
  defaultDashboardPreferences,
  readDashboardPreferences,
  writeDashboardPreferences,
} from "@/lib/intelligence-everywhere/dashboard-preferences";
import type {
  DashboardModule,
  DashboardPreferences,
} from "@/lib/intelligence-everywhere/dashboard-preferences";

const modules:
  Array<{
    id:
      DashboardModule;
    label: string;
  }> = [
    {
      id: "wear",
      label:
        "Today's wear",
    },
    {
      id: "health",
      label:
        "Collection Health",
    },
    {
      id: "rotation",
      label:
        "Rotation",
    },
    {
      id:
        "recommendation-trace",
      label:
        "Recommendation trace",
    },
    {
      id: "events",
      label:
        "Events",
    },
    {
      id: "memory",
      label:
        "Memory",
    },
    {
      id: "market",
      label:
        "Market",
    },
    {
      id: "timeline",
      label:
        "Timeline",
    },
    {
      id: "simulator",
      label:
        "Simulator",
    },
  ];

export function DashboardCustomizer({
  onChange,
}: {
  onChange:
    (
      preferences:
        DashboardPreferences,
    ) => void;
}) {
  const [
    open,
    setOpen,
  ] =
    useState(false);
  const [
    preferences,
    setPreferences,
  ] =
    useState<DashboardPreferences>(
      defaultDashboardPreferences,
    );

  useEffect(() => {
    const next =
      readDashboardPreferences();
    setPreferences(
      next,
    );
    onChange(
      next,
    );
  }, [
    onChange,
  ]);

  function update(
    next:
      DashboardPreferences,
  ) {
    setPreferences(
      next,
    );
    writeDashboardPreferences(
      next,
    );
    onChange(
      next,
    );
  }

  return (
    <div className="dashboard-customizer">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (value) =>
              !value,
          )
        }
      >
        <Settings2
          size={14}
        />
        Customize
      </button>

      {open ? (
        <div className="dashboard-customizer-panel">
          <strong>
            Dashboard modules
          </strong>

          {modules.map(
            (module) => (
              <label
                key={
                  module.id
                }
              >
                <input
                  type="checkbox"
                  checked={preferences.modules.includes(
                    module.id,
                  )}
                  onChange={() => {
                    const exists =
                      preferences.modules.includes(
                        module.id,
                      );
                    update({
                      ...preferences,
                      modules:
                        exists
                          ? preferences.modules.filter(
                              (
                                item,
                              ) =>
                                item !==
                                module.id,
                            )
                          : [
                              ...preferences.modules,
                              module.id,
                            ],
                    });
                  }}
                />
                {
                  module.label
                }
              </label>
            ),
          )}

          <select
            value={
              preferences.density
            }
            onChange={(
              event,
            ) =>
              update({
                ...preferences,
                density:
                  event.target
                    .value ===
                  "compact"
                    ? "compact"
                    : "expanded",
              })
            }
          >
            <option value="expanded">
              Expanded layout
            </option>
            <option value="compact">
              Compact layout
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              update(
                defaultDashboardPreferences,
              )
            }
          >
            <RotateCcw
              size={13}
            />
            Reset dashboard
          </button>
        </div>
      ) : null}
    </div>
  );
}
