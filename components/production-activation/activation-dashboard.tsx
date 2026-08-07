"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  activateProductionReference,
  validateProductionActivationInput,
} from "@/lib/production-activation/bridge";
import {
  rollbackActivatedReference,
} from "@/lib/production-activation/rollback";
import {
  appendProductionActivationAudit,
  loadRuntimeReferences,
  removeRuntimeReference,
  saveRuntimeReference,
} from "@/lib/production-activation/storage";
import {
  loadProductionActivationPackages,
  loadProductionPromotions,
  saveProductionPromotion,
} from "@/lib/production-pipeline/storage";
import {
  loadProductionFingerprintBundles,
} from "@/lib/production-fingerprints/storage";
import {
  loadReferenceRegistry,
  saveReferenceRegistry,
} from "@/lib/reference-registry/storage";

const operator =
  "production:activation-admin";

export function ActivationDashboard() {
  const [
    selectedActivationId,
    setSelectedActivationId,
  ] =
    useState("");

  const [
    notice,
    setNotice,
  ] =
    useState("");

  const [
    refresh,
    setRefresh,
  ] =
    useState(0);

  const activations =
    useMemo(
      () =>
        loadProductionActivationPackages(),
      [
        refresh,
      ],
    );

  const promotions =
    useMemo(
      () =>
        loadProductionPromotions(),
      [
        refresh,
      ],
    );

  const registry =
    useMemo(
      () =>
        loadReferenceRegistry(),
      [
        refresh,
      ],
    );

  const bundles =
    useMemo(
      () =>
        loadProductionFingerprintBundles(),
      [
        refresh,
      ],
    );

  const runtime =
    useMemo(
      () =>
        loadRuntimeReferences(),
      [
        refresh,
      ],
    );

  useEffect(
    () => {
      if (
        !selectedActivationId &&
        activations[
          0
        ]
      ) {
        setSelectedActivationId(
          activations[
            0
          ].activationId,
        );
      }
    },
    [
      activations,
      selectedActivationId,
    ],
  );

  const activation =
    activations.find(
      (item) =>
        item.activationId ===
        selectedActivationId,
    );

  const promotion =
    activation
      ? promotions.find(
          (item) =>
            item.promotionId ===
            activation.promotionId,
        )
      : undefined;

  const record =
    activation
      ? registry.find(
          (item) =>
            item.referenceId ===
            activation.referenceId,
        )
      : undefined;

  const bundle =
    activation
      ? bundles.find(
          (item) =>
            item.referenceId ===
              activation.referenceId &&
            item.versionId ===
              activation.versionId,
        )
      : undefined;

  const runtimeEntity =
    activation
      ? runtime.find(
          (item) =>
            item.referenceId ===
            activation.referenceId,
        )
      : undefined;

  const validation =
    activation &&
    promotion &&
    record &&
    bundle
      ? validateProductionActivationInput({
          activationPackage:
            activation,
          promotion,
          registryRecord:
            record,
          fingerprintBundle:
            bundle,
        })
      : undefined;

  const activate =
    () => {
      if (
        !activation ||
        !promotion ||
        !record ||
        !bundle
      ) {
        return;
      }

      try {
        const timestamp =
          new Date()
            .toISOString();

        const result =
          activateProductionReference({
            activationPackage:
              activation,
            promotion,
            registryRecord:
              record,
            fingerprintBundle:
              bundle,
            actor:
              operator,
            timestamp,
          });

        saveRuntimeReference(
          result.runtimeEntity,
        );
        saveProductionPromotion(
          result.promotion,
        );
        appendProductionActivationAudit(
          result.audit,
        );

        saveReferenceRegistry(
          registry.map(
            (item) =>
              item.referenceId ===
              result.registryRecord
                .referenceId
                ? result.registryRecord
                : item,
          ),
        );

        setNotice(
          `Activated ${result.runtimeEntity.runtimeReferenceId}. Runtime reference published without modifying certified source artifacts.`,
        );
        setRefresh(
          (value) =>
            value +
            1,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof
            Error
            ? error.message
            : "Activation failed.",
        );
      }
    };

  const rollback =
    () => {
      if (
        !runtimeEntity ||
        !promotion ||
        !record
      ) {
        return;
      }

      const reason =
        window.prompt(
          "Enter rollback reason:",
        ) ??
        "";

      try {
        const timestamp =
          new Date()
            .toISOString();

        const result =
          rollbackActivatedReference({
            runtimeEntity,
            registryRecord:
              record,
            promotion,
            actor:
              operator,
            timestamp,
            reason,
          });

        removeRuntimeReference(
          runtimeEntity.referenceId,
        );
        saveProductionPromotion(
          result.promotion,
        );
        appendProductionActivationAudit(
          result.audit,
        );

        saveReferenceRegistry(
          registry.map(
            (item) =>
              item.referenceId ===
              result.registryRecord
                .referenceId
                ? result.registryRecord
                : item,
          ),
        );

        setNotice(
          "Runtime reference rolled back and removed from the activation registry.",
        );
        setRefresh(
          (value) =>
            value +
            1,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof
            Error
            ? error.message
            : "Rollback failed.",
        );
      }
    };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          OLFACTUS Production Intelligence
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Production Activation Bridge
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Publish approved, fully fingerprinted Gold Standard references into a runtime-safe activation registry. Source calibration, consensus, certificates, and fingerprint bundles remain immutable inputs.
            </p>
          </div>

          <div className="min-w-[300px]">
            <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-white/40">
              Activation package
            </label>
            <select
              value={
                selectedActivationId
              }
              onChange={(
                event,
              ) => {
                setSelectedActivationId(
                  event.target.value,
                );
                setNotice("");
              }}
              className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            >
              {activations.length ===
                0 && (
                <option value="">
                  No activation packages available
                </option>
              )}
              {activations.map(
                (item) => (
                  <option
                    key={
                      item.activationId
                    }
                    value={
                      item.activationId
                    }
                  >
                    {item.fragranceId} · {item.versionId}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </section>

      {!activation ? (
        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8 text-sm text-white/50">
          Approve a production promotion first so an activation package exists.
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <StatusCard
              label="Promotion"
              value={
                promotion?.status ??
                "missing"
              }
            />
            <StatusCard
              label="Registry"
              value={
                record?.productionStatus ??
                "missing"
              }
            />
            <StatusCard
              label="Fingerprints"
              value={
                bundle
                  ? `${bundle.overallCompleteness}%`
                  : "missing"
              }
            />
            <StatusCard
              label="Runtime"
              value={
                runtimeEntity
                  ? "active"
                  : "inactive"
              }
            />
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
            <h2 className="text-xl font-semibold text-white">
              Activation gate
            </h2>

            {validation ? (
              <div className="mt-5">
                <p className="text-sm font-semibold text-white">
                  {validation.eligible
                    ? "READY FOR RUNTIME ACTIVATION"
                    : "ACTIVATION BLOCKED"}
                </p>

                {validation.blockers.length >
                  0 && (
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-white/55">
                    {validation.blockers.map(
                      (blocker) => (
                        <li
                          key={
                            blocker
                          }
                        >
                          • {blocker}
                        </li>
                      ),
                    )}
                  </ul>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={
                      activate
                    }
                    disabled={
                      !validation.eligible ||
                      Boolean(
                        runtimeEntity,
                      )
                    }
                    className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {runtimeEntity
                      ? "Reference active"
                      : "Activate runtime reference"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      rollback
                    }
                    disabled={
                      !runtimeEntity
                    }
                    className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-white/75 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Roll back activation
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-white/50">
                The activation package is missing a matching promotion, registry record, or fingerprint bundle.
              </p>
            )}
          </section>

          {runtimeEntity && (
            <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7">
              <h2 className="text-xl font-semibold text-white">
                Runtime-safe reference
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <StatusCard
                  label="Reference"
                  value={
                    runtimeEntity.referenceId
                  }
                />
                <StatusCard
                  label="Version"
                  value={
                    runtimeEntity.versionId
                  }
                />
                <StatusCard
                  label="Fingerprints"
                  value={
                    String(
                      runtimeEntity
                        .fingerprints
                        .length,
                    )
                  }
                />
                <StatusCard
                  label="Consensus"
                  value={
                    runtimeEntity
                      .sourceConsensusId
                  }
                />
              </div>
            </section>
          )}
        </>
      )}

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}

function StatusCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <p className="break-all text-sm font-semibold capitalize text-white">
        {value}
      </p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
    </div>
  );
}
