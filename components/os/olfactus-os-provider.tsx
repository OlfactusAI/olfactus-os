"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  defaultProfilePreferences,
  type ProfilePreferences,
} from "@/lib/intelligence/profile-intelligence-engine";

const PREF_KEY = "olfactus.profile.preferences.v1";
const ONBOARD_KEY = "olfactus.os.onboarding.v1";

interface OlfactusOSContextValue {
  preferences: ProfilePreferences;
  updatePreference: <K extends keyof ProfilePreferences>(
    key: K,
    value: ProfilePreferences[K],
  ) => void;
  onboardingComplete: boolean;
  completeOnboarding: (
    preferences: ProfilePreferences,
  ) => void;
  resetOnboarding: () => void;
  hydrated: boolean;
}

const OlfactusOSContext =
  createContext<OlfactusOSContextValue | null>(null);

export function OlfactusOSProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, setPreferences] =
    useState<ProfilePreferences>(
      defaultProfilePreferences,
    );
  const [onboardingComplete, setOnboardingComplete] =
    useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedPreferences =
        window.localStorage.getItem(PREF_KEY);
      const onboarding =
        window.localStorage.getItem(ONBOARD_KEY);

      if (savedPreferences) {
        setPreferences({
          ...defaultProfilePreferences,
          ...(JSON.parse(
            savedPreferences,
          ) as Partial<ProfilePreferences>),
        });
      }

      setOnboardingComplete(onboarding === "complete");
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      PREF_KEY,
      JSON.stringify(preferences),
    );
  }, [hydrated, preferences]);

  const value = useMemo<OlfactusOSContextValue>(
    () => ({
      preferences,
      updatePreference(key, value) {
        setPreferences((current) => ({
          ...current,
          [key]: value,
        }));
      },
      onboardingComplete,
      completeOnboarding(nextPreferences) {
        setPreferences(nextPreferences);
        setOnboardingComplete(true);
        window.localStorage.setItem(
          ONBOARD_KEY,
          "complete",
        );
      },
      resetOnboarding() {
        setOnboardingComplete(false);
        window.localStorage.removeItem(ONBOARD_KEY);
      },
      hydrated,
    }),
    [hydrated, onboardingComplete, preferences],
  );

  return (
    <OlfactusOSContext.Provider value={value}>
      {children}
    </OlfactusOSContext.Provider>
  );
}

export function useOlfactusOS() {
  const value = useContext(OlfactusOSContext);
  if (!value) {
    throw new Error(
      "useOlfactusOS must be used within OlfactusOSProvider",
    );
  }
  return value;
}
