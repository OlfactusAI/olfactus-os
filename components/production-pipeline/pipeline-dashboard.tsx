"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  createProductionActivationPackage,
  createProductionPromotionPackage,
  approveProductionPromotion,
} from "@/lib/production-pipeline/pipeline";
import {
  loadProductionPromotions,
  saveProductionActivationPackage,
  saveProductionPromotion,
} from "@/lib/production-pipeline/storage";
import {
  loadReferenceRegistry,
  saveReferenceRegistry,
} from "@/lib/reference-registry/storage";
import {
  addRegistryTimelineEvent,
} from "@/lib/reference-registry/registry";
import type {
  ReferenceProductionPromotionPackage,
} from "@/lib/production-pipeline/types";

const approver =
  "production:reference-admin";

export function PipelineDashboard() {
  const [
    promotions,
    setPromotions,
  ] =
    useState<
      ReferenceProductionPromotionPackage[]
    >([]);

  const [
    notice,
    setNotice,
  ] =
    useState("");

  useEffect(
    () => {
      setPromotions(
        loadProductionPromotions(),
      );
    },
    [],
  );

  const scanRegistry =
    () => {
      const records =
        loadReferenceRegistry();

      let next = [
        ...promotions,
      ];

      for (
        const record
        of records
      ) {
        const promotion =
          createProductionPromotionPackage({
            record,
            timestamp:
              new Date()
                .toISOString(),
          });

        next = [
          ...next.filter(
            (item) =>
              item.promotionId !==
              promotion.promotionId,
          ),
          promotion,
        ];

        saveProductionPromotion(
          promotion,
        );
      }

      setPromotions(
        next,
      );
      setNotice(
        `Compatibility scan complete · ${next.length} promotion package${next.length === 1 ? "" : "s"}.`,
      );
    };

  const approve =
    (
      promotion:
        ReferenceProductionPromotionPackage,
    ) => {
      try {
        const timestamp =
          new Date()
            .toISOString();

        const approved =
          approveProductionPromotion({
            promotion,
            approver,
            timestamp,
          });

        const activation =
          createProductionActivationPackage({
            promotion:
              approved,
            actor:
              approver,
            timestamp,
          });

        saveProductionPromotion(
          approved,
        );
        saveProductionActivationPackage(
          activation,
        );

        setPromotions(
          loadProductionPromotions(),
        );

        const records =
          loadReferenceRegistry().map(
            (record) =>
              record.referenceId ===
              approved.referenceId
                ? addRegistryTimelineEvent({
                    record: {
                      ...record,
                      lifecycle:
                        "production-ready",
                      productionStatus:
                        "approved",
                    },
                    type:
                      "production-approved",
                    actor:
                      approver,
                    timestamp,
                    detail:
                      `Promotion ${approved.promotionId} approved and activation package ${activation.activationId} generated.`,
                  })
                : record,
          );

        saveReferenceRegistry(
          records,
        );
        setNotice(
          `Production promotion approved · activation package generated · runtime engines unchanged.`,
        );
      } catch (
        error
      ) {
        setNotice(
          error instanceof Error
            ? error.message
            : "Unable to approve production promotion.",
        );
      }
    };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-white/40">
          OLFACTUS Production Governance
        </p>
        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Production Promotion Pipeline
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Certified references must pass explicit runtime compatibility checks before an activation package can be generated. This release does not write directly into live engines.
            </p>
          </div>
          <button
            type="button"
            onClick={
              scanRegistry
            }
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black"
          >
            Scan registry
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {promotions.length ===
          0 && (
          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-8 text-sm text-white/50">
            No promotion packages yet.
          </div>
        )}

        {promotions.map(
          (promotion) => (
            <article
              key={
                promotion.promotionId
              }
              className="rounded-[1.75rem] border border-white/10 bg-white/[0.025] p-5 md:p-7"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <p className="text-xs text-white/35">
                    {promotion.referenceId}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    {promotion.fragranceId}
                  </h2>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium capitalize text-white/65">
                  {promotion.status}
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {promotion.checks.map(
                  (check) => (
                    <div
                      key={
                        check.check
                      }
                      className="flex items-center justify-between gap-4 rounded-xl border border-white/10 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white/70">
                          {check.check}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {check.detail}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-white">
                        {check.passed
                          ? "PASS"
                          : "BLOCK"}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {promotion.blockers.length >
                0 && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/35">
                    Blockers
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-white/55">
                    {promotion.blockers.map(
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
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  approve(
                    promotion,
                  )
                }
                disabled={
                  promotion.status !==
                  "ready"
                }
                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-35"
              >
                Approve + generate activation package
              </button>
            </article>
          ),
        )}
      </section>

      {notice && (
        <div className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white/70">
          {notice}
        </div>
      )}
    </div>
  );
}
