"use client";

import { useState } from "react";
import { ArrowRight, BrainCircuit, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useOlfactusOS } from "@/components/os/olfactus-os-provider";
import {
  defaultProfilePreferences,
  type ProfilePreferences,
} from "@/lib/intelligence/profile-intelligence-engine";

export function OlfactusOnboarding() {
  const {
    onboardingComplete,
    completeOnboarding,
    hydrated,
  } = useOlfactusOS();
  const [step, setStep] = useState(0);
  const [draft, setDraft] =
    useState<ProfilePreferences>(
      defaultProfilePreferences,
    );

  if (!hydrated || onboardingComplete) return null;

  const steps = [
    {
      title: "Define your collection goal.",
      content: (
        <select
          className="os-onboarding-control"
          value={draft.preferredRole}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              preferredRole:
                event.target.value as ProfilePreferences["preferredRole"],
            }))
          }
        >
          <option value="office">Versatile office rotation</option>
          <option value="signature">Build signature identity</option>
          <option value="creative">Explore artistic fragrances</option>
          <option value="formal">Strengthen formal coverage</option>
        </select>
      ),
    },
    {
      title: "Set your preferred season.",
      content: (
        <select
          className="os-onboarding-control"
          value={draft.preferredSeason}
          onChange={(event) =>
            setDraft((current) => ({
              ...current,
              preferredSeason:
                event.target.value as ProfilePreferences["preferredSeason"],
            }))
          }
        >
          <option value="spring">Spring</option>
          <option value="summer">Summer</option>
          <option value="fall">Fall</option>
          <option value="winter">Winter</option>
        </select>
      ),
    },
    {
      title: "Calibrate budget and risk.",
      content: (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="os-onboarding-field">
            <span>Budget ceiling</span>
            <input
              type="number"
              value={draft.budgetCeiling}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  budgetCeiling: Number(
                    event.target.value,
                  ),
                }))
              }
            />
          </label>
          <label className="os-onboarding-field">
            <span>Risk tolerance</span>
            <input
              type="number"
              min={0}
              max={100}
              value={draft.riskTolerance}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  riskTolerance: Number(
                    event.target.value,
                  ),
                }))
              }
            />
          </label>
        </div>
      ),
    },
  ];

  return (
    <div className="os-onboarding-backdrop">
      <section className="os-onboarding-card">
        <div className="flex items-center gap-3">
          <span className="os-onboarding-mark">
            <BrainCircuit size={19} />
          </span>
          <div>
            <p className="text-[.62rem] font-bold uppercase tracking-[.2em] text-[var(--gold)]">
              OLFACTUS OS 1.0
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Intelligence calibration
            </p>
          </div>
        </div>

        <p className="mt-8 text-xs text-[var(--muted)]">
          Step {step + 1} of {steps.length}
        </p>
        <h1 className="display-serif mt-3 text-5xl">
          {steps[step].title}
        </h1>
        <div className="mt-7">{steps[step].content}</div>

        <div className="mt-8 flex justify-end">
          {step < steps.length - 1 ? (
            <Button
              variant="primary"
              onClick={() => setStep(step + 1)}
            >
              Continue
              <ArrowRight size={15} />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() =>
                completeOnboarding(draft)
              }
            >
              <Check size={15} />
              Generate intelligence profile
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
