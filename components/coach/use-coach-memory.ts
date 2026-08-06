"use client";

import { useCallback, useEffect, useState } from "react";

import {
  defaultCoachMemory,
  type CoachGoal,
  type CoachMemory,
} from "@/lib/intelligence/collection-coach-engine";

const STORAGE_KEY = "olfactus.coach.memory.v1";

export function useCoachMemory() {
  const [memory, setMemory] =
    useState<CoachMemory>(defaultCoachMemory);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMemory({
          ...defaultCoachMemory,
          ...(JSON.parse(saved) as Partial<CoachMemory>),
        });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(memory),
      );
    }
  }, [hydrated, memory]);

  const completeAction = useCallback(
    (actionId: string) => {
      setMemory((current) => ({
        ...current,
        completedActionIds: Array.from(
          new Set([
            ...current.completedActionIds,
            actionId,
          ]),
        ),
      }));
    },
    [],
  );

  const reopenAction = useCallback(
    (actionId: string) => {
      setMemory((current) => ({
        ...current,
        completedActionIds:
          current.completedActionIds.filter(
            (id) => id !== actionId,
          ),
      }));
    },
    [],
  );

  const dismissAction = useCallback(
    (actionId: string) => {
      setMemory((current) => ({
        ...current,
        dismissedActionIds: Array.from(
          new Set([
            ...current.dismissedActionIds,
            actionId,
          ]),
        ),
      }));
    },
    [],
  );

  const setActiveGoal = useCallback(
    (goal: CoachGoal) => {
      setMemory((current) => ({
        ...current,
        activeGoal: goal,
      }));
    },
    [],
  );

  const rememberRecommendation = useCallback(
    (fragranceId: string) => {
      setMemory((current) => ({
        ...current,
        recentRecommendationIds: [
          fragranceId,
          ...current.recentRecommendationIds.filter(
            (id) => id !== fragranceId,
          ),
        ].slice(0, 7),
      }));
    },
    [],
  );

  return {
    memory,
    hydrated,
    completeAction,
    reopenAction,
    dismissAction,
    setActiveGoal,
    rememberRecommendation,
  };
}
