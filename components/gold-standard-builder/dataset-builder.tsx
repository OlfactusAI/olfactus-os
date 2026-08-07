"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  createGoldStandardDatasetState,
  determineGoldStandardDatasetStage,
} from "@/lib/gold-standard-builder/builder";
import {
  loadGoldStandardBuildState,
  loadGoldStandardTargets,
  saveGoldStandardBuildState,
  upsertGoldStandardTarget,
} from "@/lib/gold-standard-builder/storage";
import type {
  GoldStandardDatasetTarget,
} from "@/lib/gold-standard-builder/types";

const defaultReviewers = [
  {
    reviewerId:
      "reviewer:dataset-a",
    displayName:
      "Dataset Reviewer A",
  },
  {
    reviewerId:
      "reviewer:dataset-b",
    displayName:
      "Dataset Reviewer B",
  },
];

export function GoldStandardDatasetBuilder() {
  const [
    targets,
    setTargets,
  ] =
    useState<
      GoldStandardDatasetTarget[]
    >(
      loadGoldStandardTargets(),
    );

  const [
    selectedId,
    setSelectedId,
  ] =
    useState(
      targets[
        0
      ]?.fragranceId ??
        "",
    );

  const [
    form,
    setForm,
  ] =
    useState({
      fragranceId:
        "creed:aventus",
      brand:
        "Creed",
      name:
        "Aventus",
    });

  const [
    notice,
    setNotice,
  ] =
    useState("");

  const state =
    useMemo(
      () =>
        selectedId
          ? loadGoldStandardBuildState(
              selectedId,
            )
          : undefined,
      [
        selectedId,
        notice,
      ],
    );

  const createTarget =
    () => {
      const target = {
        fragranceId:
          form.fragranceId
            .trim(),
        brand:
          form.brand
            .trim(),
        name:
          form.name
            .trim(),
      };

      if (
        !target.fragranceId ||
        !target.brand ||
        !target.name
      ) {
        setNotice(
          "Fragrance ID, brand, and name are required.",
        );
        return;
      }

      const nextTargets =
        upsertGoldStandardTarget(
          target,
        );

      const buildState =
        createGoldStandardDatasetState({
          target,
          reviewers:
            defaultReviewers,
          timestamp:
            new Date()
              .toISOString(),
        });

      saveGoldStandardBuildState(
        buildState,
      );
      setTargets(
        nextTargets,
      );
      setSelectedId(
        target.fragranceId,
      );
      setNotice(
        `Created dataset target ${target.brand} ${target.name} with two independent calibration drafts.`,
      );
    };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          OLFACTUS Knowledge Infrastructure
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Gold Standard Dataset Builder
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
          Create real fragrance reference targets and advance them through the existing governed laboratory pipeline. The builder creates workflow records only; calibration values must still be authored and evidenced by reviewers.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
          <h2 className="text-xl font-semibold text-white">
            Add reference target
          </h2>

          <div className="mt-5 space-y-4">
            <Input
              label="Fragrance ID"
              value={
                form.fragranceId
              }
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  fragranceId:
                    value,
                })
              }
            />
            <Input
              label="Brand"
              value={
                form.brand
              }
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  brand:
                    value,
                })
              }
            />
            <Input
              label="Fragrance"
              value={
                form.name
              }
              onChange={(
                value,
              ) =>
                setForm({
                  ...form,
                  name:
                    value,
                })
              }
            />

            <button
              type="button"
              onClick={
                createTarget
              }
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black"
            >
              Create dataset target
            </button>
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Dataset pipeline
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Select a reference target to inspect its current governed stage.
              </p>
            </div>

            <select
              value={
                selectedId
              }
              onChange={(
                event,
              ) =>
                setSelectedId(
                  event.target.value,
                )
              }
              className="min-w-[280px] rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
            >
              {targets.length ===
                0 && (
                <option value="">
                  No targets yet
                </option>
              )}
              {targets.map(
                (target) => (
                  <option
                    key={
                      target.fragranceId
                    }
                    value={
                      target.fragranceId
                    }
                  >
                    {target.brand} — {target.name}
                  </option>
                ),
              )}
            </select>
          </div>

          {state ? (
            <PipelineState
              state={
                state
              }
            />
          ) : (
            <div className="mt-6 rounded-2xl border border-white/10 p-6 text-sm text-white/45">
              Create a target to begin.
            </div>
          )}
        </div>
      </section>

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function PipelineState({
  state,
}: {
  state:
    NonNullable<
      ReturnType<
        typeof loadGoldStandardBuildState
      >
    >;
}) {
  const stage =
    determineGoldStandardDatasetStage(
      state,
    );

  const stages = [
    "authoring",
    "review",
    "consensus",
    "certification",
    "registry",
    "fingerprints",
    "promotion",
    "activation",
  ];

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-white/35">
          Current stage
        </p>
        <p className="mt-2 text-2xl font-semibold capitalize text-white">
          {stage}
        </p>
        <p className="mt-2 text-sm text-white/45">
          {state.target.brand} {state.target.name}
        </p>
      </div>

      <div className="mt-5 space-y-3">
        {stages.map(
          (
            item,
            index,
          ) => {
            const currentIndex =
              stages.indexOf(
                stage,
              );

            return (
              <div
                key={
                  item
                }
                className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3"
              >
                <span className="text-sm capitalize text-white/70">
                  {item}
                </span>
                <span className="text-xs font-semibold text-white">
                  {index <
                  currentIndex
                    ? "COMPLETE"
                    : index ===
                        currentIndex
                      ? "CURRENT"
                      : "PENDING"}
                </span>
              </div>
            );
          },
        )}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 p-4 text-sm leading-6 text-white/50">
        Calibration values are intentionally not created here. Open the Reference Laboratory to complete the two reviewer drafts with real scores, rationale, confidence, and evidence before advancing.
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/35">
        {label}
      </span>
      <input
        value={
          value
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none"
      />
    </label>
  );
}
