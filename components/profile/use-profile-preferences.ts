"use client";

import { useOlfactusOS } from "@/components/os/olfactus-os-provider";

export function useProfilePreferences() {
  const {
    preferences,
    updatePreference,
    hydrated,
  } = useOlfactusOS();

  return {
    preferences,
    updatePreference,
    hydrated,
  };
}
